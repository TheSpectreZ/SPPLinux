#version 450

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

layout (location = 0) in VertexInput 
{
    vec3 worldPos;
    vec3 normal;
    vec3 color;
    float height;
    float rootHeight;
} vertexInput;

layout(location = 0) out vec4 outDiffuse;
layout(location = 1) out vec4 outSMRE;
layout(location = 2) out vec4 outNormal;

 
void main()
{
    float selfShadow = clamp( pow( (vertexInput.worldPos.y - vertexInput.rootHeight)/ vertexInput.height, 1.5 ), 0, 1 );
    
    vec3 color = pow( vec3(vertexInput.color), vec3(2.2) ) * selfShadow * 0.75;

	outDiffuse = vec4(color, 1.0);
    outNormal = vec4(vertexInput.normal, 1.0);
}
