#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_EXT_shader_explicit_arithmetic_types_int8: require
#extension GL_EXT_shader_explicit_arithmetic_types_int16 : require
#extension GL_EXT_shader_explicit_arithmetic_types_int32 : require
#extension GL_EXT_shader_explicit_arithmetic_types_int64 : require

#extension GL_EXT_control_flow_attributes: require
#extension GL_EXT_nonuniform_qualifier: require
#extension GL_GOOGLE_include_directive: require

//layout(row_major) uniform;
//layout(row_major) buffer;
layout(std430) buffer;

#define MAX_OUTPUT_VOXELS (1 * 1024 * 1024)

#include "Common.glsl"
#include "./Utils/Frustum.glsl"
#include "./Utils/MortonCode.glsl"

// include paths based on root of shader directory
//#include "./Deferred/PBRCommon.glsl"
#include "./Voxel/VoxelCommon.glsl"
#include "./Voxel/VoxelOctreeCommon.glsl"


layout(set = 1, binding = 0) readonly uniform _VoxelInfo
{
    VoxelInfo voxelInfo;
};

// fully allocated so just unknown is page count
layout(set = 1, binding = 1) readonly buffer _ActivePages
{
	uint8_t pages[];
} ActivePages;

// these are unknown ahead of time 2 factors, voxels counts, and page count
layout(set = 2, binding = 0) readonly buffer _LevelVoxels
{
	uint8_t voxels[];
} LevelVoxels[]; 

layout(set = 3, binding = 0) writeonly buffer VoxelOutputInfo {
    ivec4 info;
} VOI;

layout(set = 3, binding = 1) writeonly buffer VoxelOutputData {
    ivec4 data[];
} VOD;

void GetOffsets(in ivec3 InPosition, in uint InLevel, GLSL_PARAM_OUT( PageIdxAndMemOffset, oMem ) )
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

bool IsActivePage(uint InGlobalOffset)
{
    uint arrayIdx = InGlobalOffset >> 3;
    uint localBit = InGlobalOffset & 0x7;
    return ( ( ( ActivePages.pages[arrayIdx] & localBit ) == 0 ) ? false : true );
}

int GetDataAtLevel(in ivec3 InlevelPos, uint InLevel)
{
    PageIdxAndMemOffset pageAndMem;
    GetOffsets(InlevelPos, InLevel, pageAndMem);

    uint voxelLevelStart = voxelInfo.voxelLevelOffsetStart[InLevel];
    uint globalBufferIdx = voxelLevelStart + pageAndMem.pageIDX;

    /*
    if( IsActivePage( globalOffset )  == false )
    {
        return 0;
    }
    */

    return LevelVoxels[nonuniformEXT(globalBufferIdx)].voxels[pageAndMem.memoffset];
}

int GetUnScaledAtLevel(in ivec3 InPosition, uint InLevel)
{
    ivec3 levelPos = ShiftDown(InPosition, InLevel);
    return GetDataAtLevel(levelPos, InLevel);
}

bool ValidSample(in vec3 InPos) 
{
    if (any(lessThan(InPos, vec3(0.0f) )) ||
        any(greaterThanEqual( ivec3(InPos), voxelInfo.dimensions)) )
    {
        return false;
    }

    return true;
}


const uint NodeCacheSize = 2048;
const uint NodeCacheMask = (NodeCacheSize - 1);

//16KB normal good?
shared NodeToWalk nodesToWalk[NodeCacheSize];

shared uint currentNodeRead;
shared uint currentNodeWrite;

shared uint currentOutputIdx;
shared uint currentTotalProcessed;
shared uint currentTotalTest;

shared uint initialWriteCount;

shared vec4 FrustumPlanes[5];
shared mat4 WorldToScreen;
shared float DepthFactor;

void AddNodeCheck(uint64_t VoxelID, int CheckLevel, int StopLevel)
{
    uint curSpot = atomicAdd(currentNodeWrite, 1U) & NodeCacheMask;
    //SE_ASSERT(nodesToWalk[curSpot].levelID == -1);

    Constr(nodesToWalk[curSpot], VoxelID, CheckLevel, StopLevel);
}

uint DistanceToRead()
{
    uint curWrSpot = (currentNodeWrite) & NodeCacheMask;
    uint curRdSpot = (currentNodeRead) & NodeCacheMask;

    if (curWrSpot < curRdSpot)
    {
        curWrSpot += NodeCacheSize;
    }

    return curWrSpot - curRdSpot;
}

