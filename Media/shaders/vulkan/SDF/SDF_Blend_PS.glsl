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
	mat4 LocalToWorldScaleRotation;
#if SUPPORT_DOUBLE
	dvec3 Translation;
#else
	vec3 Translation;
#endif
	uint ShapeCount;
	float ShapeAlpha;
};

layout(std140, set = 1, binding = 0) readonly uniform _Shapes
{	
	ShapeData shapes[MAX_SHAPES];
};

void ValueSwap(inout float InA, inout float InB)
{
	float tempA = InA;
	InA = InB;
	InB = tempA;
}

struct ShapeProcessed
{
	float rayScalar;
    bool IsHit;
    float T0;
    float T1;
};

ShapeProcessed shapeProcessedData[MAX_SHAPES];

bool intersect_ray_sphere(vec3 rayOrigin, 
	vec3 rayDirection,
	vec3 sphereCenter, 
	float sphereRadius, 
	out float t0, out float t1)
{         
	float radius2 = sphereRadius * sphereRadius;
		
    // geometric solution
	vec3 L = rayOrigin - sphereCenter; 
    float tca = dot(L,rayDirection); 
	// if (tca < 0) return false;
	float d2 = dot(L,L) - tca * tca;		
	if (d2 > radius2) return false; 
	float thc = sqrt(radius2 - d2); 
	t0 = tca - thc; 
	t1 = tca + thc; 
	if (t0 > t1) ValueSwap(t0, t1); 

	if (t0 < 0) 
	{ 
		t0 = t1;  //if t0 is negative, let's use t1 instead 
		if (t0 < 0) return false;  //both t0 and t1 are negative 
	} 

	return true; 
} 

uint shapeCullAndProcess(in vec3 ro, in vec3 rd, out float T0, out float T1)
{
    T0 = 10000;
	T1 = -10000;
	
	uint ShapeHitCount = 0;
	
	[[unroll]]
    for (uint ShapeIdx = 0; ShapeIdx < ShapeCount && ShapeIdx < MAX_SHAPES; ++ShapeIdx)
    {
		vec3 rayStart = Multiply(vec4(ro, 1.0),  shapes[ShapeIdx].invTransform).xyz;
		vec3 rayUnitEnd = Multiply(vec4(ro + rd, 1.0), shapes[ShapeIdx].invTransform).xyz;
		shapeProcessedData[ShapeIdx].rayScalar = 1.0f / length(rayStart - rayUnitEnd);
		vec3 rayDirection = normalize(rayStart - rayUnitEnd);
				
        shapeProcessedData[ShapeIdx].IsHit = intersect_ray_sphere(rayStart, 
			rayDirection, 
			vec3(0,0,0), 
			1.05f, 
			shapeProcessedData[ShapeIdx].T0, 
			shapeProcessedData[ShapeIdx].T1);

        if (shapeProcessedData[ShapeIdx].IsHit)
        {
            ShapeHitCount++;
			
			T0 = min( shapeProcessedData[ShapeIdx].T0 * shapeProcessedData[ShapeIdx].rayScalar, T0 );
			T0 = min( shapeProcessedData[ShapeIdx].T1 * shapeProcessedData[ShapeIdx].rayScalar, T0 );
			
			T1 = max( shapeProcessedData[ShapeIdx].T0 * shapeProcessedData[ShapeIdx].rayScalar, T1 );
			T1 = max( shapeProcessedData[ShapeIdx].T1 * shapeProcessedData[ShapeIdx].rayScalar, T1 );
        }
    }

    return ShapeHitCount;
}



// slight expansion to a buffer of these shapes... very WIP
float processShapes( in vec3 pos, out vec3 hitColor )
{
    float d = 1e10;
    
	[[unroll]]
    for (uint i = 0; i < ShapeCount && i < MAX_SHAPES; ++i)
    {
		float cD = 1e10;

		vec3 samplePos = Multiply(vec4(pos, 1.0), shapes[i].invTransform).xyz;

		//cD = sdSphere(samplePos, 1);// //
		//sdRoundBox
		cD = sdRoundBox( samplePos, vec3(0.5f, 0.5f, 0.5f), 0.1f );
		//cD = sdBox( samplePos, vec3(0.5f, 0.5f, 0.5f) );
		cD *= shapeProcessedData[i].rayScalar;

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
bool raymarch(vec3 ro, vec3 rd, float T0, float T1, out float hitDistance, out vec3 hitColor) 
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
			hitDistance = t;
            return true;
        }

        // If the sample > 0, we haven't hit anything yet so we should march forward
        // We step forward by distance d, because d is the minimum distance possible to intersect
        // an object (see processShapes()).
        t += d;
		
		if(t > T1)
		{
			break;
		}
    }

    return false;
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

bool renderSDF( in vec3 ro, in vec3 rd, in float MaxDistance, out vec3 oPos, out vec3 oNormal, out vec3 oColor ) 
{ 
	float T0, T1;

	uint hitCount = shapeCullAndProcess(ro, rd, T0, T1);

	[[branch]]
	if( hitCount > 0 )
	{	
		vec3 hitColor;
		float hitDistance;
		bool bDidHit = raymarch(ro, rd, T0, T1, hitDistance, hitColor);

		[[branch]]
		if (bDidHit)
		{
			oPos = ro + hitDistance * rd;
			oNormal = calcNormal(oPos);
			oColor = hitColor;
			return true;
		}
	}

	return false;
}


layout (location = 0) in vec3 inScreenPos;

//
layout (location = 0) out vec4 outColor;

void main()
{		
#if 1

	outColor = vec4( 1,0,0,ShapeAlpha );

#else

	mat4 preTrans = GetTranslationMatrix(vec3(ViewConstants.ViewPosition - Translation));
	mat4 inverseLTWSR = transpose(LocalToWorldScaleRotation);

	mat4 LocalViewToLocalModel = Multiply(preTrans, inverseLTWSR);
	
	//LocalViewToLocalModel = GetWorldToLocalViewTranslated(LocalToWorldScaleRotation, 
		//Translation, 
		//ViewConstants.ViewPosition);

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

	bool bHasHit = renderSDF(rayOrigin, rayDirection, rayLength, hitPos, hitNormal, hitColor);
	
	[[branch]]
	if(bHasHit)
	{
		mat4 LocalToWorldTranslated = GetLocalToWorldViewTranslated(LocalToWorldScaleRotation,
			Translation, ViewConstants.ViewPosition);
		
		//this prolly wrong, get sun in local space
		vec3 sunDir = normalize( Multiply( vec4( normalize( vec3(0.4f,-0.4f,0.4f) ), 1), inverseLTWSR ).xyz );
		float intensity = 1.0f - dot(sunDir, hitNormal);

		mat4 localToScreen =  Multiply( LocalToWorldTranslated, ViewConstants.ViewProjectionMatrix );
	

		outColor = vec4( hitColor * intensity, ShapeAlpha );

	    vec4 viewLocation = Multiply( vec4(hitPos,1), localToScreen);
        gl_FragDepth = viewLocation.z / viewLocation.w;
    }
    else
    {
        discard;
    }	

#endif
}
