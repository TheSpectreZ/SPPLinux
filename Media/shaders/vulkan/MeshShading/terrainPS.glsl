#version 450

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

layout(location = 0) in VertexInput
{
    vec3 color;
    vec3 normal;
    vec3 position;
    uvec2 id;
} Input;

layout(location = 0) out vec4 outDiffuse;
layout(location = 1) out vec4 outSMRE;
layout(location = 2) out vec4 outNormal;

void main()
{
    outDiffuse = vec4(Input.color, 1.0);
    outNormal = vec4(Input.normal, 1.0);
}