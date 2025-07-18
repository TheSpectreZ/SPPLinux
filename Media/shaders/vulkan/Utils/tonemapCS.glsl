#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require
#extension GL_EXT_shader_explicit_arithmetic_types_int8: require
#extension GL_EXT_control_flow_attributes: require
#extension GL_EXT_nonuniform_qualifier: require
#extension GL_GOOGLE_include_directive: require

//layout(row_major) uniform;
//layout(row_major) buffer;
layout(std430) buffer;

#include "Common.glsl"
// include paths based on 

//we are in fact using column
layout(std430) buffer;

layout (set = 1, binding = 0, rgba16f) uniform readonly image2D imgHDR;
layout (set = 1, binding = 1, rgba8) uniform writeonly image2D imgRGB;

const float gamma     = 2.2;
const float exposure  = 1.0;
const float pureWhite = 1.0;

layout(local_size_x=32, local_size_y=32, local_size_z=1) in;
void main(void)
{
	ivec2 pixelPnt = ivec2(gl_GlobalInvocationID.xy) + ViewConstants.ViewFrame.xy;
	if (any(greaterThanEqual(ivec2(gl_GlobalInvocationID.xy), ViewConstants.ViewFrame.zw)) )
    {
        return;
    }

    vec3 color = imageLoad( imgHDR, pixelPnt ).rgb * exposure;

	// Reinhard tonemapping operator.
	// see: "Photographic Tone Reproduction for Digital Images", eq. 4
	float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float mappedLuminance = (luminance * (1.0 + luminance/(pureWhite*pureWhite))) / (1.0 + luminance);

	// Scale color by ratio of average luminances.
	vec3 mappedColor = (mappedLuminance / luminance) * color;

	imageStore(imgRGB, pixelPnt, vec4(pow(mappedColor, vec3(1.0/gamma)), 1.0) );
}
