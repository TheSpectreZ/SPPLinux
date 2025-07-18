// Copyright (c) David Sleeper (Sleeping Robot LLC)
// Distributed under MIT license, or public domain if desired and
// recognized in your jurisdiction.
// 


// Raymarch along given ray
// ro: ray origin
// rd: ray direction
float raymarchScene(vec3 ro, vec3 rd)
{
    const int maxstep = 64;
    float t = 0; // current distance traveled along ray
    for (int i = 0; i < maxstep; ++i)
    {
        vec3 p = ro + rd * t; // World space position of sample
        float d = sceneSDF(p);       // Sample of distance field (see map())

        // If the sample <= 0, we have hit something (see map()).
        if (d < 0.001)
        {
            break;
        }

        // If the sample > 0, we haven't hit anything yet so we should march forward
        // We step forward by distance d, because d is the minimum distance possible to intersect
        // an object (see map()).
        t += d;
    }

    return t;
}

vec3 calcNormal(vec3 pos)
{
    const float ep = 0.001;
    vec2 e = vec2(1.0, -1.0) * 0.5773;
    return normalize(e.xyy * sceneSDF(pos + e.xyy * ep) +
        e.yyx * sceneSDF(pos + e.yyx * ep) +
        e.yxy * sceneSDF(pos + e.yxy * ep) +
        e.xxx * sceneSDF(pos + e.xxx * ep));
}