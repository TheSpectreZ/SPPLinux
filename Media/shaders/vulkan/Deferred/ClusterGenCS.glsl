#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

#include "Common.glsl"

layout(local_size_x = 1, local_size_y = 1, local_size_z = 1) in;

struct VolumeTileAABB
{
    vec4 minPoint;
    vec4 maxPoint;
};

layout(set = 1, binding = 0) buffer _ClusterBuffer
{
    VolumeTileAABB cluster[];
} ClusterBuffer;

layout(push_constant) uniform _PushConstant
{
    float NearZ, FarZ;
} PushConstant;

//Creates a line from the eye to the screenpoint, then finds its intersection
//With a z oriented plane located at the given distance to the origin
vec3 lineIntersectionToZPlane(vec3 A, vec3 B, float zDistance){
    //Because this is a Z based normal this is fixed
    vec3 normal = vec3(0.0, 0.0, 1.0);

    vec3 ab =  B - A;

    //Computing the intersection length for the line and the plane
    float t = (zDistance - dot(normal, A)) / dot(normal, ab);

    //Computing the actual xyz position of the point along the line
    vec3 result = A + t * ab;

    return result;
}

vec3 screen2View(vec2 screen){
    //Convert to NDC
    vec2 texCoord = screen.xy / ViewConstants.ViewFrame.zw;

    //Convert to clipSpace    
    vec4 clip = vec4(vec2(texCoord.x, texCoord.y) * 2.0 - 1.0, -1.0, 1.0);
 
    //View space transform
    vec4 view = Multiply(clip, ViewConstants.InvProjectionMatrix);
    view = view / view.w;

    return view.xyz;    
}

void main()
{
    // Eye position is zero in view space
    const vec3 eyePos = vec3(0.0);

    // Per Tile Variable
    vec2 tileSize = ViewConstants.ViewFrame.zw / vec2(gl_NumWorkGroups.xy);
    uint tileIndex = gl_WorkGroupID.x 
                   + gl_WorkGroupID.y * (gl_NumWorkGroups.x)
                   + gl_WorkGroupID.z * (gl_NumWorkGroups.x * gl_NumWorkGroups.y);

    // Calculating min and max point in screen space
    vec2 maxPoint_sS = (gl_WorkGroupID.xy + 1) * tileSize;
    vec2 minPoint_sS = (gl_WorkGroupID.xy) * tileSize;

    // Pass min and max to view space
    vec3 maxPoint_vS = screen2View(maxPoint_sS);
    vec3 minPoint_vS = screen2View(minPoint_sS);

    // Near and far values of the cluster in view space
    float tileNear = PushConstant.NearZ * pow( PushConstant.FarZ/ PushConstant.NearZ, (gl_WorkGroupID.z)/float(gl_NumWorkGroups.z) );
    float tileFar  = PushConstant.NearZ * pow( PushConstant.FarZ/ PushConstant.NearZ, (gl_WorkGroupID.z+1)/float(gl_NumWorkGroups.z ));

    // Finding the 4 intersection points made from the maxPoint to the cluster near/far plane
    vec3 minPointNear = lineIntersectionToZPlane(eyePos, minPoint_vS, tileNear);
    vec3 minPointFar = lineIntersectionToZPlane(eyePos, minPoint_vS, tileFar);
    vec3 maxPointNear = lineIntersectionToZPlane(eyePos, maxPoint_vS, tileNear);
    vec3 maxPointFar = lineIntersectionToZPlane(eyePos, maxPoint_vS, tileFar);

    vec3 minPointAABB = min(min(minPointNear, minPointFar), min(maxPointNear, maxPointFar));
    vec3 maxPointAABB = max(max(minPointNear, minPointFar), max(maxPointNear, maxPointFar));

    ClusterBuffer.cluster[tileIndex].minPoint = vec4(minPointAABB, 0.0);
    ClusterBuffer.cluster[tileIndex].maxPoint = vec4(maxPointAABB, 0.0);
}