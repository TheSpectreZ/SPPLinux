#version 450

#extension GL_EXT_shader_16bit_storage: require
#extension GL_EXT_shader_8bit_storage: require
#extension GL_GOOGLE_include_directive: require
#extension GL_EXT_control_flow_attributes: require

layout(std430) buffer;

#include "Common.glsl"

#include "./SDF/SDFOperators.glsl"
#include "./SDF/SDFCommonShapes.glsl"

#define MAX_SHAPES 10
#define MAX_STEPS 64

struct ShapeData
{
	mat4 invTransform; //from local space into shape space
	vec3 shapeColor;	
	uint shapeType;
    uint shapeOp;
};

layout(push_constant) uniform block
{
	uint ShapeCount;
};

// shared with VS
layout(set = 1, binding = 0) readonly uniform _DrawConstants
{
	//altered viewposition translated
	mat4 LocalToWorldScaleRotation;
#if SUPPORT_DOUBLE
	dvec3 Translation;
#else
	vec3 Translation;
#endif
} DrawConstants;

layout(set = 2, binding = 0) readonly uniform _Shapes
{	
	ShapeData shapes[MAX_SHAPES];
};

// slight expansion to a buffer of these shapes... very WIP
float processShapes( in vec3 pos, out vec3 hitColor )
{
    float d = 1e10;
    
	[[unroll]]
    for (uint i = 0; i < ShapeCount && i < MAX_SHAPES; ++i)
    {
		float cD = 1e10;

		vec3 samplePos = Multiply(vec4(pos, 1.0), shapes[i].invTransform).xyz;

		cD = sdSphere(samplePos, 1);
		//TODO
		//cD *= shapes[i].transformScale;

		float lastD = d;

		if (shapes[i].shapeOp == 0)
		{
			d = opUnion(d, cD);
		}
		else if (shapes[i].shapeOp == 1)
		{
			d = opSubtraction(cD, d);
		}
		else if (shapes[i].shapeOp == 2)
		{
			d = opIntersection(cD, d);
		}

		if (lastD != d)
		{
			hitColor = shapes[i].shapeColor;
		}
    }
	
	return d;
}

// Raymarch along given ray
// ro: ray origin
// rd: ray direction
float raymarch(vec3 ro, vec3 rd, float T0, float T1, out vec3 hitColor) 
{
    float t = T0; // current distance traveled along ray

	[[unroll]]
    for (int i = 0; i < MAX_STEPS; ++i)
    {
        vec3 p = ro + rd * t; // World space position of sample
        float d = processShapes(p, hitColor);       // Sample of distance field (see processShapes())

        // If the sample <= 0, we have hit something (see processShapes()).
        if (d < 0.001)
        {
            break;
        }

        // If the sample > 0, we haven't hit anything yet so we should march forward
        // We step forward by distance d, because d is the minimum distance possible to intersect
        // an object (see processShapes()).
        t += d;
		
		if(t > T1)
		{
			return 100000;
		}
    }

    return t;
}

vec3 calcNormal(vec3 pos)
{
    const float ep = 0.001;
    vec2 e = vec2(1.0, -1.0) * 0.5773;
	
	vec3 dummyColor;
    return normalize(e.xyy * processShapes(pos + e.xyy * ep, dummyColor) +
        e.yyx * processShapes(pos + e.yyx * ep, dummyColor) +
        e.yxy * processShapes(pos + e.yxy * ep, dummyColor) +
        e.xxx * processShapes(pos + e.xxx * ep, dummyColor));
}

float renderSDF( in vec3 ro, in vec3 rd, in float MaxDistance, out vec3 oPos, out vec3 oNormal, out vec3 oColor ) 
{ 
	vec3 hitColor;
	float hitDistance = raymarch(ro, rd, 0, MaxDistance, hitColor);

	[[branch]]
	if (hitDistance < MaxDistance)
	{
		oPos = ro + hitDistance * rd;
		oNormal = calcNormal(oPos);
		oColor = hitColor;
	}

	return hitDistance;
}


layout (location = 0) in vec3 inScreenPos;

//
layout (location = 0) out vec4 outDiffuse;
// specular, metallic, roughness, emissive
layout (location = 1) out vec4 outSMRE;
// 
layout (location = 2) out vec4 outNormal;

void main()
{	
	mat4 LocalViewToLocalModel = GetWorldToLocalViewTranslated(DrawConstants.LocalToWorldScaleRotation, 
		DrawConstants.Translation, 
		ViewConstants.ViewPosition);

	mat4 NDCToLocalModel = Multiply(ViewConstants.InvViewProjectionMatrix, LocalViewToLocalModel);

	vec4 raystart = Multiply(vec4(inScreenPos.xy, 1, 1.0), NDCToLocalModel);
	raystart /= raystart.w;

	vec4 rayStop = Multiply(vec4(inScreenPos, 1.0), NDCToLocalModel);
	rayStop /= rayStop.w;

	vec3 rayOrigin = raystart.xyz;
	vec3 rayLine = rayStop.xyz - raystart.xyz;
	float rayLength = length(rayLine);
	vec3 rayDirection = normalize(rayLine);
	
	vec3 hitPos;
	vec3 hitNormal;
	vec3 hitColor;

	float hitDistance = renderSDF(rayOrigin, rayDirection, rayLength, hitPos, hitNormal, hitColor);
	
	[[branch]]
	if(hitDistance < 10000)
	{
		mat4 LocalToWorldTranslated = GetLocalToWorldViewTranslated(DrawConstants.LocalToWorldScaleRotation,
			DrawConstants.Translation, ViewConstants.ViewPosition);
		mat4 localToScreen =  Multiply( LocalToWorldTranslated, ViewConstants.ViewProjectionMatrix );
	
		outNormal = vec4( hitNormal, 1.0);
		outSMRE = vec4( 0.4f, 0.0f, 0.9f, 0.0f );
		outDiffuse = vec4( hitColor, 1.0f );

	    vec4 viewLocation = Multiply( vec4(hitPos,1), localToScreen);
        gl_FragDepth = viewLocation.z / viewLocation.w;
    }
    else
    {
        discard;
    }	
}
