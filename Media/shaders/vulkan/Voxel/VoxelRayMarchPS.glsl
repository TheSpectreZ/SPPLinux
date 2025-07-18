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

#include "Common.glsl"

#include "./Utils/Frustum.glsl"
// include paths based on root of shader directory
//#include "./Deferred/PBRCommon.glsl"
#include "./Voxel/VoxelCommon.glsl"

layout(set = 1, binding = 0) uniform sampler2D noiseTexture;
layout(set = 1, binding = 1) readonly uniform _VoxelInfo
{
    VoxelInfo voxelInfo;
};
layout(set = 1, binding = 2) readonly buffer _LevelVoxels
{
	uint8_t voxels[];
} LevelVoxels[];

//INPUT FROM VS
layout (location = 0) in vec4 inPixelPosition;
layout (location = 1) in vec2 inUV;

//OUTPUT TO MRTs
layout (location = 0) out vec4 outDiffuse;
// specular, metallic, roughness, emissive
layout (location = 1) out vec4 outSMRE;
// 
layout (location = 2) out vec4 outNormal;

struct RayInfo
{
	vec3 rayOrg;
	vec3 rayDir;
    vec3 rayDirSign;
    vec3 rayDirInvAbs;
    vec3 rayDirInv;
    int curMisses;
    
    vec3 lastStep;
};

struct VoxelHitInfo
{
    vec3 location;
    vec3 normal;
    ivec3 samplePos;
    uint totalChecks;
    int voxelID;
};

struct Stepping
{
    vec3 step;
    vec3 tDelta;
};

const vec3 colorPallete[5]=vec3[5](
	vec3(0.211, 0.224, 0.270),
	vec3(0.370, 0.188, 0.0185),
	vec3(0.125, 0.390, 0.169),
	vec3(0.956, 0.990, 0.475),
    vec3(0.470, 0.657, 0.980)
);

Stepping stepInfos[MAX_VOXEL_LEVELS];


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
                       
    uint memOffset = (pageIdx * voxelInfo.pageSize) + localVoxelIdx; // always 1 * _dataTypeSize;

    oMem.pageIDX = pageIdx;
    oMem.memoffset = memOffset;
}

int GetUnScaledAtLevel(in ivec3 InPosition, uint InLevel)
{
    ivec3 levelPos = ShiftDown(InPosition, InLevel);
    PageIdxAndMemOffset pageAndMem;
    GetOffsets(levelPos, InLevel, pageAndMem);
    return LevelVoxels[nonuniformEXT(InLevel)].voxels[pageAndMem.memoffset];
}

bool ValidSample(in vec3 InPos) 
{
    if (any(lessThan(InPos, vec3(0.0f) )) ||
        any(greaterThanEqual(InPos, voxelInfo.dimensions)) )
    {
        return false;
    }

    return true;
}

