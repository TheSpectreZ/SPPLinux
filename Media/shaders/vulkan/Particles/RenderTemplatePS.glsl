#version 450

#extension GL_EXT_shader_16bit_storage: require 
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

layout(std430) buffer;

#include "Common.glsl"
#include "Utils/Random.glsl"
#include "Utils/Noise.glsl"

layout (location = 0) in vec3 inPos;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec2 inUV[MAX_TEX_COORDS];
layout (location = 5) in vec4 inVertexColor[MAX_VERTEX_COLOR_CHANNELS];

<<UNIFORM_BLOCK>>

layout(location = 0) out vec4 outDiffuse;
layout(location = 1) out vec4 outSMRE;
layout(location = 2) out vec4 outNormal;

layout(push_constant) uniform _PushConstant
{
    float RandomSeed;
} PushConstant;

void main()
{
    vec3 normal         = vec3(0.0, 0.0, 1.0);
    vec3 diffuse        = vec3(1.0, 1.0, 1.0);

    float translucency  = 1.0;
    float specular      = 0.5;
    float metallic      = 0.0;
    float roughness     = 0.5;
    float emissive      = 0.0;
    
    float seed = PushConstant.RandomSeed; // (SPECTER) do we need unique seed for each fragment ??

    {

<<MATERIAL_OUTPUT>>

    }

    outDiffuse  = vec4(inVertexColor[0]) * vec4(diffuse, translucency); 
    outSMRE     = vec4(specular, metallic, roughness, emissive);
    outNormal   = vec4(normal, 1.0);
}