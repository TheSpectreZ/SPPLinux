#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require
#extension GL_EXT_shader_explicit_arithmetic_types_int8: require

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

layout(std140, set = 2, binding = 0) readonly buffer _Bones
{	
	mat4 bones[];
};

// Vertex attributes
layout (location = 0) in vec3 inPos;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec2 inUV[MAX_TEX_COORDS];
layout (location = 5) in vec4 inColor[MAX_VERTEX_COLOR_CHANNELS];
layout (location = 8) in vec4 inBoneWeights;
layout (location = 9) in u8vec4 inBoneIndices;

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
		
	for (int i = 0; i < MAX_TEX_COORDS; ++i) outUV[i] = inUV[i];
	for (int i = 0; i < MAX_VERTEX_COLOR_CHANNELS; ++i) outVertexColor[i] = inColor[i];

    mat4 skinMatrix = bones[inBoneIndices[0]] * inBoneWeights[0] +
                      bones[inBoneIndices[1]] * inBoneWeights[1] +
                      bones[inBoneIndices[2]] * inBoneWeights[2] +
                      bones[inBoneIndices[3]] * inBoneWeights[3];

	if(length(inBoneWeights) < 0.01)
	{
		skinMatrix = mat4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1 );
	}
                    
    mat4 SkinnedLocalToWorldTranslated =  Multiply( skinMatrix, LocalToWorldTranslated );
    mat4 localToScreen =  Multiply( SkinnedLocalToWorldTranslated, ViewConstants.ViewProjectionMatrix );
    
	vec4 finalPos = Multiply( vec4(inPos, 1.0), localToScreen );
	outPos = finalPos.xyz / finalPos.w;
    outNormal = normalize( Multiply( inNormal, mat3(SkinnedLocalToWorldTranslated) ) );
	gl_Position = finalPos;
}

