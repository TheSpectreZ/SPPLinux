#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

//we are in fact using column
layout(std430) buffer;

#include "Common.glsl"

layout(set = 1, binding = 0) readonly uniform _DrawConstants
{
	//altered viewposition translated
	mat4 LocalToWorldScaleRotation;
#if SUPPORT_DOUBLE
	dvec3 Translation;
#else
	vec3 Translation;
#endif
} DrawConstants;

out gl_PerVertex
{
	vec4 gl_Position;
};

// Vertex shader
void main()
{
	gl_Position = vec4(0,0,0,0);
}

