#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

//we are in fact using column
layout(std430) buffer;

#include "Common.glsl"
#define MINIMUM_SHADOW_BIAS 0.002

// Make sure this matches in cpp code
const uint SHADOW_CASCADE_COUNT = 4;

layout (set = 1, binding = 0) uniform sampler2D sceneNormal;
layout (set = 1, binding = 1) uniform sampler2D sceneDepth;
layout (set = 1, binding = 2) uniform sampler2D shadowMap[SHADOW_CASCADE_COUNT];

layout (set = 2, binding = 0) uniform _ShadowData
{
	mat4 sceneToShadow[SHADOW_CASCADE_COUNT];
	vec4 splitDepths;
    vec4 lightDirection;
} ShadowData;

layout (location = 0) in vec4 inPixelPosition;
layout (location = 1) in vec2 inUV;

layout (location = 0) out float outputColor;

float getShadowBias(vec3 normal, vec3 lightDirection)
{
    return max( MINIMUM_SHADOW_BIAS * (1.0 - dot(normal, lightDirection)), MINIMUM_SHADOW_BIAS );
}

float HardShadows(vec4 shadowCoord, uint cascade, vec3 normal)
{
    float bias = getShadowBias(normal, ShadowData.lightDirection.xyz);
    float depth = texture( shadowMap[cascade], vec2(shadowCoord.xy)).r;
    float shadow = step(shadowCoord.z, depth + bias);

    return shadow;
}

void main()
{
	vec2 fulltargetSize = vec2( textureSize(sceneDepth, 0) );
    
    vec2 pixelSpaceCoord = ViewConstants.ViewFrame.zw * inUV;
    pixelSpaceCoord += ViewConstants.ViewFrame.xy;
    
    vec2 recalcUV = pixelSpaceCoord / fulltargetSize;

    float NDCDepth = texture(sceneDepth, recalcUV).r;

    vec4 cameraSpacePosition4 = Multiply( vec4(inPixelPosition.xy, NDCDepth, 1.0), ViewConstants.InvProjectionMatrix );
    vec3 cameraSpacePosition = cameraSpacePosition4.xyz / cameraSpacePosition4.w;

    vec3 Normal = texture(sceneNormal, recalcUV).rgb;

    int cascadeIndex = -1;
    for(int i = 0; i < SHADOW_CASCADE_COUNT; i++)
    {
        if(cameraSpacePosition.z < ShadowData.splitDepths[i])
        {
            cascadeIndex = i;
            break;
        }
    }

    float shadow = 1.0;

    if(cascadeIndex != -1)
    {
        float visibility = -1.0;
        while(visibility < 0.0)
        {
            if(cascadeIndex >= SHADOW_CASCADE_COUNT)
                break;

            vec4 shadowUV = Multiply( vec4(inPixelPosition.xy, NDCDepth, 1.0), ShadowData.sceneToShadow[cascadeIndex] );
            shadowUV /= shadowUV.w;

            if( all(greaterThanEqual(shadowUV.xyz, vec3(0.0))) && all(lessThanEqual(shadowUV.xyz, vec3(1.0))) )
            {
                visibility = HardShadows(shadowUV, cascadeIndex, Normal);
                break;
            }
            
            cascadeIndex++;
        }

        if(visibility >= 0.0)
            shadow = visibility;            
    }
    outputColor = shadow;
}
