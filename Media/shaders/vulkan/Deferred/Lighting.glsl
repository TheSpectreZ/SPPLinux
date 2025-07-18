#include "./Deferred/PBRCommon.glsl"

struct PointLightInfo
{
    vec3 position; float range;
    vec3 color; float intensity;
    float falloff; bool enabled;
};

struct SpotLightInfo
{
    vec3 position; float range;
    vec3 color; float intensity;
    vec3 direction; bool enabled;
    float cosCutoff; float sinCutoff; float falloff; 
};

vec3 CalculateBRDF(vec3 Li, vec3 Lh, vec3 Lo, float cosLo, vec3 normal, vec3 F0, vec3 albedo, vec3 Lradiance, vec4 smre)
{
    float cosLi = max(0.0, dot(normal, Li));
    float cosLh = max(0.0, dot(normal, Lh));

    vec3  F = fresnelSchlick(F0, max(0.0, dot(Lh, Lo)));
    float D = ndfGGX(cosLh, smre.b);
    float G = gaSchlickGGX(cosLi, cosLo, smre.b);

    // Diffuse scattering happens due to light being refracted multiple times by a dielectric medium.
	// Metals on the other hand either reflect or absorb energy, so diffuse contribution is always zero.
	// To be energy conserving we must scale diffuse BRDF contribution based on Fresnel factor & metalness.	    
    vec3 kd = mix( vec3(1.0) - F, vec3(0.0), smre.g);

    // Lambert diffuse BRDF.
    // We don't scale by 1/PI for lighting & material units to be more convenient.
    // See: https://seblagarde.wordpress.com/2012/01/08/pi-or-not-to-pi-in-game-lighting-equation/
    vec3 diffuseBRDF = kd * albedo;

    // Cook-Torrance specular microfacet BRDF.
    vec3 specularBRDF = ( F * D * G ) / max( Epsilon, 4.0 * cosLi * cosLo );

    return (diffuseBRDF + specularBRDF) * Lradiance * cosLi;
}

vec3 CalculatePointLight(PointLightInfo light, vec3 worldPosition, vec3 normal, vec3 Lo, float cosLo, vec3 F0, vec3 albedo, vec4 smre) 
{
    vec3 lightVector = light.position - worldPosition;
    float lightDistance = length(lightVector);
    
    float attenuation =  clamp(1.0 - (lightDistance * lightDistance) / (light.range * light.range), 0.0, 1.0); 
    attenuation *= mix(attenuation, 1.0, 1.0 / light.falloff);
    
    if(attenuation <= 0.0)
        return vec3(0.0, 0.0, 0.0);

    vec3 Li = normalize(lightVector);
    vec3 Lh = normalize(Li + Lo);
    vec3 Lradiance = light.color * light.intensity * attenuation;

    return CalculateBRDF(Li, Lh, Lo, cosLo, normal, F0, albedo, Lradiance, smre);
}

vec3 CalculateSpotLight(SpotLightInfo light, vec3 worldPosition, vec3 normal, vec3 Lo, float cosLo, vec3 F0, vec3 albedo, vec4 smre)
{
    vec3 lightVector = light.position - worldPosition;
    vec3 Li = normalize(lightVector);

    float spotFactor = dot(Li, light.direction);

    if(spotFactor <= light.cosCutoff)
        return vec3(0.0, 0.0, 0.0);

    float lightDistance = length(lightVector);
    
    float attenuation =  clamp(1.0 - (lightDistance * lightDistance) / (light.range * light.range), 0.0, 1.0); 
    attenuation *= mix(attenuation, 1.0, 1.0 / light.falloff);
    
    if(attenuation <= 0.0)
        return vec3(0.0, 0.0, 0.0);

    attenuation *= (1.0 - (1.0 - spotFactor) * 1.0/(1.0 - light.cosCutoff));
    
    vec3 Lh = normalize(Li + Lo);
    vec3 Lradiance = light.color * light.intensity * attenuation;

    return CalculateBRDF(Li, Lh, Lo, cosLo, normal, F0, albedo, Lradiance, smre);
}