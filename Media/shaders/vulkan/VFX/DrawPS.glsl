#version 450

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

layout(location = 0) in VertexInput
{
    vec4 color;
} Input;

layout(location = 0) out vec4 outColor;

void main()
{
    outColor = vec4(Input.color);
}