bool CastRay(in vec3 rayOrg, in vec3 rayDir, out VoxelHitInfo oInfo)
{
    RayInfo rayInfo;

    rayInfo.rayOrg = rayOrg;
    
    float epsilon = 0.001f;
    vec3 DirZeroEpsilon = vec3(equal(rayInfo.rayDir, vec3(0, 0, 0))) * epsilon;

    rayInfo.rayDir = rayDir + DirZeroEpsilon;
    rayInfo.rayDirSign = sign(rayInfo.rayDir);
    rayInfo.rayDirInv = 1.0f / rayDir;
    rayInfo.rayDirInvAbs = abs(rayInfo.rayDirInv);

    float timeToHit = 0;

    [[branch]]
    if(!Intersect_RayAABB(rayInfo.rayOrg, 
        rayInfo.rayDirInv,
        vec3(0,0,0), 
        vec3(voxelInfo.dimensions), 
        timeToHit))
    {
        return false;
    }
    
    rayInfo.rayOrg = rayInfo.rayOrg + ( rayInfo.rayDir * (timeToHit + epsilon) );
    
    uint CurrentLevel = voxelInfo.activeLevels - 1;
    uint LastLevel = 0;

    [[unroll]]
    for (int Iter = 0; Iter < MAX_VOXEL_LEVELS; Iter++)
    {
        stepInfos[Iter].step = voxelInfo.VoxelSize[Iter] * rayInfo.rayDirSign;
        stepInfos[Iter].tDelta = voxelInfo.VoxelSize[Iter] * rayInfo.rayDirInvAbs;
    }

	// get in correct voxel spacing
	vec3 voxel = floor(rayInfo.rayOrg / voxelInfo.VoxelSize[CurrentLevel]) * voxelInfo.VoxelSize[CurrentLevel];
	vec3 tMax = (voxel - rayInfo.rayOrg + voxelInfo.HalfVoxel[CurrentLevel] + stepInfos[CurrentLevel].step * vec3(0.5f, 0.5f, 0.5f)) * (rayInfo.rayDirInv);

	vec3 dim = vec3(0, 0, 0);
	vec3 samplePos = voxel;

    oInfo.totalChecks = 0;
        
    vec3 samplePosWorld = rayInfo.rayOrg;
    float rayTime = 0.0f;
    
    rayInfo.lastStep = rayInfo.rayDir;

    for (int Iter = 0; Iter < 128; Iter++)
    {
        LastLevel = CurrentLevel;

        if (!ValidSample(samplePos))
        {
            return false;
        }

        oInfo.totalChecks++;

        bool bDidStep = false;
        bool bLevelChangeRecalc = false;

        int voxelHit = GetUnScaledAtLevel(ivec3(samplePos), CurrentLevel);
        // we hit something?
        if (voxelHit != 0)
        {
            rayInfo.curMisses = 0;

            if (CurrentLevel == 0)
            {
                vec3 normal = -sign(rayInfo.lastStep);
                oInfo.normal = normal;

                vec3 VoxelCenter = samplePos + voxelInfo.HalfVoxel[CurrentLevel];
                vec3 VoxelPlaneEdge = VoxelCenter + voxelInfo.HalfVoxel[CurrentLevel] * normal;
                float denom = dot(normal, rayInfo.rayDir);
                if (denom == 0)
                    denom = 0.0000001f;
                vec3 p0l0 = (VoxelPlaneEdge - rayInfo.rayOrg);
                float t = dot(p0l0, normal) / denom;
                oInfo.location = rayInfo.rayOrg + rayInfo.rayDir * t;
                oInfo.voxelID = voxelHit;
                oInfo.samplePos = ivec3(samplePos);

                return true;
            }

            CurrentLevel--;
            bLevelChangeRecalc = true;
        }
        else
        {
            bDidStep = true;
            

        #if 0
            float step = FLT_MAX;
		    int dx = 0, dy = 0, dz = 0;
		    if (n.x > FLT_EPSILON)
		    {
			    float d = (v.x + s.x - p.x) / n.x;
			    if (d < step) { step = d; dx = 1; dy = 0; dz = 0; }
		    }
		    if (n.x < -FLT_EPSILON)
		    {
			    float d = (v.x - s.x - p.x) / n.x;
			    if (d < step) { step = d; dx = -1; dy = 0; dz = 0; }
		    }
		    if (n.y > FLT_EPSILON)
		    {
			    float d = (v.y + s.y - p.y) / n.y;
			    if (d < step) { step = d; dx = 0; dy = 1; dz = 0; }
		    }
		    if (n.y < -FLT_EPSILON)
		    {
			    float d = (v.y - s.y - p.y) / n.y;
			    if (d < step) { step = d; dx = 0; dy = -1; dz = 0; }
		    }
		    if (n.z > FLT_EPSILON)
		    {
			    float d = (v.z + s.z - p.z) / n.z;
			    if (d < step) { step = d; dx = 0; dy = 0; dz = 1; }
		    }
		    if (n.z < -FLT_EPSILON)
		    {
			    float d = (v.z - s.z - p.z) / n.z;
			    if (d < step) { step = d; dx = 0; dy = 0; dz = -1; }
		    }
		    x += dx; y += dy; z += dz;
		    hitN = PxVec3(float(-dx), float(-dy), float(-dz));
		    currDist = step;
        #elif 1
            [[branch]]
            if (tMax.x < tMax.y) {
                [[branch]]
				if (tMax.x < tMax.z) {
					tMax.x += stepInfos[CurrentLevel].tDelta.x;
					rayInfo.lastStep = vec3(stepInfos[CurrentLevel].step.x, 0, 0);
				}
				else {
					tMax.z += stepInfos[CurrentLevel].tDelta.z;
					rayInfo.lastStep = vec3(0, 0,  stepInfos[CurrentLevel].step.z);
				}
			}
			else {
                [[branch]]
				if (tMax.y < tMax.z) {
					tMax.y += stepInfos[CurrentLevel].tDelta.y;
					rayInfo.lastStep = vec3(0, stepInfos[CurrentLevel].step.y, 0);
				}
				else {
					tMax.z += stepInfos[CurrentLevel].tDelta.z;
					rayInfo.lastStep = vec3(0, 0, stepInfos[CurrentLevel].step.z);
				}
			}
        #else
            vec3 tMaxMins = min(tMax.yzx, tMax.zxy);
            dim = step(tMax, tMaxMins);
            tMax += dim * stepInfos[CurrentLevel].tDelta;
            rayInfo.lastStep = dim * stepInfos[CurrentLevel].step;            
        #endif

            samplePos += rayInfo.lastStep;

            if (!ValidSample(samplePos))
            {
                return false;
            }

            rayInfo.curMisses++;

            if (CurrentLevel < voxelInfo.activeLevels - 1 &&
                rayInfo.curMisses > 2 &&
                GetUnScaledAtLevel(ivec3(samplePos), CurrentLevel + 1) == 0)
            {
                bLevelChangeRecalc = true;
                CurrentLevel++;
            }
        }

        if (bDidStep)
        {
            // did it step already
            vec3 normal = -sign(rayInfo.lastStep);

            vec3 VoxelCenter = samplePos + voxelInfo.HalfVoxel[LastLevel];
            vec3 VoxelPlaneEdge = VoxelCenter + voxelInfo.HalfVoxel[LastLevel] * normal;

            float denom = dot(normal, rayInfo.rayDir);
            if (denom == 0)
                denom = 0.0000001f;

            vec3 p0l0 = (VoxelPlaneEdge - rayInfo.rayOrg);
            float t = dot(p0l0, normal) / denom;

            if (t > rayTime)
            {
                const float epsilon = 0.001f;
                rayTime = t + epsilon;
                samplePosWorld = rayInfo.rayOrg + rayInfo.rayDir * rayTime;
            }
        }

        if (bLevelChangeRecalc)
        {
            voxel = floor(samplePosWorld / voxelInfo.VoxelSize[CurrentLevel]) * voxelInfo.VoxelSize[CurrentLevel];
	        tMax = (voxel - samplePosWorld + voxelInfo.HalfVoxel[CurrentLevel] + stepInfos[CurrentLevel].step * vec3(0.5f, 0.5f, 0.5f)) * (rayInfo.rayDirInv);

	        dim = vec3(0, 0, 0);
            samplePos = voxel;
        }
    }

    return false;
}

