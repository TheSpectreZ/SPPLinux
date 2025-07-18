#include "CommonVS.glsl"

// out params
layout (location = 0) out vec4 outPixelPosition;
layout (location = 1) out vec2 outUV;

// Vertex shader
void main()
{	
    const vec2 positions[4] = vec2[](
        vec2(-1, -1),
        vec2(+1, -1),
        vec2(-1, +1),
        vec2(+1, +1)
        );
#if FLIP_VERTICAL
    const vec2 coords[4] = vec2[](
        vec2(0, 1),
        vec2(1, 1),
        vec2(0, 0),
        vec2(1, 0)
        );
#else    
    const vec2 coords[4] = vec2[](
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 1)
        );
#endif

	outUV = coords[gl_VertexID]; 
	outPixelPosition = vec4(positions[gl_VertexID], 0.0, 1.0);
	gl_Position = outPixelPosition;
}
