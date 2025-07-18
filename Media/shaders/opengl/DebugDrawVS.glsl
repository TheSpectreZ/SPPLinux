#include "CommonVS.glsl"

layout(binding = 0) uniform _ViewConstants
{
    //all origin centered
    mat4 ViewMatrix;
    mat4 ViewProjectionMatrix;
    mat4 ProjectionMatrix;

    mat4 InvViewProjectionMatrix;
    mat4 InvProjectionMatrix;

    vec3 ViewPosition;
    vec4 CameraFrustum[6];

    ivec4 ViewFrame;
    float RecipTanHalfFovy;
} ViewConstants;

// move to GL_SHADER_STORAGE_BUFFER !? who make sense
layout(binding = 1) uniform _DebugInfo
{
    mat4 debugData[DEBUG_DRAW_COUNTS];
};

// out params
layout(location = 0) out vec4 outVertexColor;

// Vertex shader
void main()
{	
#if DRAW_DEBUG_POINT
    mat4 debugSingleEntry = debugData[gl_VertexID];    
    vec3 curPosition = debugSingleEntry[0].xyz;
    outVertexColor = debugSingleEntry[1];
#else //its a line
    mat4 debugSingleEntry = debugData[gl_VertexID / 2];
    int whichIdx = gl_VertexID % 2;
    vec3 curPosition = debugSingleEntry[0 + whichIdx].xyz;
    outVertexColor = debugSingleEntry[2];
#endif

    //
    mat4 LocalToWorldTranslated = GetLocalToWorldViewTranslated(
        mat4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1),
        vec3(0,0,0), 
        ViewConstants.ViewPosition);

    mat4 localToScreen = Multiply(LocalToWorldTranslated, ViewConstants.ViewProjectionMatrix);

    vec4 finalPos = Multiply(vec4(curPosition, 1.0), localToScreen);
    gl_Position = finalPos;
}