ivec3 IDToCoord(uint64_t VoxelID)
{
    ivec3 outCoord = morton_decode(VoxelID);

    //SE_ASSERT(outCoord.minCoeff() >= 0);
    //SE_ASSERT(outCoord[0] < voxelInfo.levelDimensions[0] &&
    //    outCoord[1] < voxelInfo.levelDimensions[1] &&
    //    outCoord[2] < voxelInfo.levelDimensions[2]);

    return outCoord;
}

uint64_t CoordToID(in ivec3 VoxelCoord)
{
    //SE_ASSERT(VoxelCoord.minCoeff() >= 0);
    //SE_ASSERT(VoxelCoord[0] < voxelInfo.levelDimensions[0] &&
    //    VoxelCoord[1] < voxelInfo.levelDimensions[1] &&
    //    VoxelCoord[2] < voxelInfo.levelDimensions[2]);

    return morton_encode(VoxelCoord);
}

#define INVERTED_Z 1 
#define NearClippingZ 0.127f

const float MinPixelRadius = 32.0f;
const int StartAtLevel = 8;
const int RenderLevel = 6;

float GetDepthFactor()
{
#if INVERTED_Z
    float ZToUse = 1.0f;
#else
    float ZToUse = 0.0f;
#endif
    
    // so a 1,1 in NDC space
    vec4 NDCPnt = vec4( 2.0f / ViewConstants.ViewFrame.z, 2.0f / ViewConstants.ViewFrame.w, ZToUse, 1.0f );
    vec4 NDCPntInvProj = Multiply(NDCPnt, ViewConstants.InvProjectionMatrix);
    NDCPntInvProj /= NDCPntInvProj[3];
    return NearClippingZ / NDCPntInvProj[0];
}

void Shared_Init()
{
    currentNodeRead = 0;
    currentNodeWrite = 0;
    currentOutputIdx = 0;

    currentTotalProcessed = 0;
    currentTotalTest = 0;

    for (int NodeIter = 0; NodeIter < NodeCacheSize; NodeIter++)
    {
        Constr(nodesToWalk[NodeIter]);
    }

    DepthFactor = GetDepthFactor();

    mat4 TranslationMatrix = mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -ViewConstants.ViewPosition, 1);

    WorldToScreen = Multiply(TranslationMatrix, ViewConstants.ViewProjectionMatrix);
        
    ivec3 levelDims = voxelInfo.levelDimensions[StartAtLevel];

    for (int32_t xIter = 0; xIter < levelDims[0]; xIter++)
    {
        for (int32_t yIter = 0; yIter < levelDims[1]; yIter++)
        {
            for (int32_t zIter = 0; zIter < levelDims[2]; zIter++)
            {
                ivec3 VoxelAtLevel = ivec3(xIter, yIter, zIter);

                if (GetDataAtLevel(VoxelAtLevel, StartAtLevel) != 0)
                {                
                    AddNodeCheck(CoordToID(ivec3(xIter, yIter, zIter)), StartAtLevel, StartAtLevel);
                }
            }
        }
    }

    initialWriteCount = currentNodeWrite;

    GetFrustumPlanes(FrustumPlanes, WorldToScreen);
}


