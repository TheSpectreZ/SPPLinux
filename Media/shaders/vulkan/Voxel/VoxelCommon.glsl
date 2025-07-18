

#define MAX_VOXEL_LEVELS 15

struct VoxelInfo
{
    int activeLevels;
    uint pageSize;    
    ivec3 dimensions;

    mat4 worldToVoxel[MAX_VOXEL_LEVELS];  
    mat4 voxelToWorld[MAX_VOXEL_LEVELS];  

    ivec3 levelDimensions[MAX_VOXEL_LEVELS];
    ivec3 levelDimensionsP2[MAX_VOXEL_LEVELS];

    vec3 VoxelSize[MAX_VOXEL_LEVELS];
    vec3 HalfVoxel[MAX_VOXEL_LEVELS];

    ivec3 spatialSubsetMask[MAX_VOXEL_LEVELS];
    ivec3 spatialSubsetVoxelDimensions[MAX_VOXEL_LEVELS];
    ivec3 spatialSubsetVoxelDimensionsP2[MAX_VOXEL_LEVELS];
    ivec3 spatialSubsetCounts[MAX_VOXEL_LEVELS];

    uint voxelLevelOffsetStart[MAX_VOXEL_LEVELS];
};

struct PageIdxAndMemOffset
{
    uint pageIDX;
    uint memoffset;
};


ivec3 ShiftDown(in ivec3 InValue, in ivec3 ShiftVec)
{
    return ivec3( InValue.x >> ShiftVec.x,
        InValue.y >> ShiftVec.y,
        InValue.z >> ShiftVec.z);
}
ivec3 ShiftDown(in ivec3 InValue, in uint ShiftValue)
{
    return ivec3( InValue.x >> ShiftValue,
        InValue.y >> ShiftValue,
        InValue.z >> ShiftValue);
}

ivec3 ShiftUp(in ivec3 InValue, in uint ShiftValue)
{
    return ivec3(InValue.x << ShiftValue,
        InValue.y << ShiftValue,
        InValue.z << ShiftValue);
}

