#define MAX_SPLINE_NODES 10

struct SplineFloat
{
	vec2 points[MAX_SPLINE_NODES];
};

struct SplineVec2
{
	SplineFloat sx, sy;
};

struct SplineVec3
{
	SplineFloat sx, sy, sz;
};

struct SplineVec4
{
	SplineFloat sx, sy, sz, sw;
};

float LinearInterpolate(SplineFloat spline,uint count, float Time)
{
	if(Time <= spline.points[0].x)
		return spline.points[0].y;

	for(uint i = 1; i < count; i++)
	{
		if(Time < spline.points[i].x)
		{
			float t = (Time - spline.points[i-1].x) / (spline.points[i].x - spline.points[i-1].x);
			return mix(spline.points[i-1].y,spline.points[i].y,t);
		}
	}
	
	if(Time > spline.points[count - 1].x)
		return spline.points[count - 1].y;

	return 0.f;
}

vec2 LinearInterpolate(SplineVec2 spline,uint count, float Time)
{
	float x = LinearInterpolate(spline.sx, count, Time);
	float y = LinearInterpolate(spline.sy, count, Time);

	return vec2(x,y);
}

vec3 LinearInterpolate(SplineVec3 spline,uint count, float Time)
{
	float x = LinearInterpolate(spline.sx, count, Time);
	float y = LinearInterpolate(spline.sy, count, Time);
	float z = LinearInterpolate(spline.sz, count, Time);

	return vec3(x,y,z);
}

vec4 LinearInterpolate(SplineVec4 spline ,uint count, float Time)
{
	float x = LinearInterpolate(spline.sx, count, Time);
	float y = LinearInterpolate(spline.sy, count, Time);
	float z = LinearInterpolate(spline.sz, count, Time);
	float w = LinearInterpolate(spline.sw, count, Time);

	return vec4(x,y,z,w);
}

// Work in Progress
float CubicInterpolate(SplineFloat spline, float Time)
{
	if(Time <= spline.points[0].y)
		return spline.points[0].x;

	for(uint i = 1; i < MAX_SPLINE_NODES; i++)
	{
		if(Time < spline.points[i].y)
		{
			float t = (Time - spline.points[i-1].y) / (spline.points[i].y - spline.points[i-1].y);
		}
	}

	if(Time > spline.points[MAX_SPLINE_NODES - 1].y)
		return spline.points[MAX_SPLINE_NODES - 1].x;
}