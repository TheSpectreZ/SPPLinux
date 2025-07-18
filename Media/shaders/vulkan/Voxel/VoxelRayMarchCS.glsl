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

 #include "./Voxel/VoxelCastRay.glsl"

layout(set = 1, binding = 0, r8) uniform readonly image2D noiseTexture;
layout(set = 1, binding = 1, r32f) uniform readonly image2D previousVoxDepth;

layout(set=3, binding=0) uniform writeonly image2D imgDiffuse;
layout(set=3, binding=1) uniform writeonly image2D imgSMRE;
layout(set=3, binding=2) uniform writeonly image2D imgNormal;
layout(set=3, binding=3, r32f) uniform writeonly image2D imgDepth;

// bed rock  	1   (46, 46, 46),
// stone        2   (150, 150, 150),
// metal        3   (59, 64, 71),
// wood         4   (158, 100, 6),
// ice          5   (134, 144, 176),
// vine		    6   (119, 176, 55),
// dirt		    7   (66, 35, 1),
// grass		8   (0, 97, 13),
// sand         9   (242, 231, 172),

#ifdef _WIN32
const vec3 colorPallete[9] = { 
	vec3(46, 46, 46),
	vec3(150, 150, 150),
	vec3(59, 64, 71),
	vec3(158, 100, 6),
    vec3(134, 144, 176),
    vec3(119, 176, 55),
    vec3(66, 35, 1),
    vec3(0, 97, 13),
    vec3(242, 231, 172)
};
#else
const vec3 colorPallete[9]=vec3[9](
	vec3(46, 46, 46),
	vec3(150, 150, 150),
	vec3(59, 64, 71),
	vec3(158, 100, 6),
    vec3(134, 144, 176),
    vec3(119, 176, 55),
    vec3(66, 35, 1),
    vec3(0, 97, 13),
    vec3(242, 231, 172)
);
#endif

#ifdef _WIN32
void voxelraymarchCS(void)
#else
layout(local_size_x=32, local_size_y=32, local_size_z=1) in;
void main(void)
#endif
{
    ivec2 pixelPnt = ivec2(gl_GlobalInvocationID.xy) + ViewConstants.ViewFrame.xy;
    
    if (any(greaterThanEqual(ivec2(gl_GlobalInvocationID.xy), ViewConstants.ViewFrame.zw)) )
    {
        return;
    }
        
    vec2 pixelPosition = vec2(gl_GlobalInvocationID.xy) / vec2( ViewConstants.ViewFrame.zw);	
    pixelPosition = vec2((pixelPosition.x-0.5f)*2, -(pixelPosition.y-0.5f)*2);	
	vec4 cameraRay = Multiply(vec4(pixelPosition.xy, 1, 1.0), ViewConstants.InvViewProjectionMatrix);		
    
    cameraRay /= cameraRay.w;

    vec4 cameraInWorld = vec4(cameraRay.xyz + vec3(ViewConstants.ViewPosition.xyz), 1);
    vec3 cameraInVoxel = Multiply( cameraInWorld, voxelInfo.worldToVoxel[0] ).xyz;

    vec4 outDiffuse = vec4( 0,0,0, 1 );
	vec4 outSMRE = vec4( 0.5f, 0, 1.0f, 0 );
	vec4 outNormal = vec4( 0,0,0, 0 );

    VoxelHitInfo info;

    if(CastRay(cameraInVoxel, normalize(cameraRay.xyz), info))
    {
        if(info.voxelID > 0 && info.voxelID <= 9)
        {
            vec2 LocClamp = mod( vec2(info.samplePos.xy) + vec2(info.samplePos.z,info.samplePos.z), imageSize(noiseTexture) );
            float noiseValue = imageLoad( noiseTexture, ivec2( LocClamp ) ).r;

            outDiffuse.xyz = (colorPallete[info.voxelID - 1] / 255.0f) * ( (noiseValue * 0.1f) + 0.9f );
        }
        else
        {
            outDiffuse.xyz = vec3(1,0,0);
        }
    
        outNormal.xyz = info.normal.xyz * 0.5f + vec3(0.5f);
        
        vec3 worldPosition = Multiply( vec4(info.location, 1), voxelInfo.voxelToWorld[0] ).xyz - vec3(ViewConstants.ViewPosition);
	    vec4 viewLocation = Multiply( vec4(worldPosition,1), ViewConstants.ViewProjectionMatrix );
    
        imageStore(imgDiffuse, pixelPnt, outDiffuse );
        imageStore(imgSMRE, pixelPnt, outSMRE );
        imageStore(imgNormal, pixelPnt, outNormal );
        imageStore(imgDepth, pixelPnt, vec4(float(viewLocation.z) / float(viewLocation.w)) ); 
    }
    else
    {
        imageStore(imgDiffuse, pixelPnt, outDiffuse );
        imageStore(imgSMRE, pixelPnt, outSMRE );
        imageStore(imgNormal, pixelPnt, outNormal );
        imageStore(imgDepth, pixelPnt, vec4(0.0) ); //inverted z
    }
}