void Shared_SVVO_Walk()
{
    // SHADER MIRROR
    NodeToWalk nxtNode;
    Constr(nxtNode);
            
    int32_t LoopHits = 0;
    while (true)
    {
        LoopHits++;
        NodeToWalk curNodeCpy;

        if (nxtNode.levelID >= 0)
        {
            curNodeCpy = nxtNode; 
            nxtNode.levelID = -1;
        }
        else
        {
            uint curSpot = atomicAdd(currentNodeRead, 1U) & NodeCacheMask;
            curNodeCpy = nodesToWalk[curSpot];
            nodesToWalk[curSpot].levelID = -1;
        }
        
        if (curNodeCpy.levelID < 0)
        {
            break;
        }

        atomicAdd(currentTotalProcessed, 1U);

        uint64_t CurrentVoxelID = curNodeCpy.nodeID;
        int CurrentLevel = curNodeCpy.levelID;
        ivec3 VoxelAtLevel = IDToCoord(CurrentVoxelID);

        [[branch]]
        if (GetDataAtLevel(VoxelAtLevel, CurrentLevel) != 0)
        {
            atomicAdd(currentTotalTest, 1U);

            //bool bHasEnough = (DistanceToRead() > 1024);
            float curVoxelSize = (voxelInfo.VoxelSize[CurrentLevel] * 1.22f)[0];
            vec4 VoxelCenter = Multiply( vec4(vec3(VoxelAtLevel.xyz) + vec3(0.5f, 0.5f, 0.5f), 1.0f), 
                    voxelInfo.voxelToWorld[CurrentLevel] );

            if (IsSphereInFrustum(FrustumPlanes, VoxelCenter.xyz, curVoxelSize))
            {
                //uint64_t checkVoxelID = CoordToID(VoxelAtLevel);
                //SE_ASSERT(CurrentVoxelID == checkVoxelID);

                bool bWantsRender = false;
                float DistanceToVoxel = length(VoxelCenter.xyz - ViewConstants.ViewPosition);
                float PixelRad = (DepthFactor / DistanceToVoxel) * curVoxelSize;

                if (CurrentLevel == RenderLevel || PixelRad < MinPixelRadius)
                {
                    bWantsRender = true;
                }
                else
                {
                    ivec3 nxtVoxelLevelCoord = ShiftUp(VoxelAtLevel, 1);
                    uint64_t NextLevelID = CurrentVoxelID << 3;
                    uint64_t nextCheckVoxelID = CoordToID(nxtVoxelLevelCoord);
                    //SE_ASSERT(NextLevelID == nextCheckVoxelID);

//                    if (bHasEnough)
//                    {
                          Constr(nxtNode, nextCheckVoxelID, CurrentLevel - 1, curNodeCpy.startAtLevelID);
//                        //AddNodeCheck(nextCheckVoxelID, CurrentLevel - 1, curNodeCpy.startAtLevelID);
                          continue;
//                    }
//                    else
//                    {
//                        AddNodeCheck(nextCheckVoxelID, CurrentLevel - 1, CurrentLevel - 1);
//                    }
                }

                if (bWantsRender)
                {
                    vec4 ScreenPnt = VoxelCenter * WorldToScreen;
                    ScreenPnt /= ScreenPnt[3];

                    if (ScreenPnt[2] > 0)
                    {
                        uint outRenderIDX = atomicAdd(currentOutputIdx, 1);
                        if (outRenderIDX < MAX_OUTPUT_VOXELS)
                        {
                            VOD.data[outRenderIDX] = ivec4(VoxelAtLevel, CurrentLevel);
                        }
                    }
                } // wants render
            } //sphere in frustum
        } // GetDataAtLevel

        for (int VoxLvlIter = 0; VoxLvlIter < MAX_VOXEL_LEVELS; VoxLvlIter++)
        {
            if (CurrentLevel >= curNodeCpy.startAtLevelID)
            {
                break;
            }

            if ((CurrentVoxelID & 0x7) != 0x7)
            {
                Constr(nxtNode, CurrentVoxelID + 1, CurrentLevel, curNodeCpy.startAtLevelID );
                //AddNodeCheck(CurrentVoxelID + 1, CurrentLevel, curNodeCpy.startAtLevelID);
                //bHasPush = true;
                break;
            }
            else
            {                
                CurrentVoxelID = CurrentVoxelID >> 3;
                CurrentLevel++;
            }
        }
    } //END WHILE
    
}

#ifdef _WIN32
void voxelSplat(void)
#else
layout(local_size_x=32, local_size_y=1, local_size_z=1) in;
void main(void)
#endif
{
    if (ivec2(gl_GlobalInvocationID.xy) == ivec2(0, 0))
    {       
        Shared_Init();
    }
    
    // Barrier
    memoryBarrierShared();
    barrier();

    Shared_SVVO_Walk();

    // Barrier
    memoryBarrierShared();
    barrier();

    if (ivec2(gl_GlobalInvocationID.xy) == ivec2(0, 0))
    {
        int currentOutputCnt = min(MAX_OUTPUT_VOXELS, int(atomicAdd(currentOutputIdx, 1)));
        VOI.info = ivec4(currentOutputCnt, currentNodeWrite, currentTotalTest, currentTotalProcessed);
    } 
}
