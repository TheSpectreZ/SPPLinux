#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require
#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "./Deferred/VolumetricCommon.glsl"

layout(location = 0) in vec4 inPixelPosition;
layout(location = 1) in vec2 inUV;

layout(location = 0) out vec4 outputColor;

layout(set = 1, binding = 0) uniform sampler2D s_ScreenTexture;
layout(set = 1, binding = 1) uniform sampler2D s_SceneDepth;
layout(set = 1, binding = 2) uniform sampler3D s_RayMarchOutput;

vec3 add_inscattered_light(vec3 color, vec3 worldPos)
{
    vec3 uv = world_to_uv(worldPos);
    
    if(any(lessThan(uv, vec3(0.0, 0.0, 0.0))) || any(greaterThan(uv, vec3(1.0, 1.0, 1.0))))
        discard;

    vec4 scattered_light = texture(s_RayMarchOutput, uv);
    float transmittance = scattered_light.a;

    return color * transmittance + scattered_light.rgb;
}

void main()
{
    vec2 fulltargetSize = vec2(textureSize(s_ScreenTexture, 0));
    vec2 pixelSpaceCoord = ViewConstants.ViewFrame.zw * inUV;
    pixelSpaceCoord += ViewConstants.ViewFrame.xy;
    vec2 recalcUV = pixelSpaceCoord / fulltargetSize;

    float NDCDepth = texture( s_SceneDepth, recalcUV ).r;

    vec4 homogenousPos = Multiply( vec4(inPixelPosition.xy, NDCDepth, 1.0), GetTranslationMatrix(ViewConstants.ViewPosition) * ViewConstants.InvViewProjectionMatrix);
    vec3 worldPos = homogenousPos.xyz / homogenousPos.w;

    vec3 color = texture(s_ScreenTexture, recalcUV).rgb;
    color = add_inscattered_light(color, worldPos);
    
    outputColor = vec4(color, 1.0);
}