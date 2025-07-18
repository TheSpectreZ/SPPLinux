// Copyright (c) David Sleeper (Sleeping Robot LLC)
// Distributed under MIT license, or public domain if desired and
// recognized in your jurisdiction.

#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "SDFShapes.glsl"

layout(set = 0, binding=4, r32f) restrict writeonly uniform image2D colorImage;
layout(set = 0, binding=5) restrict uniform image2D depthImage;

layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;
void main()
{
	vec2 pixelPosition = vec2(gl_GlobalInvocationID.xy - ViewConstants.ViewFrame.xy) / vec2( ViewConstants.ViewFrame.zw);
	pixelPosition = (pixelPosition - 0.5f) * 2.0f;
	
	vec4 raystart = Multiply(vec4(pixelPosition, 0, 1.0), ViewConstants.InvViewProjectionMatrix);
	raystart /= raystart.w;
	// using a smallish z for floating error
	vec4 rayStop = Multiply(vec4(pixelPosition, 0.01, 1.0), ViewConstants.InvViewProjectionMatrix);
	rayStop /= rayStop.w;
	
	float zDepthNDC = imageLoad(depthImage, ivec2(gl_GlobalInvocationID.xy)).x;
	//// We are only interested in the depth here
	//// Unproject the vector into (homogenous) view-space vector
	//float4 viewCoords = Multiply(vec4(pixelPosition, zDepthNDC, 1.0f), ViewConstants.InvProjectionMatrix);
	//// Divide by w, which results in actual view-space z value
	//float zDepth = viewCoords.z / viewCoords.w;

	vec3 rayOrigin = raystart.xyz;
	vec3 rayDirection = normalize(rayStop.xyz - raystart.xyz);

	if (gl_LocalInvocationIndex == 0)
	{
		ShapeGenerateShared();
	}

	groupMemoryBarrier();
	barrier();
	
	vec4 outRender = renderSDF(rayOrigin, rayDirection);
	vec4 localWorldPos = vec4(rayOrigin + rayDirection * outRender.w, 1.0f);
	
	vec4 localRay = Multiply(localWorldPos, ViewConstants.ViewProjectionMatrix);
	localRay /= localRay.w;	
	
	if(outRender.w > -100 && localRay.z < zDepthNDC)
	{
		imageStore(colorImage, ivec2(gl_GlobalInvocationID.xy), vec4(outRender.rgb,1.0f));
		imageStore(depthImage, ivec2(gl_GlobalInvocationID.xy), vec4(localRay.z,0,0,0));
	}
}