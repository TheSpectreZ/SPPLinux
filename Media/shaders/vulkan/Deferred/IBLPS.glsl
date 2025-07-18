#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

//we are in fact using column
//layout(row_major) uniform;
//layout(row_major) buffer;
layout(std430) buffer;

#include "Common.glsl"
// include paths based on root of shader directory
#include "./Deferred/PBRCommon.glsl"

layout (set = 1, binding = 0) uniform samplerCube irradianceTexture;
layout (set = 1, binding = 1) uniform samplerCube specularTexture;
layout (set = 1, binding = 2) uniform sampler2D specularBRDF_LUT;

layout (location = 0) in vec4 inPixelPosition;
layout (location = 1) in vec2 inUV;

layout (location = 0) out vec4 outputColor;


const float minDot = 1e-5;

// pixel shader shader
void main()
{
	vec2 fulltargetSize = vec2(textureSize(samplerDepth, 0));
	vec2 pixelSpaceCoord = ViewConstants.ViewFrame.zw * inUV;
	pixelSpaceCoord += ViewConstants.ViewFrame.xy;
	vec2 recalcUV = (pixelSpaceCoord / fulltargetSize);

	// Get G-Buffer values
	float zDepthNDC = texture(samplerDepth, recalcUV).r;
	
	if(zDepthNDC <= 0)
	{
		discard;
	}
	
	vec4 smre = texture(samplerSMRE, recalcUV);
	vec3 normal = texture(samplerNormal, recalcUV).rgb * 2.0f - vec3(1.0f);
	
	mat4 ToWorldPosition = Multiply(ViewConstants.InvViewProjectionMatrix, GetTranslationMatrix(ViewConstants.ViewPosition));

    vec4 objWorldPosition4 = Multiply(vec4(inPixelPosition.xy, zDepthNDC, 1.0f), ToWorldPosition);
	// Divide by w, which results in actual world-space z value
	vec3 objWorldPosition = objWorldPosition4.xyz / objWorldPosition4.w;
	
	// Sample input textures to get shading model params.
	vec3 albedo = texture(samplerDiffuse, recalcUV).rgb;
	
	float specularIrradiance = smre.r;
	float metalness = smre.g;
	float roughness = smre.b;
	float emissive = smre.a;

	// Outgoing light direction (vector from world-space fragment position to the "eye").
	vec3 Lo = normalize(ViewConstants.ViewPosition - objWorldPosition);
	
    // Angle between surface normal and outgoing light direction.
	float cosLo = max(minDot, dot(normal, Lo));
		
	// Specular reflection vector.
	vec3 Lr = 2.0 * cosLo * normal - Lo;

	// Fresnel reflectance at normal incidence (for metals use albedo color).
	vec3 F0 = mix(Fdielectric, albedo, metalness);
	
	////
	// AMBIENT LIGHTING
	////
	vec3 ambientLighting = vec3(0.15f,0.15f,0.15f);
	
	{
		// Sample diffuse irradiance at normal direction.
		vec3 irradiance = texture(irradianceTexture, normal).rgb;

		// Calculate Fresnel term for ambient lighting.
		// Since we use pre-filtered cubemap(s) and irradiance is coming from many directions
		// use cosLo instead of angle with light's half-vector (cosLh above).
		// See: https://seblagarde.wordpress.com/2011/08/17/hello-world/
		//vec3 F = fresnelSchlick(F0, cosLo);
		vec3 F = fresnelSchlickRoughness( F0, cosLo, roughness );

		// Get diffuse contribution factor (as with direct lighting).
		vec3 kd = mix(vec3(1.0) - F, vec3(0.0), metalness);

		// Irradiance map contains exitant radiance assuming Lambertian BRDF, no need to scale by 1/PI here either.
		vec3 diffuseIBL = kd * albedo * irradiance;

		// Sample pre-filtered specular reflection environment at correct mipmap level.
		int specularTextureLevels = textureQueryLevels(specularTexture);
		vec3 specularIrradiance = textureLod(specularTexture, Lr, roughness * specularTextureLevels).rgb;

		// Split-sum approximation factors for Cook-Torrance specular BRDF.
		vec2 specularBRDF = texture(specularBRDF_LUT, vec2(cosLo, roughness)).rg;

		// Total specular IBL contribution.
		vec3 specularIBL = (F0 * specularBRDF.x + specularBRDF.y) * specularIrradiance;		

		// Total ambient lighting contribution.
		ambientLighting = diffuseIBL;// + specularIBL;
	}
	
	outputColor = vec4(ambientLighting,1.0f);
}

