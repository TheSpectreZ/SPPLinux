const int MAX_TEX_COORDS = 3;
const int MAX_VERTEX_COLOR_CHANNELS = 3;

layout(location = 0) in vec3 inPos;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inUV[MAX_TEX_COORDS];
layout(location = 5) in vec4 inVertexColor[MAX_VERTEX_COLOR_CHANNELS];

<<UNIFORM_BLOCK>>

layout(location = 0) out vec4 outDiffuse;
layout(location = 1) out vec4 outSMRE;
layout(location = 2) out vec4 outNormal;

void main()
{
    vec3 normal     = vec3(0.5, 0.5, 1.0);
    vec3 diffuse    = vec3(0.0, 1.0, 0.0);

    float translucency = 1.0;
    float specular = 0.5;
    float metallic = 0.0;
    float roughness = 0.5;
    float emissive = 0.0;

    {
        <<MATERIAL_OUTPUT>>
    }

    vec3 N = normalize(inNormal);

    // derivations of the fragment position
    vec3 pos_dx = dFdx(inPos);
    vec3 pos_dy = dFdy(inPos);
    // derivations of the texture coordinate
    vec2 texC_dx = dFdx(inUV[0]);
    vec2 texC_dy = dFdy(inUV[0]);

    // tangent vector and binormal vector
    vec3 T = texC_dy.y * pos_dx - texC_dx.y * pos_dy;
    vec3 B = texC_dx.x * pos_dy - texC_dy.x * pos_dx;

    mat3 TBN = mat3(T, B, N);
    vec3 tnorm = TBN * normalize(normal * 2.0 - vec3(1.0));

    outDiffuse = vec4(diffuse, translucency);
    outSMRE = vec4(specular, metallic, roughness, emissive);
    outNormal = vec4(tnorm * 0.5 + vec3(0.5), 1.0);
}