#version 450

#extension GL_EXT_shader_16bit_storage	: require
#extension GL_EXT_shader_8bit_storage	: require
#extension GL_EXT_mesh_shader			: require
#extension GL_GOOGLE_include_directive	: require

#extension GL_EXT_debug_printf : require

#include "Common.glsl"
#include "VFX/Common.glsl"
#include "Utils/Random.glsl"
#include "Utils/Noise.glsl"

layout(push_constant) uniform _PushConstant
{
    float RandomSeed;
    float DeltaTime;
    bool bResetCounter;
    bool bEmitRequest;
} PushConstant;

taskPayloadSharedEXT struct
{
    float deltaTime;
} outPayload;

void Initialize(uint particleIndex, float seed)
{
    Particle particle;

<<Initialize>>

    particle.null = float(gl_LocalInvocationID.x);
    ParticleBuffer.data[particleIndex] = particle;
}

const uint AS_LOCAL_SIZE = 32;
const uint MS_LOCAL_SIZE = 32;

layout(local_size_x = AS_LOCAL_SIZE, local_size_y = 1, local_size_z = 1) in;

void main()
{
    // Reset Dead Index Buffer
    if(PushConstant.bResetCounter == true)
    {
        uint batchSize = (CounterBuffer.data.MaxParticles + AS_LOCAL_SIZE - 1) / AS_LOCAL_SIZE;

        for(uint Iter = 0; Iter < batchSize; Iter++)
        {
            uint Index = Iter * AS_LOCAL_SIZE + gl_LocalInvocationID.x;

            if(Index < CounterBuffer.data.MaxParticles)
            {
                DeadIndexBuffer.data[Index] = Index;
            }
        }

        if(gl_LocalInvocationID.x == 0)
        {
            CounterBuffer.data.AccumTime = 0.0;
            CounterBuffer.data.AliveCount = 0;
            CounterBuffer.data.EmitCount = 0;
            CounterBuffer.data.DeadCount = CounterBuffer.data.MaxParticles;
        }

        barrier();
    }

    // Copy Alive Indices to Emit Indices
    {
        uint CopyBatchSize  = (CounterBuffer.data.AliveCount + AS_LOCAL_SIZE - 1) / AS_LOCAL_SIZE;

        for(uint Iter = 0; Iter < CopyBatchSize; Iter++)
        {
            uint Index = Iter * AS_LOCAL_SIZE + gl_LocalInvocationID.x;

            if(Index < CounterBuffer.data.AliveCount)
            {
                uint particleIndex = AliveIndexBuffer.data[CounterBuffer.data.MaxParticles + Index];
                AliveIndexBuffer.data[Index] = particleIndex;
            }
        }

        barrier();
    }

    //  Update Emit Context
    {
        if(gl_LocalInvocationID.x == 0)
        {
            CounterBuffer.data.EmitCount = CounterBuffer.data.AliveCount;
            CounterBuffer.data.AliveCount = 0;

            CounterBuffer.data.AccumTime += PushConstant.DeltaTime;
            if(CounterBuffer.data.AccumTime >= <<SpawnInterval>> || PushConstant.bEmitRequest == true)
            {
                CounterBuffer.data.AccumTime = 0.0;
            }
        }

        barrier();
    }

    uint SpawnCount = <<SpawnCount>>;
    
    // Initialize
    if(CounterBuffer.data.AccumTime == 0.0)
    {
        float seed = PushConstant.RandomSeed + gl_GlobalInvocationID.x;
        uint spawnBatchSize  = (SpawnCount + AS_LOCAL_SIZE - 1) / AS_LOCAL_SIZE;

        uint dIndex = CounterBuffer.data.DeadCount;
        uint eIndex = CounterBuffer.data.EmitCount;

        for(uint Iter = 0; Iter < spawnBatchSize; Iter++)
        {
            uint Index = Iter * AS_LOCAL_SIZE + gl_LocalInvocationID.x;

            if(Index < SpawnCount)
            {
                uint particleIndex = DeadIndexBuffer.data[dIndex - Index - 1];
                Initialize(particleIndex, seed + Index);
                AliveIndexBuffer.data[eIndex + Index] = particleIndex;
            }
        }

        barrier();
    }

    // Dispatch Mesh Shaders
    if(gl_LocalInvocationID.x == 0)
    {
        CounterBuffer.data.EmitCount += SpawnCount;
        CounterBuffer.data.DeadCount -= SpawnCount;
        
        uint EmitCount = CounterBuffer.data.EmitCount;
        uint DispatchCount = (EmitCount + MS_LOCAL_SIZE - 1) / MS_LOCAL_SIZE;

        outPayload.deltaTime = PushConstant.DeltaTime;

        EmitMeshTasksEXT(DispatchCount, 1, 1);
    }
}