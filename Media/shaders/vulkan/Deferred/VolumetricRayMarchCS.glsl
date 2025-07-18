#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require
#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "./Deferred/VolumetricCommon.glsl"

layout(local_size_x = 10, local_size_y = 10, local_size_z = 1) in;

layout(set = 1, binding = 0) uniform sampler3D lightInjectionOutput[2];
layout(set = 1, binding = 1, rgba16f) writeonly uniform image3D rayMarchOutput;

layout(push_constant) uniform _PushConstant
{
    uint inputReadIndex;
} PushConstant;

float getDistance(int z)
{
    float Near = VolumetricBuffer.nearZ;
    float Far = VolumetricBuffer.farZ;

    return Near * pow( Far/Near, (float(z) + 0.5)/float(VOXEL_GRID_SIZE_Z) );
}

float getThickness(int z)
{
    return abs( getDistance(z+1) - getDistance(z) );
}

vec4 accumulate(int z, vec3 accum_scattering, float accum_transmittance, vec3 slice_scattering, float slice_density)
{
    float slice_transmittance = exp( -slice_density * getThickness(z) * 0.01);
    vec3 slice_scattering_integral = slice_scattering * (1.0 - slice_transmittance) / slice_density;
    
    accum_scattering += slice_scattering_integral * accum_transmittance;
    accum_transmittance *= slice_transmittance;

    return vec4(accum_scattering, accum_transmittance);
}

void main()
{
    vec4 accum_scattering_transmittance = vec4(0.0, 0.0, 0.0, 1.0);

    for(int z = 0; z < VOXEL_GRID_SIZE_Z; z++)
    {
        ivec3 coord = ivec3( gl_GlobalInvocationID.xy, z );

        vec4 slice_scattering_density = texelFetch(lightInjectionOutput[ PushConstant.inputReadIndex ], coord, 0);

        accum_scattering_transmittance = accumulate(z, 
                                                    accum_scattering_transmittance.rgb, 
                                                    accum_scattering_transmittance.a,
                                                    slice_scattering_density.rgb,
                                                    slice_scattering_density.a);
        
        imageStore(rayMarchOutput, coord, accum_scattering_transmittance);
    }
}