#version 450

#extension GL_EXT_mesh_shader : require
#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

taskPayloadSharedEXT struct
{
	vec3 position;
	vec3 normal;
	vec3 tangent;
	vec3 bitangent;
	float height;
} outPayload;

void main()
{
	uvec3 id = gl_GlobalInvocationID.xyz;

	vec3 position = vec3( float(id.x) , 0, float(id.y) );
	vec3 normal = vec3(0, 1, 0);

	outPayload.position = position;
	outPayload.normal = normal;
	outPayload.tangent = normalize( cross(vec3(0, 0, 1), normal ));
	outPayload.bitangent = normalize( cross(normal, outPayload.tangent) );
	outPayload.height = 1.0;

	EmitMeshTasksEXT(1, 1, 1);
}