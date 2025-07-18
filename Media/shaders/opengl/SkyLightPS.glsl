
// include paths based on root of shader directory
#include "CommonMath.glsl"

uniform samplerCube samplerSky;

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

layout (location = 0) in vec4 inPixelPosition;
layout (location = 1) in vec2 inUV;

layout (location = 0) out vec4 outputColor;

// pixel shader shader
void main()
{
	//vec2 fulltargetSize = vec2(textureSize(samplerDepth, 0));
	//vec2 pixelSpaceCoord = ViewConstants.ViewFrame.zw * inUV;
	//pixelSpaceCoord += ViewConstants.ViewFrame.xy;
	//vec2 recalcUV = (pixelSpaceCoord / fulltargetSize);

	vec3 cameraRay = normalize(Multiply(vec4(inPixelPosition.xy, 1, 1.0), ViewConstants.InvViewProjectionMatrix).xyz);
	outputColor = vec4(texture(samplerSky, normalize(cameraRay)).rgb, 1.0f);
}



