#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require
#extension GL_EXT_shader_explicit_arithmetic_types_int8: require
#extension GL_EXT_control_flow_attributes: require
#extension GL_EXT_nonuniform_qualifier: require
#extension GL_GOOGLE_include_directive: require

//layout(row_major) uniform;
//layout(row_major) buffer;
layout(std430) buffer;

//#include "Common.glsl"
// include paths based on root of shader directory
//#include "./Deferred/PBRCommon.glsl"
#include "./Voxel/VoxelCommon.glsl"

layout(set = 0, binding = 0) readonly uniform _VoxelInfo
{
    VoxelInfo voxelInfo;
};

layout(set = 0, binding = 1) readonly buffer _ActivePages
{
	uint8_t bitset[];
} ActivePages;

layout(set = 1, binding = 0) readonly buffer _VoxelData
{
	uint8_t voxels[];
} VoxelData[];

layout(set = 1, binding = 1) writeonly buffer _SDFData
{
	uint8_t sdf[];
} SDFData;

const ivec3 checkDirections[6]=ivec3[6](
	ivec3(1, 0, 0),
	ivec3(-1, 0, 0),
	ivec3(0, 1, 0),
	ivec3(0, -1, 0),
    ivec3(0, 0, -1),
    ivec3(0, 0, 1)
);


void GetOffsets(in ivec3 InPosition, in uint InLevel, out PageIdxAndMemOffset oMem)
{           
    // find the local voxel
    ivec3 LocalVoxel = ivec3( InPosition.x & voxelInfo.spatialSubsetMask[InLevel].x,
        InPosition.y & voxelInfo.spatialSubsetMask[InLevel].y,
        InPosition.z & voxelInfo.spatialSubsetMask[InLevel].z);

    uint localVoxelIdx = (LocalVoxel.x +
        LocalVoxel.y * voxelInfo.spatialSubsetVoxelDimensions[InLevel].x +
        LocalVoxel.z * voxelInfo.spatialSubsetVoxelDimensions[InLevel].x * voxelInfo.spatialSubsetVoxelDimensions[InLevel].y);

    // find which page we are on
    ivec3 PageCubePos = ShiftDown(InPosition, voxelInfo.spatialSubsetVoxelDimensionsP2[InLevel]);
    uint pageIdx = (PageCubePos.x +
        PageCubePos.y * voxelInfo.spatialSubsetCounts[InLevel].x +
        PageCubePos.z * voxelInfo.spatialSubsetCounts[InLevel].x * voxelInfo.spatialSubsetCounts[InLevel].y);
    
    // no longer need (pageIdx * voxelInfo.pageSize) with unbounded buffer sets
    uint memOffset = localVoxelIdx;

    oMem.pageIDX = pageIdx;
    oMem.memoffset = memOffset;
}

int GetUnScaledAtLevel(in ivec3 InPosition, uint InLevel)
{
    PageIdxAndMemOffset pageAndMem;
    GetOffsets(InPosition, InLevel, pageAndMem);
    return VoxelData[nonuniformEXT(InLevel)].voxels[pageAndMem.memoffset];
}

bool ValidSample(in ivec3 InPos) 
{
    if (any(lessThan(InPos, ivec3(0.0f) )) ||
        any(greaterThanEqual(InPos, voxelInfo.dimensions)) )
    {
        return false;
    }

    return true;
}

layout(local_size_x=16, local_size_y=8, local_size_z=8) in;
void main(void)
{
    uvec3 voxelPosition = gl_GlobalInvocationID.xyz;

	
}
