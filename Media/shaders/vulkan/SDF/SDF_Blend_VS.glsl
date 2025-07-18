#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

//we are in fact using column
//layout(row_major) uniform;
//layout(row_major) buffer;
layout(std430) buffer;

#include "Common.glsl"

layout(push_constant) uniform block
{
	mat4 LocalToWorldScaleRotation;
#if SUPPORT_DOUBLE
	dvec3 Translation;
#else
	vec3 Translation;
#endif
	uint ShapeCount;
	float ShapeAlpha;
};

// Vertex attributes
layout (location = 0) in vec3 inPos;

// out params
layout (location = 0) out vec3 outScreenPos;

out gl_PerVertex
{
	vec4 gl_Position;
};

// Vertex shader
void main()
{
	mat4 LocalToWorldTranslated = GetLocalToWorldViewTranslated(LocalToWorldScaleRotation, Translation, ViewConstants.ViewPosition);
	mat4 localToScreen =  Multiply( LocalToWorldTranslated, ViewConstants.ViewProjectionMatrix );
		
	vec4 finalPos = Multiply( vec4(inPos, 1.0), localToScreen );
	outScreenPos = finalPos.xyz / finalPos.w;
	gl_Position = finalPos;
}

