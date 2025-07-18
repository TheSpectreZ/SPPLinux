#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

//we are in fact using column
layout(std430) buffer;

layout (set = 0, binding = 0) uniform sampler2D inScreenTexture;

layout (location = 0) in vec4 inPixelPosition;
layout (location = 1) in vec2 inUV;

layout (location = 0) out vec4 outputColor;

// pixel shader shader
void main()
{
	outputColor = texture(inScreenTexture, inUV);
}