#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "./VolumetricLighting/volmetriclight_common.glsl"

// 
// ---------------------------------------------------------------
// 

#define MATH_PI 3.14159265359
#define EPSILON 0.0001
#define SHADOW_CASCADE_COUNT 4

// 
// ---------------------------------------------------------------
// 

layout( local_size_x = 8, local_size_y = 8, local_size_z = 1) in;

// 
// ---------------------------------------------------------------
// 

layout( set = 1, binding = 1) uniform sampler2D s_BlueNoise[ NUM_BLUE_NOISE_TEXTURES ];
layout( set = 1, binding = 2, rgba16f) uniform image3D i_OutputImages[ 2 ];

// 
// ---------------------------------------------------------------
// 

layout( set = 2, binding = 0) uniform b_ShadowData
{
    mat4 lightViewProj[ SHADOW_CASCADE_COUNT ];
    vec4 splitDepths;
} ShadowData;

layout( set = 2, binding = 1) uniform sampler2D s_ShadowDepth[SHADOW_CASCADE_COUNT];

// 
// ---------------------------------------------------------------
// 

layout( push_constant ) uniform b_PushConstant
{
    bool bAccumulation;
    uint BlueNoiseImageIndex;
    uint OutputWriteIndex;
} PushConstant;

// 
// ---------------------------------------------------------------
// 

float getJitter(ivec3 InvocId)
{
    ivec2 noise_coord = (InvocId.xy + ivec2(0, 1) * InvocId.z * BLUE_NOISE_TEXTURE_SIZE) % BLUE_NOISE_TEXTURE_SIZE;
    float noise = texelFetch( s_BlueNoise[PushConstant.BlueNoiseImageIndex], noise_coord, 0 ).r;
    return ( noise - 0.5 ) * 0.999;
}

// 
// ---------------------------------------------------------------
// 

float getThickness(int invocationZ)
{
    #if 1
        return exp( -float(VOXEL_GRID_SIZE_Z - invocationZ - 1) / float(VOXEL_GRID_SIZE_Z) );
    #else
        return 1.f;     // For linear depth
    #endif
}

// 
// ---------------------------------------------------------------
// 

float getVisibility(ivec3 InvocID, vec3 world_pos)
{
    vec4 cameraSpacePosition = Multiply( vec4(world_pos, 1.0), VolumeData.ViewMatrix );
    cameraSpacePosition /= cameraSpacePosition.w;
    
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
        vec4 lightSpacePos = Multiply( vec4(world_pos, 1.0), ShadowData.lightViewProj[cascadeIndex] );
        lightSpacePos /= lightSpacePos.w;
        
        vec4 shadowCoord = lightSpacePos * 0.5 + 0.5;

        const float bias = 0.002;
        float depth = texture( s_ShadowDepth[cascadeIndex], vec2(shadowCoord.xy), 0).r;
        
        shadow = step(shadowCoord.z, depth + bias);
    }
       
    return shadow;
}

// 
// ---------------------------------------------------------------
// 

float Henyey_Greenstein_phase_func(vec3 Wo, vec3 Wi, float g)
{
    float denom = 1.0 + (g * g) + 2.0 * g * dot(Wo, Wi);
    return ( 1.0 / (4.0 * MATH_PI) ) * ( (1.0 - (g*g)) / (max(pow(denom, 1.5), EPSILON ) ));
}

// 
// ---------------------------------------------------------------
// 

void main()
{
    ivec3 InvocId = ivec3( gl_GlobalInvocationID.xyz );

    if( all( lessThan(InvocId, ivec3(VOXEL_GRID_SIZE_X, VOXEL_GRID_SIZE_Y, VOXEL_GRID_SIZE_Z)) ) )
    {
        float jitter = getJitter(InvocId);

        vec3 world_position = id_to_world_with_jitter(
            InvocId, jitter, 
            VolumeData.nearZ, VolumeData.farZ, VolumeData.depthPower, 
            VolumeData.InverseViewProjection 
        );

        vec3 view_direction = normalize( VolumeData.ViewPosition.xyz - world_position );

        float thickness = getThickness(InvocId.z);
        
        float density = VolumeData.density;
        vec3 lighting = VolumeData.lightRadiance * VolumeData.AmbientLightIntensity;

        float visibility_value = getVisibility(InvocId, world_position);

        if(visibility_value > EPSILON)
        {
            float phase = Henyey_Greenstein_phase_func( view_direction, -VolumeData.lightDirection.xyz, VolumeData.anisotropy );
            lighting += visibility_value * VolumeData.lightRadiance * phase;
        }

        vec4 color_and_density = vec4(lighting * density, density);

        if(PushConstant.bAccumulation)
        {
            vec3 world_pos_without_jitter = id_to_world(
                InvocId, 
                VolumeData.nearZ, VolumeData.farZ, VolumeData.depthPower,
                VolumeData.InverseViewProjection
            );

            vec3 previous_uv = world_to_uv(
                world_pos_without_jitter,
                VolumeData.nearZ, VolumeData.farZ, VolumeData.depthPower,
                VolumeData.PreviousViewProjection
            );

            if( all(greaterThanEqual(previous_uv, vec3(0.0))) && all(lessThanEqual(previous_uv, vec3(1.0))) )
            {
                uint readIndex = uint( !bool(PushConstant.OutputWriteIndex) );
                vec4 previousValue = imageLoad(i_OutputImages[readIndex], InvocId);
            
                color_and_density = mix(previousValue, color_and_density, 0.05);   
            }
        }

        imageStore(i_OutputImages[PushConstant.OutputWriteIndex], InvocId, color_and_density);
    }
}