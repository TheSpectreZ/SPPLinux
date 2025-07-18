
// include paths based on root of shader directory
#include "CommonMath.glsl"
#include "PBRCommon.glsl"

//layout (set = 1, binding = 0) uniform sampler2D shadowAttenuation;

layout(binding = 0) uniform _ViewConstants
{
	//all origin centered
	mat4 ViewMatrix;
	mat4 ViewProjectionMatrix;
	mat4 ProjectionMatrix;

	mat4 InvViewProjectionMatrix;
	mat4 InvProjectionMatrix;

	vec3 ViewPosition;
	vec4 CameraFrustum[6];

	ivec4 ViewFrame;
	float RecipTanHalfFovy;
} ViewConstants;

layout(binding = 1) uniform _LightParams
{
	vec4 LightDirectionAndIntensity;
	vec4 Color;
	vec4 GroundColor;
} LightParams;

layout (location = 0) in vec4 inPixelPosition;
layout (location = 1) in vec2 inUV;

layout (location = 0) out vec4 outputColor;

// pixel shader shader
void main()
{
    vec2 fulltargetSize = vec2(textureSize(samplerDepth, 0));	
	vec2 recalcUV = gl_FragCoord.xy / fulltargetSize;

	// Get G-Buffer values
	float zDepthNDC = texture(samplerDepth, recalcUV).r;
	
	if(zDepthNDC <= 0)
	{
		discard;
	}
	
	float shadowValue = 1.0;// texture(shadowAttenuation, recalcUV).r;

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

	// Outgoing light direction (vector from world-space fragment position to the "eye").
	vec3 Lo = normalize(ViewConstants.ViewPosition - objWorldPosition);
	
	// Angle between surface normal and outgoing light direction.
	float cosLo = max(0.0, dot(normal, Lo));
		
	// Specular reflection vector.
	vec3 Lr = 2.0 * cosLo * normal - Lo;

	// Fresnel reflectance at normal incidence (for metals use albedo color).
	vec3 F0 = mix(Fdielectric, albedo, metalness);
	
	vec3 directLighting = vec3(0.0, 0.0, 0.0);
	{
		vec3 Li = -LightParams.LightDirectionAndIntensity.xyz;

		float costheta = dot(normal, Li);
		float a = 0.5 + 0.5 * costheta;
		vec3 lightColor = mix(LightParams.GroundColor.rgb, LightParams.Color.rgb, a);

		vec3 Lradiance = lightColor * LightParams.LightDirectionAndIntensity.w;

		// Half-vector between Li and Lo.
		vec3 Lh = normalize(Li + Lo);
	
		// Calculate angles between surface normal and various light vectors.
		float cosLi = max(0.3, dot(normal, Li));
		float cosLh = max(0.3, dot(normal, Lh));

		// Calculate Fresnel term for direct lighting. 
		vec3 F  = fresnelSchlick(F0, max(0.3, dot(Lh, Lo)));
		// Calculate normal distribution for specular BRDF.
		float D = ndfGGX(cosLh, roughness);
		// Calculate geometric attenuation for specular BRDF.
		float G = gaSchlickGGX(cosLi, cosLo, roughness);

		// Diffuse scattering happens due to light being refracted multiple times by a dielectric medium.
		// Metals on the other hand either reflect or absorb energy, so diffuse contribution is always zero.
		// To be energy conserving we must scale diffuse BRDF contribution based on Fresnel factor & metalness.
		vec3 kd = mix(vec3(1.0) - F, vec3(0.0), metalness);

		// Lambert diffuse BRDF.
		// We don't scale by 1/PI for lighting & material units to be more convenient.
		// See: https://seblagarde.wordpress.com/2012/01/08/pi-or-not-to-pi-in-game-lighting-equation/
		vec3 diffuseBRDF = kd * albedo;

		// Cook-Torrance specular microfacet BRDF.
		vec3 specularBRDF = (F * D * G) / max(Epsilon, 4.0 * cosLi * cosLo);

		// Total contribution for this light.
		directLighting = (diffuseBRDF + specularBRDF) * Lradiance * cosLi * shadowValue;
	}
	
	outputColor = vec4(directLighting, 1.0f);
}

