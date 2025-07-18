#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

layout(std430) buffer;

#include "Common.glsl"
#include "./Deferred/Lighting.glsl"

layout (set = 1, binding = 0) readonly buffer _SpotLightBuffer
{
    SpotLightInfo data[];
} SpotLightBuffer;

layout (push_constant) readonly uniform _PushConstants
{
    uint numSpotLight;
} PushConstant;

layout (location = 0) in vec4 inPixelPosition;
layout (location = 1) in vec2 inUV;

layout (location = 0) out vec4 outputColor;

void main()
{
    vec2 fulltargetSize = vec2(textureSize(samplerDepth, 0));
	vec2 pixelSpaceCoord = ViewConstants.ViewFrame.zw * inUV;
	pixelSpaceCoord += ViewConstants.ViewFrame.xy;
	vec2 recalcUV = (pixelSpaceCoord / fulltargetSize);

	float zDepthNDC = texture(samplerDepth, recalcUV).r;	
	if(zDepthNDC <= 0)
	{
		discard;
	}

    vec4 smre = texture(samplerSMRE, recalcUV);
	vec3 albedo = texture(samplerDiffuse, recalcUV).rgb;
    vec3 normal = texture(samplerNormal, recalcUV).rgb * 2.0 - vec3(1.0);

    vec4 objWorldPosition4 = Multiply(vec4(inPixelPosition.xy, zDepthNDC, 1.0f), GetTranslationMatrix(ViewConstants.ViewPosition) * ViewConstants.InvViewProjectionMatrix);
	vec3 objWorldPosition = objWorldPosition4.xyz / objWorldPosition4.w;
    
    vec3 Lo = normalize(ViewConstants.ViewPosition - objWorldPosition);
	float cosLo = max(0.0, dot(normal, Lo));
	
    vec3 Lr = 2.0 * cosLo * normal - Lo;
	vec3 F0 = mix(Fdielectric, albedo, smre.b);
	
    vec3 lighting = vec3(0.0, 0.0, 0.0);
    for(uint i = 0; i < PushConstant.numSpotLight; i++)   
    {
        SpotLightInfo light = SpotLightBuffer.data[i];
        lighting += CalculateSpotLight(light, objWorldPosition, normal, Lo, cosLo, F0, albedo, smre);
    }

    outputColor = vec4(lighting, 1.0);
}