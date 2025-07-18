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

struct Counter
{
    float AccumTime;
    uint MaxParticles;
    uint DeadCount;
    uint EmitCount;
    uint AliveCount;
};

#define MESH_SHADER_LOCAL_SIZE 64