#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

layout(std430) buffer;

const int MAX_TEX_COORDS = 3;
const int MAX_VERTEX_COLOR_CHANNELS = 3;
const int MAX_BONES_PER_VERT = 3;

layout (location = 0) in vec3 inPos;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec2 inUV[MAX_TEX_COORDS];
layout (location = 5) in vec4 inVertexColor[MAX_VERTEX_COLOR_CHANNELS];

//
layout (location = 0) out vec4 outDiffuse;
// specular, metallic, roughness, emissive
layout (location = 1) out vec4 outSMRE;
// 
layout (location = 2) out vec4 outNormal;

void main()
{	
	outDiffuse = vec4( inVertexColor[0].xyz, 1.0f );
	outSMRE = vec4( inVertexColor[1].xyz, 0.0f );	
	outNormal = vec4(inNormal * 0.5f + vec3(0.5f), 1.0);
}
