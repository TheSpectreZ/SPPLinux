#version 450

#extension GL_EXT_mesh_shader: require
#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

const uint max_vert_per_row = 11; 

const uint total_verts = max_vert_per_row * max_vert_per_row;
const uint total_prims = (max_vert_per_row - 1) * (max_vert_per_row - 1) * 2;

layout(local_size_x = max_vert_per_row, local_size_y = max_vert_per_row, local_size_z = 1) in;
layout(triangles, max_vertices = total_verts, max_primitives = total_prims) out;

layout(location = 0) out VertexOutput
{
    mat4 viewProj;
} vertexOutput[];

vec3 quadColors[4] = {
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, 0.0)
};

void main()
{
    SetMeshOutputsEXT(total_verts, total_prims);

    mat4 worldToScreen = Multiply(GetTranslationMatrix(-ViewConstants.ViewPosition), ViewConstants.ViewProjectionMatrix);

    uint index = gl_LocalInvocationID.y * max_vert_per_row + gl_LocalInvocationID.x;

    float x = float(gl_LocalInvocationID.x);
    float z = float(gl_LocalInvocationID.y);

    vec3 position = vec3(x, 0.0, z);
        
    gl_MeshVerticesEXT[index].gl_Position = worldToScreen * vec4(position, 1.0);

    vertexOutput[index].viewProj = ViewConstants.ViewProjectionMatrix;
    
    if(gl_LocalInvocationID.x < max_vert_per_row - 1 && gl_LocalInvocationID.y < max_vert_per_row - 1)
    {
        uint a = index;
        uint b = index + max_vert_per_row;
        uint c = index + 1 + max_vert_per_row;
        uint d = index + 1;

        gl_PrimitiveTriangleIndicesEXT[index * 2]     = uvec3( a, b, c );
        gl_PrimitiveTriangleIndicesEXT[index * 2 + 1] = uvec3( c, d, a );
    }
}