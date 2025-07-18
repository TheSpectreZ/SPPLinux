layout(location = 0) in vec4 PixelPosition;
layout(location = 1) in vec2 UV;

layout(location = 0) out vec4 color;

uniform sampler2D textureOut;

void main()
{
    color = texture(textureOut, UV );
}