#version 450

#extension GL_EXT_shader_16bit_storage	: require
#extension GL_EXT_shader_8bit_storage	: require
#extension GL_EXT_mesh_shader			: require
#extension GL_GOOGLE_include_directive	: require

#include "Common.glsl"
#include "VFX/Common.glsl"
#include "Utils/Random.glsl"

layout(push_constant) uniform _PushConstant
{
    bool EmitRequest;
    float DeltaTime;
    float RandomSeed;
} PushConstant;

taskPayloadSharedEXT struct
{
    uint emitCount;
    float deltaTime;
} outPayload;

float GetSpawnInterval()
{
    return 0.010000;
}

uint GetSpawnCount()
{
    return 1;
}

void Initialize(uint particleIndex, float seed)
{
    Particle particle;

{
particle.life = 1.000000;
}

{
particle.rotation = 0.000000;
}

{
float theta = RandomFloat(seed, 0.0, 2*3.14);
float phi   = RandomFloat(seed + 0.32, 0.0, 3.14);
float radius = 3.000000;
float x = radius * sin(phi) * cos(theta);
float y = radius * sin(phi) * sin(theta);
float z = radius * cos(phi);
particle.position = vec3(1.000000, 1.000000, 1.000000) + vec3(x,y,z);
}

{
vec3 direction = RandomVec3(seed, true, vec3(1.000000, 1.000000, 1.000000), vec3(-1.000000, 1.000000, 1.000000));
float speed = 1.000000;
particle.velocity = normalize(direction) * speed * vec3(1.000000, 1.000000, 1.000000);
}

{
vec3 color = RandomVec3(seed, true, vec3(1.000000, 0.000000, 0.000000), vec3(0.000000, 1.000000, 0.000000));
float opacity = 1.000000;
particle.color = vec4(color * vec3(1.000000, 1.000000, 1.000000), opacity);
}

{
particle.size = RandomVec2(seed, false, vec2(0.500000, 0.500000), vec2(1.000000, 1.000000));
}

{
particle.inverseMass = 1.0 / max(0.001, 1.000000);
}

    ParticleBuffer.data[particleIndex] = particle;
}

const uint AS_LOCAL_SIZE = 128;
const uint MS_LOCAL_SIZE = 64;

layout(local_size_x = AS_LOCAL_SIZE, local_size_y = 1, local_size_z = 1) in;

void main()
{
	uint batchSize  = (CounterBuffer.data.AliveCount + AS_LOCAL_SIZE - 1) / AS_LOCAL_SIZE;
    uint batchIndex = gl_LocalInvocationID.x;

    for(uint Iter = 0; Iter < batchSize; Iter++)
    {
        uint Index = Iter + batchIndex * batchSize;

        if(Index < CounterBuffer.data.AliveCount)
        {
            uint particleIndex = AliveIndexBuffer.data[CounterBuffer.data.MaxParticles + Index];
            AliveIndexBuffer.data[Index] = particleIndex;
        }
    }

    barrier();

    if(gl_LocalInvocationID.x == 0)
    {
        float seed = PushConstant.RandomSeed + gl_GlobalInvocationID.x;
        
        CounterBuffer.data.EmitCount = CounterBuffer.data.AliveCount;
        CounterBuffer.data.AliveCount = 0;

        if( CounterBuffer.data.AccumTime >= GetSpawnInterval() || PushConstant.EmitRequest )
        {
            CounterBuffer.data.AccumTime = 0.0;

            for(uint i = 0; i < GetSpawnCount(); i++)
            {
                uint particleIndex = DeadIndexBuffer.data[--CounterBuffer.data.DeadCount];

                Initialize(particleIndex, seed);

                AliveIndexBuffer.data[ CounterBuffer.data.EmitCount++ ] = particleIndex;
            }
        }
        else
        {
            CounterBuffer.data.AccumTime += PushConstant.DeltaTime;
        }

        uint EmitCount = CounterBuffer.data.EmitCount;
        uint DispatchCount = (EmitCount + MS_LOCAL_SIZE - 1) / MS_LOCAL_SIZE;

        outPayload.emitCount = EmitCount;
        outPayload.deltaTime = PushConstant.DeltaTime;

        EmitMeshTasksEXT(DispatchCount, 1, 1);
    }
}