highp float RandomFloat(float seed)
{
    vec2 co = vec2( seed, (seed + 1.0) / 5.0 );

    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

float RandomFloat(float seed, float A, float B)
{
    return mix(A, B, RandomFloat(seed + 0.12));
}

vec2 RandomVec2(float seed, bool bPerComponentRandom)
{
    if(bPerComponentRandom)
    {
        return vec2(
            RandomFloat(seed + 0.23),
            RandomFloat(seed + 0.45)
        );
    }
    else
    {
        float r = RandomFloat(seed + 0.31);
        return vec2( r, r );
    }
}

vec2 RandomVec2(float seed, bool bPerComponentRandom, vec2 A, vec2 B)
{
    return mix(A, B, RandomVec2(seed + 0.16, bPerComponentRandom));
}

vec3 RandomVec3(float seed, bool bPerComponentRandom)
{
    if(bPerComponentRandom)
    {
        return vec3(
            RandomFloat(seed + 0.29),
            RandomFloat(seed + 0.48),
            RandomFloat(seed + 0.77)
        );
    }
    else
    {
        float r = RandomFloat(seed + 0.05);
        return vec3(r, r, r);
    }
}

vec3 RandomVec3(float seed, bool bPerComponentRandom, vec3 A, vec3 B)
{
    return mix(A, B, RandomVec3(seed + 0.55, bPerComponentRandom));
}

vec4 RandomVec4(float seed, bool bPerComponentRandom)
{
    if(bPerComponentRandom)
    {
        return vec4(
            RandomFloat(seed + 0.79),
            RandomFloat(seed + 0.95),
            RandomFloat(seed + 0.37),
            RandomFloat(seed + 0.19)
        );
    }
    else
    {
        float r = RandomFloat(seed + 0.99);
        return vec4(r, r, r, r);
    }
}

vec4 RandomVec4(float seed, bool bPerComponentRandom, vec4 A, vec4 B)
{
    return mix(A, B, RandomVec4(seed + 0.66, bPerComponentRandom));
}