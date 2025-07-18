#version 450

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "Particles/Common.glsl"

layout(std430) buffer;

layout(set = 1, binding = 0) buffer _ParticleBuffer
{
    Particle data[];
} ParticleBuffer;

layout(set = 1, binding = 1) buffer _CounterBuffer
{
    Counter data;
} CounterBuffer;

layout(set = 1, binding = 2) buffer _IndexBuffer
{
    uint data[];
} IndexBuffer;

layout(location = 0) out vec3 outPos;
layout(location = 1) out vec3 outNormal;
layout(location = 2) out vec2 outUV[MAX_TEX_COORDS];
layout(location = 5) out vec4 outColor[MAX_VERTEX_COLOR_CHANNELS];

const vec2 quadPos[6]=vec2[6](
	vec2(-1, -1),
	vec2(1, -1),
	vec2(-1, 1),

	vec2(1, -1),
	vec2(1, 1),
	vec2(-1, 1)
);

const vec2 quadUV[6]=vec2[6](
	vec2(0, 0),
	vec2(1, 0),
	vec2(0, 1),

	vec2(1, 0),
	vec2(1, 1),
	vec2(0, 1)
);

const vec3 quadNormal = vec3(0.0, 0.0, 1.0);

void main()
{
    const uint vertex_index = gl_VertexIndex % 6;
    const uint active_index = gl_VertexIndex / 6;

    Counter counter = CounterBuffer.data;

    if(active_index >= counter.AliveCount)
    {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    const uint particle_index = IndexBuffer.data[counter.MaxParticles + active_index];
    Particle particle = ParticleBuffer.data[particle_index];

    mat4 localToViewSpace = Multiply(GetTranslationMatrix(-ViewConstants.ViewPosition), ViewConstants.ViewMatrix);

    mat4 rotation = rotationMatrix( vec3(0.0, 0.0, 1.0), particle.rotation);
    vec3 position = Multiply( vec4(particle.position, 1.0), localToViewSpace ).xyz;

    vec2 quadPosition = quadPos[vertex_index];
    
    vec3 rotatedPosition = position + Multiply( vec4(quadPosition * particle.size, 0.0, 1.0), rotation ).xyz;
    vec4 finalPosition = ViewConstants.ProjectionMatrix * vec4(rotatedPosition, 1.0);

    outPos         = finalPosition.xyz / finalPosition.w;
    outNormal      = quadNormal;
    outUV[0]       = quadUV[vertex_index];
    outColor[0]    = particle.color;

    gl_Position = finalPosition;
}