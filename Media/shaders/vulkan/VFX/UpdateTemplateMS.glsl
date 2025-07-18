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

const uint vert_per_particle = 4;
const uint prim_per_particle = 2;

const uint total_particle_count = 32;
const uint total_vertices		= total_particle_count * vert_per_particle;
const uint total_primitives		= total_particle_count * prim_per_particle;

layout(local_size_x = total_particle_count, local_size_y = 1, local_size_z = 1) in;
layout(triangles, max_vertices = total_vertices, max_primitives = total_primitives) out;

shared uint AliveCount;
shared uint DeadCount;

taskPayloadSharedEXT struct
{
    float deltaTime;
} InPayload;

layout(location = 0) out VertexOutput
{
    vec4 color;
} vertexOutput[];

void UpdateParticle(inout Particle particle, float dt)
{
    vec3 velocity       = particle.velocity;
    vec3 acceleration   = vec3(0.0, 0.0, 0.0);
    vec3 force          = vec3(0.0, 0.0, 0.0);

<<UpdateContext>>

<<Update>>

    acceleration += force * particle.inverseMass;

    particle.velocity  = velocity + acceleration * dt;
    particle.position += particle.velocity * dt;
    particle.life -= dt;
}

bool ResolveParticle(inout Particle particle, in uint particleIndex, float dt)
{
    if(particle.life <= 0.0)
    {
        DeadIndexBuffer.data[atomicAdd(CounterBuffer.data.DeadCount, 1)] = particleIndex;
        return false;
    }


    UpdateParticle(particle, dt);
    AliveIndexBuffer.data[CounterBuffer.data.MaxParticles + atomicAdd(CounterBuffer.data.AliveCount, 1)] = particleIndex;
    
    return true;
}

void main()
{
    uint gId = gl_GlobalInvocationID.x;
    if(gId >= CounterBuffer.data.EmitCount)
    {
        return;
    }

    if(gId.x == 0)
    {
        AliveCount = 0;
        DeadCount = 0;
    }

    uint particleIndex = AliveIndexBuffer.data[gId];
    Particle particle = ParticleBuffer.data[particleIndex];

    if(!ResolveParticle(particle, particleIndex, InPayload.deltaTime))
        return;

    barrier();
    
    SetMeshOutputsEXT(CounterBuffer.data.AliveCount * vert_per_particle, CounterBuffer.data.AliveCount * prim_per_particle);
	
    mat4 localToViewSpace =  Multiply( GetTranslationMatrix(-ViewConstants.ViewPosition), ViewConstants.ViewMatrix );
 
    ParticleBuffer.data[particleIndex] = particle;

    mat4 rotation = rotationMatrix( vec3(0.0, 0.0, 1.0), particle.rotation );
    vec3 position = Multiply( vec4(particle.position, 1.0), localToViewSpace ).xyz;

    uint vId = gId * 4;
    for(uint Iter = 0; Iter < 4; Iter++)
    {
        vec2 quadUV = vec2(Iter & 1, Iter >> 1);
        vec2 quadPos = vec2( (Iter - 0.5)*2, -(Iter - 0.5)*2);

        vec3 rotatedPosition = position + Multiply( vec4(quadUV * particle.size, 0.0, 1.0), rotation ).xyz;
        vec4 finalPosition = ViewConstants.ProjectionMatrix * vec4(rotatedPosition, 1.0);

        vertexOutput[vId + Iter].color = particle.color;
        
        gl_MeshVerticesEXT[vId + Iter].gl_Position = finalPosition;
    }

    uint pId = gId * 2;

    gl_PrimitiveTriangleIndicesEXT[pId    ] = uvec3(vId    , vId + 1, vId + 2);
    gl_PrimitiveTriangleIndicesEXT[pId + 1] = uvec3(vId + 2, vId + 3, vId + 1);
}