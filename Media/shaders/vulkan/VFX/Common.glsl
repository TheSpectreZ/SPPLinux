struct Particle
{
	vec4 color;

	vec3 position;
	float life;
	
	vec3 velocity; 
	float inverseMass;
	
	vec2 size; 
	float rotation; 
    float null;
};

struct ParticleCounter
{
	atomic_uint EmitCount;
	atomic_uint AliveCount;
	atomic_uint DeadCount;
	uint MaxParticles;
	float AccumTime;
};
	
layout(std430) buffer;

layout(set = 1, binding = 0) buffer _ParticleBuffer
{
	Particle data[];
} ParticleBuffer;

layout(set = 1, binding = 1) buffer _CounterBuffer
{
	ParticleCounter data;
} CounterBuffer;

layout(set = 1, binding = 2) buffer _DeadIndexBuffer
{
	uint data[];
} DeadIndexBuffer;

layout(set = 1, binding = 3) buffer _AliveIndexBuffer
{
	uint data[];
} AliveIndexBuffer;
