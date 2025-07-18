#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

//we are in fact using column
//layout(row_major) uniform;
//layout(row_major) buffer;
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


// Vertex attributes
layout (location = 0) in vec3 inPos;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec2 inUV[MAX_TEX_COORDS];
layout (location = 5) in vec4 inColor[MAX_VERTEX_COLOR_CHANNELS];

// out params
layout (location = 0) out vec3 outPos;
layout (location = 1) out vec3 outNormal;
layout (location = 2) out vec2 outUV[MAX_TEX_COORDS];
layout (location = 5) out vec4 outVertexColor[MAX_VERTEX_COLOR_CHANNELS];

out gl_PerVertex
{
	vec4 gl_Position;
};

// Vertex shader
void main()
{
	mat4 LocalToWorldTranslated = GetLocalToWorldViewTranslated(DrawConstants.LocalToWorldScaleRotation, DrawConstants.Translation, ViewConstants.ViewPosition);
	mat4 localToScreen =  Multiply( LocalToWorldTranslated, ViewConstants.ViewProjectionMatrix );
		
	for (int i = 0; i < MAX_TEX_COORDS; ++i) outUV[i] = inUV[i];
	for (int i = 0; i < MAX_VERTEX_COLOR_CHANNELS; ++i) outVertexColor[i] = inColor[i];

	outNormal = normalize( Multiply( inNormal, mat3(DrawConstants.LocalToWorldScaleRotation) ) );

	vec4 finalPos = Multiply( vec4(inPos, 1.0), localToScreen );
	outPos = finalPos.xyz / finalPos.w;
	gl_Position = finalPos;
}

