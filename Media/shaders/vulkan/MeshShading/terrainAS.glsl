#version 450

#extension GL_EXT_mesh_shader : require
#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

layout(push_constant) uniform _PushConstant
{
    uint size;
} PushConstant;

void main()
{
	EmitMeshTasksEXT(1, 1, 1);
}