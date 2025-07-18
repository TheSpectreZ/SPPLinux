#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "./VolumetricLighting/volmetriclight_common.glsl"

layout( location = 0 ) in vec4 inPixelPosition;
layout( location = 1 ) in vec2 inUV;

layout( location = 0 ) out vec4 outputColor;

layout( set = 1, binding = 1 ) uniform sampler2D s_ScreenTexture;
layout( set = 1, binding = 2 ) uniform sampler2D s_SceneDepth;
layout( set = 1, binding = 3 ) uniform sampler3D s_VolumetricGrid;

vec3 add_inscattered_light(vec3 color, vec3 worldPos)
{
    vec3 uv = world_to_uv(worldPos, VolumeData.nearZ, VolumeData.farZ, VolumeData.depthPower, ViewConstants.ViewProjectionMatrix);
    
    vec4 scattered_light = textureLod(s_VolumetricGrid, uv, 0.0);
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

    vec4 homogenousPos = Multiply( vec4(inPixelPosition.xy, NDCDepth, 1.0), ViewConstants.InvViewProjectionMatrix );
    vec3 worldPos = homogenousPos.xyz / homogenousPos.w;

    vec3 color = texture(s_ScreenTexture, recalcUV).rgb;
    color = add_inscattered_light(color, worldPos);
    
    outputColor = vec4(color, 1.0);
}