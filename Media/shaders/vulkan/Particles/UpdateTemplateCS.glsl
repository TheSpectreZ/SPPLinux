#version 450
#extension GL_GOOGLE_include_directive: require
#extension GL_EXT_debug_printf : require

#include "Common.glsl"
#include "Utils/Random.glsl"
#include "Utils/Noise.glsl"
#include "Particles/Common.glsl"

layout(std430) buffer;

layout(set = 1, binding = 0) readonly uniform _DrawConstants
{
    mat4 LocalToWorldScaleRotation;
#if SUPPORT_DOUBLE
    dvec3 Translation;
#else
    vec3 Translation;
#endif
} DrawConstants;

layout(set = 2, binding = 0) buffer _ParticleBuffer
{
	Particle data[];
} ParticleBuffer;

layout(set = 2, binding = 1) buffer _CounterBuffer
{
    Counter data;
} CounterBuffer;

layout(set = 2, binding = 2) buffer _DeadIndexBuffer
{
	uint data[];
} DeadIndexBuffer;

layout(set = 2, binding = 3) buffer _AliveIndexBuffer
{
	uint data[];
} AliveIndexBuffer;

const uint LOCAL_SIZE = 128;
layout(local_size_x = LOCAL_SIZE, local_size_y = 1, local_size_z = 1) in;

layout(push_constant) uniform _PushConstant
{
    float RandomSeed;
    float DeltaTime;
    uint  bEmitRequest;
    uint  bReset;
} PushConstant;

void Initialize(uint particleIndex, float seed)
{
    Particle particle;
    particle.color      = vec4(1.0, 1.0, 1.0, 1.0);
    particle.position   = vec3(0.0, 0.0, 0.0);
    particle.velocity   = vec3(0.0, 0.0, 0.0);
    particle.size       = vec2(1.0, 1.0);
    particle.life       = 1.0;
    particle.rotation   = 0.0;
    particle.inverseMass = 1.0;

<<PARTICLE_INIT>>


    ParticleBuffer.data[particleIndex] = particle;
}

bool Update(inout Particle particle, in uint particleIndex, float dt)
{
    if(particle.life <= 0.0)
    {
        uint deadIndex = atomicAdd(CounterBuffer.data.DeadCount, 1);
        DeadIndexBuffer.data[deadIndex] = particleIndex;
        return false;
    }

    uint aliveIndex = atomicAdd(CounterBuffer.data.AliveCount, 1);
    AliveIndexBuffer.data[CounterBuffer.data.MaxParticles + aliveIndex] = particleIndex;
    
    vec3 velocity       = particle.velocity;
    vec3 acceleration   = vec3(0.0, 0.0, 0.0);
    vec3 force          = vec3(0.0, 0.0, 0.0);

<<PARTICLE_UPDATE_CONTEXT>>

<<PARTICLE_UPDATE>>

    acceleration += force * particle.inverseMass;

    particle.velocity  = velocity + acceleration * dt;
    particle.position += particle.velocity * dt;
    particle.life     -= dt;

    return true;
}

void main()
{
    uint gId = gl_LocalInvocationID.x;
    uint MaxParticles = CounterBuffer.data.MaxParticles;

    float SpawnInterval = 0.0;
    uint SpawnCount = 0;

    <<PARTICLE_SPAWN>>

    uint SPAWN_COUNT = max(0, min(MaxParticles, SpawnCount));
 
    if(PushConstant.bReset == 1)
    {
        uint batchSize = (MaxParticles + LOCAL_SIZE - 1) / LOCAL_SIZE;

        for(uint Iter = 0; Iter < batchSize; Iter++)
        {
            uint Index = Iter * LOCAL_SIZE + gId;

            if(Index < MaxParticles)
            {
                DeadIndexBuffer.data[Index] = Index;

                AliveIndexBuffer.data[Index] = 0;
                AliveIndexBuffer.data[MaxParticles + Index] = 0;
            }
        }

        if(gId == 0)
        {
            CounterBuffer.data.AccumTime = 0.0;
            CounterBuffer.data.AliveCount = 0;
            CounterBuffer.data.EmitCount = 0;
            CounterBuffer.data.DeadCount = MaxParticles;
        }

        barrier();
    }

    
    {
        uint batchSize = (CounterBuffer.data.AliveCount + LOCAL_SIZE - 1) / LOCAL_SIZE;

        for(uint Iter = 0; Iter < batchSize; Iter++)
        {
            uint Index = Iter * LOCAL_SIZE + gId;

            if(Index < MaxParticles)
            {
                uint particle = AliveIndexBuffer.data[MaxParticles + Index];
                AliveIndexBuffer.data[Index] = particle;
            }
        }

        barrier();
    }
    
    {
        if(gId == 0)
        {
            CounterBuffer.data.EmitCount = CounterBuffer.data.AliveCount;
            CounterBuffer.data.AliveCount = 0;

            CounterBuffer.data.AccumTime += PushConstant.DeltaTime;

            if(CounterBuffer.data.AccumTime >= SpawnInterval || PushConstant.bEmitRequest == 1)
            {
                CounterBuffer.data.AccumTime = 0.0;
            }
        }
        
        barrier();
    }

    if(CounterBuffer.data.AccumTime == 0.0)
    {
        float seed = PushConstant.RandomSeed + gId;

        uint batchSize = (SPAWN_COUNT + LOCAL_SIZE - 1) / LOCAL_SIZE;

        for(uint Iter = 0; Iter < batchSize; Iter++)
        {
            uint Index = Iter * LOCAL_SIZE + gId;

            if(Index < SPAWN_COUNT)
            {
                uint particle = DeadIndexBuffer.data[CounterBuffer.data.DeadCount - Index - 1];
                Initialize(particle, seed + Index);
                AliveIndexBuffer.data[CounterBuffer.data.EmitCount + Index] = particle;
            }
        }

        if(gId == 0)
        {
            CounterBuffer.data.EmitCount += SPAWN_COUNT;
            CounterBuffer.data.DeadCount -= SPAWN_COUNT;
        }

        barrier();
    }


    {
        uint batchSize = (CounterBuffer.data.EmitCount + LOCAL_SIZE - 1) / LOCAL_SIZE;

        for(uint Iter = 0; Iter < batchSize; Iter++)
        {
            uint Index = Iter * LOCAL_SIZE + gId;

            if(Index < CounterBuffer.data.EmitCount)
            {
                uint particleIndex = AliveIndexBuffer.data[Index];
                Particle particle = ParticleBuffer.data[particleIndex];
                
                if(!Update(particle, particleIndex, PushConstant.DeltaTime))
                    continue;
                
                ParticleBuffer.data[particleIndex] = particle;
            }
        }
    }
}