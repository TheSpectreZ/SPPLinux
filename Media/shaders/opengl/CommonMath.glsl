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


mat4 GetLocalToWorldViewTranslated(in mat4 InLTWSR, in vec3 InTrans, in vec3 InViewPosition)
{
	return mat4(
		InLTWSR[0][0], InLTWSR[0][1], InLTWSR[0][2], 0,
		InLTWSR[1][0], InLTWSR[1][1], InLTWSR[1][2], 0,
		InLTWSR[2][0], InLTWSR[2][1], InLTWSR[2][2], 0,
		vec3(InTrans - InViewPosition), 1);
}

mat4 GetWorldToLocalViewTranslated(in mat4 InLTWSR, in vec3 InTrans, in vec3 InViewPosition)
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

	return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
		oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
		oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
		0.0, 0.0, 0.0, 1.0);
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