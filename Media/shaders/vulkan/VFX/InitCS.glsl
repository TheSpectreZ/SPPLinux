#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require

#extension GL_GOOGLE_include_directive: require

#define LOCAL_SIZE_X 64

layout(local_size_x = LOCAL_SIZE_X, local_size_y = 1, local_size_z = 1) in;

layout(set = 0, binding = 0) buffer _DeadIndexBuffer
{
    uint data[];
} DeadIndexBuffer;

layout(push_constant) uniform _PushConstant
{
    uint MaxParticles;
} PushConstant;

void main()
{
    uint Id = gl_GlobalInvocationID.x;

    if(Id < PushConstant.MaxParticles)
        DeadIndexBuffer.data[Id] = Id;
}