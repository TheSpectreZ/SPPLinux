#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require
#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "./Deferred/VolumetricCommon.glsl"

#define MATH_PI 3.14159265359
#define EPSILON 0.0001
#define SHADOW_CASCADE_COUNT 4

layout(local_size_x = 10, local_size_y = 10, local_size_z = 10) in;

layout(set = 1, binding = 0) uniform sampler2D shadowDepth[SHADOW_CASCADE_COUNT];
layout(set = 1, binding = 1) uniform sampler2D blueNoise[NUM_BLUE_NOISE_TEXTURES];
layout(set = 1, binding = 2, rgba16f) uniform image3D lightInjectionOutput[2];

layout(set = 2, binding = 1) uniform _ShadowBuffer
{   
    mat4 lightViewProj[SHADOW_CASCADE_COUNT];
    vec4 splitDepths;
    vec4 lightDirection;
} ShadowBuffer;

layout(push_constant) uniform _PushConstant
{   
    uint outputWriteIndex;
    uint blueNoiseImageIndex;
    bool bAccumulation;
} PushConstant;

float getJitter(ivec3 InvocId)
{
    ivec2 noise_coord = (InvocId.xy + ivec2(0, 1) * InvocId.z * BLUE_NOISE_TEXTURE_SIZE) % BLUE_NOISE_TEXTURE_SIZE;
    float noise = texelFetch(blueNoise[PushConstant.blueNoiseImageIndex], noise_coord, 0).r;
    return (noise - 0.5) * 0.999;
}

float getThickness(int invocationZ)
{
    return exp( -float(VOXEL_GRID_SIZE_Z - invocationZ - 1) / float(VOXEL_GRID_SIZE_Z) );
}

float getVisibility(vec3 view, vec3 world)
{
    // TODO : This thing just doesnt work !
    // Refer to shadow Filter to see how to sample ( lol maybe that is wrong too )
    // Check the shadow map here ...
    return 0.0; 
}

void main()
{
    ivec3 InvocId = ivec3(gl_GlobalInvocationID.xyz);    

    if( all(lessThan(InvocId, ivec3(VOXEL_GRID_SIZE_X, VOXEL_GRID_SIZE_Y, VOXEL_GRID_SIZE_Z)) ) )
    {    
        float jitter = getJitter(InvocId);
        
        vec3 uv = id_to_uv(InvocId);
        vec3 ndc = uv_to_ndc(uv);
        vec3 world = ndc_to_world(ndc);

        vec4 view = Multiply( vec4(world, 1.0), ViewConstants.ViewMatrix * GetTranslationMatrix(ViewConstants.ViewPosition));
        view /= view.w;
    
        vec3 view_direction = normalize(view.xyz);
        
        float thickness = getThickness(InvocId.z);
        float density = VolumetricBuffer.density;
        vec3 lighting = VolumetricBuffer.lightRadiance * VolumetricBuffer.ambientLightIntensity;

        float visibility = getVisibility(view.xyz, world);

        if(visibility > EPSILON)
        {

        }

        vec4 color_and_density = vec4(lighting * density, density);

        imageStore(lightInjectionOutput[PushConstant.outputWriteIndex], InvocId, color_and_density);
    }
}
