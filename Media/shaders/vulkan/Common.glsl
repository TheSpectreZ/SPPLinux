//

#ifndef PI
	#define PI 3.141592f
#endif
#ifndef Epsilon
	#define Epsilon 0.00001f
#endif
#ifndef FLT_MAX
	#define FLT_MAX 3.402823466e+38f
#endif
#ifndef FLT_MIN
	#define FLT_MIN 1.175494351e-38f
#endif
#ifndef DBL_MAX
	#define DBL_MAX 1.7976931348623158e+308
#endif
#ifndef DBL_MIN
	#define DBL_MIN 2.2250738585072014e-308
#endif

const int MAX_TEX_COORDS = 3;
const int MAX_VERTEX_COLOR_CHANNELS = 3;
const int MAX_BONES_PER_VERT = 3;

#define SUPPORT_DOUBLE 0

#if defined(_WIN32) || defined(__linux__)
	#define a_uint32_t std::atomic_uint32_t

    #define GLSL_PARAM_IN( datatype, paramName ) \
            datatype paramName

    #define GLSL_PARAM_OUT( datatype, paramName ) \
            datatype &paramName

    #define GLSL_PARAM_INOUT( datatype, paramName ) \
            datatype &paramName

#else
	#define a_uint32_t uint

    #define GLSL_PARAM_IN( datatype, paramName ) \
            in datatype paramName

    #define GLSL_PARAM_OUT( datatype, paramName ) \
            out datatype paramName

    #define GLSL_PARAM_INOUT( datatype, paramName ) \
            inout datatype paramName

#endif



layout(set = 0, binding = 0) readonly uniform _ViewConstants
{
	//all origin centered
	mat4 ViewMatrix;
	mat4 ViewProjectionMatrix;
	mat4 ProjectionMatrix;

	mat4 InvViewProjectionMatrix;
	mat4 InvProjectionMatrix;

#if SUPPORT_DOUBLE
	dvec3 ViewPosition;
	dvec4 CameraFrustum[6];
#else	
	vec3 ViewPosition;
	vec4 CameraFrustum[6];
#endif

	ivec4 ViewFrame;
	float RecipTanHalfFovy; 
} ViewConstants;


#if SUPPORT_DOUBLE
mat4 GetLocalToWorldViewTranslated(in mat4 InLTWSR, in dvec3 InTrans, in dvec3 InViewPosition)
#else
mat4 GetLocalToWorldViewTranslated(in mat4 InLTWSR, in vec3 InTrans, in vec3 InViewPosition)
#endif
{
	return mat4(
		InLTWSR[0][0], InLTWSR[0][1], InLTWSR[0][2], 0,
		InLTWSR[1][0], InLTWSR[1][1], InLTWSR[1][2], 0,
		InLTWSR[2][0], InLTWSR[2][1], InLTWSR[2][2], 0,
		vec3(InTrans - InViewPosition), 1);
}

#if SUPPORT_DOUBLE
mat4 GetWorldToLocalViewTranslated(in mat4 InLTWSR, in dvec3 InTrans, in dvec3 InViewPosition)
#else
mat4 GetWorldToLocalViewTranslated(in mat4 InLTWSR, in vec3 InTrans, in vec3 InViewPosition)
#endif
{
	mat4 inverseLTWSR = transpose(InLTWSR);
	return mat4(
		inverseLTWSR[0][0], inverseLTWSR[0][1], inverseLTWSR[0][2], 0,
		inverseLTWSR[1][0], inverseLTWSR[1][1], inverseLTWSR[1][2], 0,
		inverseLTWSR[2][0], inverseLTWSR[2][1], inverseLTWSR[2][2], 0,
		vec3(InViewPosition - InTrans), 1);
}

mat4 GetTranslationMatrix(in vec3 InValue)
{
	return mat4(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		InValue, 1);
}

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

mat4 scaleMatrix(vec3 scale)
{
	return mat4(scale.x, 0.0, 0.0, 0.0,
				0.0, scale.y, 0.0, 0.0,
				0.0, 0.0, scale.z, 0.0,
				0.0, 0.0, 0.0, 1.0);
}

vec4 Multiply(in vec4 InVec, in mat4 InMat)
{
	return InMat * InVec;
}

vec3 Multiply(in vec3 InVec, in mat3 InMat)
{
	return InMat * InVec;
}

mat4 Multiply(in mat4 InMatA, in mat4 InMatB)
{
	return InMatB * InMatA;
}

mat3 Multiply(in mat3 InMatA, in mat3 InMatB)
{
	return InMatB * InMatA;
}

struct StaticDrawParams
{
	//altered viewposition translated
	mat4 LocalToWorldScaleRotation;
#if SUPPORT_DOUBLE
	dvec3 Translation;
#else
	vec3 Translation;
#endif
    uint MaterialID;
};

// Should Match the count from createStaticDrawInfo() in VulkanDevice.cpp
#define STATIC_DRAW_PARAM_COUNT 100 