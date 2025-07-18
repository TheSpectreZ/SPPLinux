void GetFrustumPlanes(in vec4 InPlanes[5], in mat4 inViewProjectionMatrix)
{
	//mat4 MVP = transpose(inViewProjectionMatrix);
	//TODO ROWMAJOR COLMAJOR ISSUE we auto tranpose on setting the value...
	mat4 MVP = transpose(inViewProjectionMatrix);

	vec4 viewX = MVP[0];
	vec4 viewY = MVP[1];
	vec4 viewZ = MVP[2];
	vec4 viewTranslation = MVP[3];

	// left
	InPlanes[0] = viewTranslation + viewX;
	InPlanes[0] /= length(InPlanes[0].xyz);
	// right
	InPlanes[1] = viewTranslation - viewX;
	InPlanes[1] /= length(InPlanes[1].xyz);
	// bottom
	InPlanes[2] = viewTranslation + viewY;
	InPlanes[2] /= length(InPlanes[2].xyz);
	// top
	InPlanes[3] = viewTranslation - viewY;
	InPlanes[3] /= length(InPlanes[3].xyz);
	// near
	InPlanes[4] = viewTranslation + viewZ;
	InPlanes[4] /= length(InPlanes[4].xyz);
}

bool IsSphereInFrustum(in vec4 InPlanes[5], in vec3 InSphereCenter, float InSphereRadius) 
{
	for (int i = 0; i < 5; i++)
	{
		if ((dot( InPlanes[i].xyz, InSphereCenter) + InPlanes[i].w) < -InSphereRadius)
		{
			return false;
		}
	}

	return true;
}

bool Intersect_RayAABB(in vec3 rayOrg, 
    in vec3 rayDirInv,
    in vec3 boundsMin, 
    in vec3 boundsMax, 
    GLSL_PARAM_OUT( float, otimeToHit) )
{
    otimeToHit = 0;

    float t1 = (boundsMin[0] - rayOrg[0]) * rayDirInv[0];
    float t2 = (boundsMax[0] - rayOrg[0]) * rayDirInv[0];

    float tmin = min(t1, t2);
    float tmax = max(t1, t2);

    for (int i = 1; i < 3; ++i) {
        t1 = (boundsMin[i] - rayOrg[i]) * rayDirInv[i];
        t2 = (boundsMax[i] - rayOrg[i]) * rayDirInv[i];

        tmin = max(tmin, min(min(t1, t2), tmax));
        tmax = min(tmax, max(max(t1, t2), tmin));
    }

    float minMax0 = max(tmin, 0.0f);

    if (tmax > minMax0)
    {
        otimeToHit = minMax0;
        return true;
    }

    return false;
}