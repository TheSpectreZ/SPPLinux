#version 450
#extension GL_EXT_mesh_shader: require
#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"
#include "Utils/Random.glsl"

#define MATH_PI 3.14159265359
#define GRASS_END_DISTANCE 300.0

const uint total_local_Size = 128;
const uint total_Vertices   = 256; // local_size * 2
const uint total_Primitives = 192; // local_size * 1.5

layout(local_size_x = total_local_Size, local_size_y = 1, local_size_z = 1) in;
layout(triangles, max_vertices = total_Vertices, max_primitives = total_Primitives) out;

const uint vertices_per_blade_edge = 4;
const uint vertices_per_blade      = 2 * vertices_per_blade_edge;
const uint primitives_per_blade    = 6;
const uint max_blade_count         = total_Primitives / 6;

taskPayloadSharedEXT struct
{
    vec3 position;
    vec3 normal;
    vec3 tangent;
    vec3 bitangent;
    float height;
} inPayload;

layout(location = 0) out VertexOutput
{
    vec3 worldPos;
    vec3 normal;
    vec3 color;
    float height;
    float rootHeight;
    vec3 offset;
} vertexOutput[];

void MakePersistentLength(in vec3 v0, inout vec3 v1, inout vec3 v2, in float height)
{
    vec3 v01 = v1 - v0;
    vec3 v12 = v2 - v1;

    float L0 = length(v2 - v0);
    float L1 = length(v01) + length(v12);

    float L    = (2.0 * L0 + L1) / 3.0;
    float diff = height / L;

    v01 *= diff;
    v12 *= diff;

    v1 = v0 + v01;
    v2 = v1 + v12;
}

vec3 bezier(vec3 p0, vec3 p1, vec3 p2, float t)
{
    vec3 a = mix(p0, p1, t);
    vec3 b = mix(p1, p2, t);
    return mix(a, b, t);
}

vec3 bezierDerivative(vec3 p0, vec3 p1, vec3 p2, float t)
{
    return 2.0 * (1.0 - t) * (p1 - p0) + 2.0 * t * (p2 - p1);
}

int tsign(uint gtid, int id) 
{
    return (gtid & (1u << id)) == 0 ? 1 : -1;
}

void main()
{
    SetMeshOutputsEXT(total_Vertices, total_Primitives);

    mat4 worldToScreen = Multiply(GetTranslationMatrix(-ViewConstants.ViewPosition), ViewConstants.ViewProjectionMatrix);

    const float spacing = 0.5;
    const float grassLeaning = 0.3;
    
    vec3 patchCenter = inPayload.position;
    vec3 patchNormal = inPayload.normal;
    vec3 tangent     = inPayload.tangent;
    vec3 bitangent   = inPayload.bitangent;
    
    vec2 seed = vec2( patchCenter.x / spacing, patchCenter.z / spacing );

    float distToCam = distance(patchCenter, ViewConstants.ViewPosition);
    float bladeCountF = mix(float(max_blade_count), 2.0, pow(clamp(distToCam / (GRASS_END_DISTANCE * 1.05), 0.0, 1.0), 0.75));
    uint bladeCount   = uint( ceil(bladeCountF) );

    const uint vertexCount    = bladeCount * vertices_per_blade;
    const uint primitiveCount = bladeCount * primitives_per_blade;

    for(int i = 0; i < 2; i++)
    {
        uint vertId = gl_LocalInvocationID.x + total_local_Size * i;
        if(vertId >= vertexCount) 
            break;

        uint bladeId     = vertId / vertices_per_blade;
        uint vertIdLocal = vertId % vertices_per_blade;

        float height = inPayload.height + RandomFloat( float(bladeId), 20.0, seed + vec2(vertIdLocal) ) / 40.0;
        
        float angle    = 2 * MATH_PI * RandomFloat(4, float(bladeId), seed + vec2(vertIdLocal));
        vec3 direction = vec3( cos(angle), 0.0, sin(angle) );

        float offsetAngle  = 2 * MATH_PI * RandomFloat(0.0, float(bladeId), seed + vec2(vertIdLocal));
        float offsetRadius = spacing * sqrt( RandomFloat(100, float(bladeId), seed + vec2(vertIdLocal)) );

        vec3 bladeOffset   = offsetRadius * cos(offsetAngle) * tangent + sin(offsetAngle) * bitangent;

        vec3 p0 = patchCenter + bladeOffset;
        vec3 p1 = p0 + vec3(0.0, height, 0.0);
        vec3 p2 = p1 + direction * height * grassLeaning;

        MakePersistentLength(p0, p1, p2, height);

        float width = 0.03 * (max_blade_count / bladeCountF);
        if(bladeId == (bladeCount - 1))
        {
            width *= fract(bladeCountF);
        }

        vec3 sideVec = normalize( vec3(direction.z, 0, -direction.x) );
        vec3 offset  = tsign(vertIdLocal, 0) * width * sideVec;

        p0 += offset * 1.0;
        p1 += offset * 0.7;
        p2 += offset * 0.3;

        float t = (vertIdLocal * 0.5) / float(vertices_per_blade_edge - 1);
        vec3 position = bezier(p0, p1, p2, t);

        vertexOutput[vertId].rootHeight = p0.y;
        vertexOutput[vertId].height = height;
        vertexOutput[vertId].color = vec3(0.2, 1.0, 0.2);
        vertexOutput[vertId].normal = cross(sideVec, normalize(bezierDerivative(p0, p1, p2, t)));
        vertexOutput[vertId].worldPos = position;
        vertexOutput[vertId].offset = bladeOffset;

        gl_MeshVerticesEXT[vertId].gl_Position = worldToScreen * vec4(position, 1.0);
    }

    for(uint i = 0; i < 2; i++)
    {
        uint primId = gl_LocalInvocationID.x + total_local_Size * i;
        if(primId >= primitiveCount)
            break;

        uint bladeId = primId / primitives_per_blade;
        uint primIdLocal = primId % primitives_per_blade;

        uint offset = bladeId * vertices_per_blade + 2 * (primIdLocal / 2);

        uvec3 indices = (primIdLocal & 1) == 0 ? uvec3(0, 1, 2) : uvec3(3, 2, 1);
        gl_PrimitiveTriangleIndicesEXT[primId] = offset + indices;
    }
}