const int MAX_TEX_COORDS = 3;
const int MAX_VERTEX_COLOR_CHANNELS = 3;

layout(location = 0) in vec3 inPos;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inUV[MAX_TEX_COORDS];
layout(location = 5) in vec4 inVertexColor[MAX_VERTEX_COLOR_CHANNELS];

<<UNIFORM_BLOCK>>

out vec4 fragColor;

void main()
{
    vec3 diffuse = vec3(0.0, 1.0, 0.0);
    vec3 normal = vec3(0.000000, 0.000000, 1.000000);

    {

<<MATERIAL_OUTPUT>>

    }

    fragColor = vec4(diffuse * dot(inNormal,vec3(0.5,0.5,0)), 1.0);
}