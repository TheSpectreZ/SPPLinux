#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

layout(std430) buffer;

#include "Common.glsl"
#include "./Deferred/Lighting.glsl"

#define MAX_LIGHT_PER_CLUSTER 50 // This should match in VulkanDeferredLighting.h

struct LightGrid 
{
    int pointLightIndices[MAX_LIGHT_PER_CLUSTER];
    int spotLightIndices[MAX_LIGHT_PER_CLUSTER];
};

layout(set = 1, binding = 0) buffer _LightGridBuffer
{
    LightGrid grid[];
} LightGridBuffer;

layout(set = 1, binding = 1) readonly buffer _PointLightBuffer
{
    PointLightInfo pointlight[];
} PointLightBuffer;

layout(set = 1, binding = 2) readonly buffer _SpotLightBuffer
{
    SpotLightInfo spotlight[];
} SpotLightBuffer;

layout(push_constant) uniform _PushConstant
{
    uvec4 tileSizes;    
    float NearZ, FarZ;
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

    vec4 objViewPosition4 = Multiply(vec4(inPixelPosition.xy, zDepthNDC, 1.0f), ViewConstants.InvProjectionMatrix);
    vec3 objViewPosition = objViewPosition4.xyz / objViewPosition4.w;

    vec2 tileSize = ViewConstants.ViewFrame.zw / vec2(PushConstant.tileSizes.xy);
    
    uint zTile = uint( (log(abs(objViewPosition.z) / PushConstant.NearZ) * PushConstant.tileSizes.z) / log(PushConstant.FarZ/ PushConstant.NearZ) );
    uvec2 xyTile = uvec2(vec2( (inPixelPosition.xy + vec2(1.0, 1.0)) / 2.0) * ViewConstants.ViewFrame.zw / tileSize);
    
    uint tileIndex = xyTile.x + (xyTile.y * PushConstant.tileSizes.x) + (zTile * PushConstant.tileSizes.x * PushConstant.tileSizes.y);
    
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

    uint pointlightCount = LightGridBuffer.grid[tileIndex].pointLightIndices.length();
    for(uint i = 0; i < pointlightCount; i++)
    {
        int Index = LightGridBuffer.grid[tileIndex].pointLightIndices[i];
        if(Index == -1)
        {
            pointlightCount = i;
            break;
        }   
        
        PointLightInfo light = PointLightBuffer.pointlight[Index];
        lighting += CalculatePointLight(light, objWorldPosition, normal, Lo, cosLo, F0, albedo, smre);
    }

    uint spotlightCount = LightGridBuffer.grid[tileIndex].spotLightIndices.length();
    for(uint i = 0; i < spotlightCount; i++)
    {
        int Index = LightGridBuffer.grid[tileIndex].spotLightIndices[i];
        if(Index == -1)
        {
            spotlightCount = i;
            break;
        }    

        SpotLightInfo light = SpotLightBuffer.spotlight[Index];
        lighting += CalculateSpotLight(light, objWorldPosition, normal, Lo, cosLo, F0, albedo, smre);
    }

    outputColor = vec4(lighting, 1.0);
}