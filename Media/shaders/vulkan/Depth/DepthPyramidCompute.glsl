#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

layout(binding = 0) uniform sampler2D depthTexture;
layout(binding = 1) uniform writeonly image2D oDepthReduced;

layout(push_constant) uniform block
{
	vec2 srcSize;
	vec2 dstSize;
} pcs;

layout(local_size_x = 32, local_size_y = 32, local_size_z = 1) in;
void main()
{
	ivec2 SamplePoint = ivec2(gl_GlobalInvocationID.xy) * 2;
			
	// Sampler is set up to do min reduction, so this computes the minimum depth of a 2x2 texel quad
	float depth = textureLod(depthTexture, (SamplePoint + vec2(1,1)) / pcs.srcSize, 0 ).r;   
    imageStore(oDepthReduced, ivec2(gl_GlobalInvocationID.xy), vec4(depth,0,0,0) );
}