#define VOXEL_GRID_SIZE_X 160
#define VOXEL_GRID_SIZE_Y 90
#define VOXEL_GRID_SIZE_Z 240

#define NUM_BLUE_NOISE_TEXTURES 16
#define BLUE_NOISE_TEXTURE_SIZE 128

layout(set = 2, binding = 0) uniform _VolumetricBuffer
{
    mat4 PreviousViewProjection;
    vec3 PreviousViewPosition; float anisotropy;

    vec3 lightRadiance; float ambientLightIntensity;
    float nearZ; float farZ; float depthPower; float density;
} VolumetricBuffer;

float exp_01_to_linear_01_depth(float z, float n, float f)
{
    float z_buffer_params_y = f / n;
    float z_buffer_params_x = 1.0f - z_buffer_params_y;

    return 1.0f / (z_buffer_params_x * z + z_buffer_params_y);
}

float linear_01_to_exp_01_depth(float z, float n, float f)
{
    float z_buffer_params_y = f / n;
    float z_buffer_params_x = 1.0f - z_buffer_params_y;

    return (1.0f / z - z_buffer_params_y) / z_buffer_params_x;
}

vec3 id_to_uv(ivec3 id)
{
    float n = VolumetricBuffer.nearZ;
    float f = VolumetricBuffer.farZ;

    float z = n * pow( f / n, float(id.z + 0.5) / float(VOXEL_GRID_SIZE_Z) );

    vec3 uv;
    uv.x = float(id.x + 0.5) / float(VOXEL_GRID_SIZE_X);
    uv.y = float(id.y + 0.5) / float(VOXEL_GRID_SIZE_Y);
    uv.z =                 z / f;
    
    return uv;
}

vec3 uv_to_ndc(vec3 uv)
{
    vec3 ndc;
    ndc.x =  (2.0 * uv.x - 1.0);
    ndc.y = -(2.0 * uv.y - 1.0);
    ndc.z = linear_01_to_exp_01_depth(uv.z, VolumetricBuffer.nearZ, VolumetricBuffer.farZ);

    return ndc;
}

vec3 ndc_to_world(vec3 ndc)
{    
    vec4 world = Multiply( vec4(ndc, 1.0), GetTranslationMatrix(ViewConstants.ViewPosition) * ViewConstants.InvViewProjectionMatrix);
    world /= world.w;
    return world.xyz;
}

vec3 world_to_ndc(vec3 world)
{
    vec4 ndc = Multiply( vec4(world, 1.0), ViewConstants.InvViewProjectionMatrix * GetTranslationMatrix(-ViewConstants.ViewPosition));
    ndc /= ndc.w;
    return ndc.xyz;
}

vec3 ndc_to_uv(vec3 ndc)
{
    vec3 uv;
    uv.x =  ndc.x * 0.5 + 0.5;
    uv.y = -ndc.y * 0.5 + 0.5;
    uv.z =  exp_01_to_linear_01_depth(ndc.z, VolumetricBuffer.nearZ, VolumetricBuffer.farZ);

    return uv;
}

ivec3 uv_to_id(vec3 uv)
{
    float n = VolumetricBuffer.nearZ;
    float f = VolumetricBuffer.farZ;

    float z = log( abs(uv.z * f) / n ) / log(f/n);
    
    ivec3 id;
    id.x = int(uv.x * float(VOXEL_GRID_SIZE_X) - 0.5);
    id.y = int(uv.y * float(VOXEL_GRID_SIZE_Y) - 0.5);
    id.z = int(   z * float(VOXEL_GRID_SIZE_Z) - 0.5);

    return id;
}

vec3 id_to_world(ivec3 id)
{
    vec3 uv = id_to_uv(id);
    vec3 ndc = uv_to_ndc(uv);
    return ndc_to_world(ndc);
}

vec3 world_to_uv(vec3 world)
{
    vec3 ndc = world_to_ndc(world);
    return ndc_to_uv(ndc);
}