void main()
{
	vec4 cameraRay = Multiply(vec4(inPixelPosition.xy, 1, 1.0), ViewConstants.InvViewProjectionMatrix);		
    
    cameraRay /= cameraRay.w;

    vec4 cameraInWorld = vec4(cameraRay.xyz + vec3(ViewConstants.ViewPosition.xyz), 1);
    vec3 cameraInVoxel = Multiply( cameraInWorld, voxelInfo.worldToVoxel[0] ).xyz;

    outDiffuse = vec4( 0,0,0, 1 );
	outSMRE = vec4( 0.5f, 0, 1.0f, 0 );
	outNormal = vec4( 0,0,0, 0 );

    VoxelHitInfo info;

    if(CastRay(cameraInVoxel, normalize(cameraRay.xyz), info))
    {
        if(info.voxelID > 0 && info.voxelID <= 5)
        {
            vec2 LocClamp = mod( vec2(info.samplePos.xy) + vec2(info.samplePos.z,info.samplePos.z), textureSize(noiseTexture,0) );
            float noiseValue = textureLod( noiseTexture, LocClamp, 0).r;

            outDiffuse.xyz = colorPallete[info.voxelID - 1] * ( (noiseValue * 0.1f) + 0.9f );
        }
        else
        {
            outDiffuse.xyz = vec3(1,0,0);
        }
        outNormal.xyz = info.normal.xyz * 0.5f + vec3(0.5f);

        vec3 worldPosition = Multiply( vec4( info.location, 1), voxelInfo.voxelToWorld[0] ).xyz - vec3(ViewConstants.ViewPosition);
	    vec4 viewLocation = Multiply( vec4(worldPosition,1), ViewConstants.ViewProjectionMatrix );
        gl_FragDepth = viewLocation.z / viewLocation.w;
    }
    else
    {
        discard;
    }
}
