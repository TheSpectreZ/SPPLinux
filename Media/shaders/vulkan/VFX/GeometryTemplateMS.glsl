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

const uint total_particle_count = 1;
const uint total_vertices		= total_particle_count * vert_per_particle;
const uint total_primitives		= total_particle_count * prim_per_particle;

layout(local_size_x = total_particle_count, local_size_y = 1, local_size_z = 1) in;
layout(triangles, max_vertices = total_vertices, max_primitives = total_primitives) out;

taskPayloadSharedEXT struct
{
    float deltaTime;
    uint Index;
} InPayload;

layout(location = 0) out VertexOutput
{
    vec4 color;
} vertexOutput[];

void main()
{
    SetMeshOutputsEXT(total_vertices, total_primitives);

    mat4 localToViewSpace =  Multiply( GetTranslationMatrix(-ViewConstants.ViewPosition), ViewConstants.ViewMatrix );
    
    vec3 gId = vec3(gl_GlobalInvocationID.x, gl_GlobalInvocationID.y, gl_GlobalInvocationID.z);

    mat4 rotation = rotationMatrix( vec3(0.0, 0.0, 1.0), 0.0 );
    vec3 position = Multiply( vec4(gId, 1.0), localToViewSpace ).xyz;

    for(uint Iter = 0; Iter < 4; Iter++)
    {
        vec2 quadUV = vec2(Iter & 1, Iter >> 1);
        vec2 quadPos = vec2(quadUV.x * 2.0 - 1.0, quadUV.y * 2.0 - 1.0);

        vec3 rotatedPosition = position + Multiply( vec4(quadPos, 0.0, 1.0), rotation ).xyz;
        vec4 finalPosition = ViewConstants.ProjectionMatrix * vec4(rotatedPosition, 1.0);

        vertexOutput[Iter].color = vec4(quadPos, 0.0, 1.0);

        gl_MeshVerticesEXT[Iter].gl_Position = finalPosition;
    }

    gl_PrimitiveTriangleIndicesEXT[0] = uvec3(0, 1, 2);
    gl_PrimitiveTriangleIndicesEXT[1] = uvec3(2, 3, 1);
}