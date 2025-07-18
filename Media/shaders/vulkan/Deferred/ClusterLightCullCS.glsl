#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

#define MAX_LIGHT_PER_CLUSTER 50 // This should match in VulkanDeferredLighting.h

struct VolumeTileAABB
{
    vec4 minPoint;
    vec4 maxPoint;
};

struct LightGrid 
{
    int pointLightIndices[MAX_LIGHT_PER_CLUSTER];
    int spotLightIndices[MAX_LIGHT_PER_CLUSTER];
};

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

layout(set = 1, binding = 0) readonly buffer _ClusterBuffer
{
    VolumeTileAABB cluster[];
} ClusterBuffer;

layout(set = 1, binding = 1) buffer _LightGridBuffer
{
    LightGrid grid[];
} LightGridBuffer;

layout(set = 1, binding = 2) readonly buffer _PointLightBuffer
{
    PointLightInfo pointlight[];
} PointLightBuffer;

layout(set = 1, binding = 3) readonly buffer _SpotLightBuffer
{
    SpotLightInfo spotlight[];
} SpotLightBuffer;

layout(push_constant) uniform _PushConstant
{
    uint pointlightCount;
    uint spotlightCount;
} PushConstant;

bool testSphereAABB(uint tile, vec3 center, float radius)
{
    VolumeTileAABB currentCell = ClusterBuffer.cluster[tile];

    vec3 closestPoint = clamp(center, currentCell.minPoint.xyz, currentCell.maxPoint.xyz);
    float distSqrd = dot(closestPoint - center, closestPoint - center);
    return distSqrd <= radius * radius;
}

bool testConeAABB(uint tile, vec3 position, float range, vec3 direction, float cosLightAngle, float sinLightAngle)
{
    VolumeTileAABB currentCell = ClusterBuffer.cluster[tile];

    vec3 center = (currentCell.maxPoint.xyz + currentCell.minPoint.xyz) * 0.5;
    float radius = length((currentCell.maxPoint.xyz - currentCell.minPoint.xyz) * 0.5);

    vec3 v = center - position;
    float lenSq = dot(v, v);
    float v1Len = dot(v, direction);

    float distanceClosestPoint = cosLightAngle * sqrt( lenSq - v1Len * v1Len) - v1Len * sinLightAngle;

    bool angleCull = distanceClosestPoint > radius;
    bool frontCull = v1Len > radius + range;
    bool backCull  = v1Len < -radius;

    return !(angleCull && frontCull && backCull);
}

layout(local_size_x = 128, local_size_y = 1, local_size_z = 1) in;

void main()
{
    uint tileIndex  = gl_WorkGroupID.x * gl_WorkGroupSize.x + gl_LocalInvocationID.x;   
    mat4 ToViewPosition = ViewConstants.ViewMatrix *  GetTranslationMatrix(-ViewConstants.ViewPosition);

    uint pointlightCount = 0;
    for(int Iter = 0; Iter < PushConstant.pointlightCount; Iter++)
    {
        PointLightInfo light = PointLightBuffer.pointlight[Iter];
        if(light.enabled)
        {
            vec3 center = Multiply(vec4(light.position, 1.0), ToViewPosition).xyz;

            if(testSphereAABB(tileIndex, center, light.range))
            {
                if(pointlightCount >= MAX_LIGHT_PER_CLUSTER)
                    break;

                LightGridBuffer.grid[tileIndex].pointLightIndices[pointlightCount] = Iter;
                pointlightCount++;
            }   
        }
    }
    
    if(pointlightCount < MAX_LIGHT_PER_CLUSTER) 
    {
        LightGridBuffer.grid[tileIndex].pointLightIndices[pointlightCount] = -1;
    }

    uint spotlightCount = 0;
    for(int Iter = 0; Iter < PushConstant.spotlightCount; Iter++)
    {
        SpotLightInfo light = SpotLightBuffer.spotlight[Iter];
        if(light.enabled)
        {
            if(testConeAABB(tileIndex, light.position, light.range, light.direction, light.cosCutoff, light.sinCutoff))
            {
                if(spotlightCount >= MAX_LIGHT_PER_CLUSTER)
                    break;
                
                LightGridBuffer.grid[tileIndex].spotLightIndices[spotlightCount] = Iter;
                spotlightCount++;
            }
        }
    }

    if(spotlightCount < MAX_LIGHT_PER_CLUSTER)
    {
        LightGridBuffer.grid[tileIndex].spotLightIndices[spotlightCount] = -1;
    }
}