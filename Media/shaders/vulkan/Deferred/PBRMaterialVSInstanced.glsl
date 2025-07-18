#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

layout(std430) buffer;
#include "Common.glsl"

struct DrawConstants
{
    vec3 Translation; float rotationY;
};

layout(set = 1, binding = 0) buffer ModelData {
    DrawConstants data[];
} DrawConstantBuffer;

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

// Vertex shader
void main()
{
    DrawConstants instance = DrawConstantBuffer.data[gl_InstanceIndex];

	mat4 LocalToWorldRotation = rotationMatrix(vec3(0.0, 1.0, 0.0), instance.rotationY);
	mat4 LocalToWorldTranslated = GetLocalToWorldViewTranslated(LocalToWorldRotation, instance.Translation, ViewConstants.ViewPosition);
	mat4 LocalToScreen =  Multiply( LocalToWorldTranslated, ViewConstants.ViewProjectionMatrix );
		
	for (int i = 0; i < MAX_TEX_COORDS; ++i) outUV[i] = inUV[i];
	for (int i = 0; i < MAX_VERTEX_COLOR_CHANNELS; ++i) outVertexColor[i] = inColor[i];

	outNormal = normalize( Multiply( inNormal, mat3(LocalToWorldRotation) ) );

	vec4 finalPos = Multiply( vec4(inPos, 1.0), LocalToScreen );
	outPos = finalPos.xyz / finalPos.w;
	gl_Position = finalPos;
}