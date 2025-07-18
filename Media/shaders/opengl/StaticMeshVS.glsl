#include "CommonVS.glsl"

layout(binding = 0) uniform _ViewConstants
{
	//all origin centered
	mat4 ViewMatrix;
	mat4 ViewProjectionMatrix;
	mat4 ProjectionMatrix;

	mat4 InvViewProjectionMatrix;
	mat4 InvProjectionMatrix;

	vec3 ViewPosition;
	vec4 CameraFrustum[6];

	ivec4 ViewFrame;
	float RecipTanHalfFovy;
} ViewConstants;

layout(binding = 1) uniform _DrawConstants
{
	//altered viewposition translated
	mat4 LocalToWorldScaleRotation;
	vec3 Translation;
} DrawConstants;


// Vertex attributes
layout(location = 0) in vec3 inPos;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inUV[MAX_TEX_COORDS];
layout(location = 5) in vec4 inColor[MAX_VERTEX_COLOR_CHANNELS];

// out params
layout(location = 0) out vec3 outPos;
layout(location = 1) out vec3 outNormal;
layout(location = 2) out vec2 outUV[MAX_TEX_COORDS];
layout(location = 5) out vec4 outVertexColor[MAX_VERTEX_COLOR_CHANNELS];

// Vertex shader
void main()
{
	mat4 LocalToWorldTranslated = GetLocalToWorldViewTranslated(DrawConstants.LocalToWorldScaleRotation, DrawConstants.Translation, ViewConstants.ViewPosition);
	mat4 localToScreen = Multiply(LocalToWorldTranslated, ViewConstants.ViewProjectionMatrix);

	for (int i = 0; i < MAX_TEX_COORDS; ++i) outUV[i] = inUV[i];
	for (int i = 0; i < MAX_VERTEX_COLOR_CHANNELS; ++i) outVertexColor[i] = inColor[i];

	outNormal = normalize(Multiply(inNormal, mat3(DrawConstants.LocalToWorldScaleRotation)));

	vec4 finalPos = Multiply(vec4(inPos, 1.0), localToScreen);
	outPos = finalPos.xyz / finalPos.w;
	gl_Position = finalPos;
}

