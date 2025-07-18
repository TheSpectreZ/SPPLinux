
let camera, scene, renderer, model, sphereGeom;
let bReady = false

function RunViewer() {
	
	
	let viewerDiv = document.getElementById("VIEWER")
	
	camera = new THREE.PerspectiveCamera( 45, viewerDiv.clientWidth / viewerDiv.clientHeight, 0.25, 20 );
	camera.position.set( - 1.8, 0.6, 2.7 );

	scene = new THREE.Scene();
	
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( viewerDiv.clientWidth, viewerDiv.clientHeight );
	renderer.setClearColor( 0x0000ff ); 
	
	
	const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.position.set( 0, 200, 100 );
	dirLight.castShadow = false;
	dirLight.shadow.camera.top = 180;
	dirLight.shadow.camera.bottom = - 100;
	dirLight.shadow.camera.left = - 120;
	dirLight.shadow.camera.right = 120;
	scene.add( dirLight );
	
	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );
	
	var grid = new THREE.GridHelper(10, 10);
	scene.add(grid);
	
	viewerDiv.appendChild( renderer.domElement );

	const controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // use if there is no animation loop
	controls.minDistance = 2;
	controls.maxDistance = 10;
	controls.target.set( 0, 0, - 0.2 );
	controls.update();


	sphereGeom = new THREE.SphereGeometry( 1, 32, 16 ); 
	const material = new THREE.MeshStandardMaterial  ( { color: 0xffff00 } ); 
	model = new THREE.Mesh( sphereGeom, material ); 
	scene.add( model );
	render();

	// const loader = new THREE.GLTFLoader().setPath( 'gltf/' );
	// loader.load( 'sphere.gltf', async function ( gltf ) {

		// const model = gltf.scene
		// renderer.compile( model, camera, scene );
		// scene.add( model );
		// render();
		
	// } );
						
						
	bReady = true
	//window.addEventListener( 'resize', onWindowResize );
	
	//viewerDiv.on("resize", function () {
		//onViewerResize()
    //}); 
}

function onViewerResize() {
	
	if( !bReady ) return

	let viewerDiv = document.getElementById("VIEWER")
	
	camera.aspect = viewerDiv.clientWidth / viewerDiv.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( viewerDiv.clientWidth, viewerDiv.clientHeight );

	render();

}

function render() {

	renderer.render( scene, camera );

}

//https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshbasic.glsl.js
//

//first a couple of place holders
const GENERIC_VERTEX_SHADER = 
`
#define STANDARD
#define USE_UV

varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}

`

const GENERIC_TEMPLATE_FRAGMENT = 
`
#define STANDARD
#define USE_UV

#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
//uniform vec3 diffuse;
//uniform vec3 emissive;
//uniform float roughness;
//uniform float metalness;
//uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularTint;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARTINTMAP
		uniform sampler2D specularTintMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenTint;
	uniform float sheenRoughness;
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

struct MaterialParams
{
	vec3  Diffuse;
	vec3  Emissive;
	float Roughness;
	float Metalness;
	float Opacity;
};
{0}
void main()
{
MaterialParams MaterialOutput;
MaterialOutput.Diffuse = vec3(0,0,0);
MaterialOutput.Emissive = vec3(0,0,0);
MaterialOutput.Roughness = 0.1f;
MaterialOutput.Metalness = 0.0f;
MaterialOutput.Opacity = 1.0f;

{1}

	
	vec3 diffuse	   = MaterialOutput.Diffuse;
	vec3 emissive      = MaterialOutput.Emissive;
	float roughness    = MaterialOutput.Roughness;
	float metalness    = MaterialOutput.Metalness;
	float opacity      = MaterialOutput.Opacity;
	
	
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - clearcoat * Fcc ) + clearcoatSpecular * clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`

window["CompiledShader"] = function( InShaderMeta, InShaderCode ) {
	
	let newFragmentShader = GENERIC_TEMPLATE_FRAGMENT.format( InShaderMeta.uniforms, InShaderCode )
	
	console.log( newFragmentShader )
	
	let simpleIdentity = new  THREE.Matrix3();
	simpleIdentity.identity();
	
	let	ourUniforms = {
		uvTransform: new THREE.Uniform( simpleIdentity )
	}
	
	const loader = new THREE.TextureLoader();
	
	for (let curIter of InShaderMeta.textures ) {
		
		let foundImage = GImageProvider.getData( curIter.path )
		
		if( foundImage != null ) {
			
			if( !("threeJSTexture" in foundImage) ) {
				
				
				
				foundImage.threeJSTexture = new THREE.Texture();
				
				foundImage.threeJSTexture.image = foundImage.getPreviewImage();
				foundImage.threeJSTexture.needsUpdate = true;
			
				//new THREE.ImageUtils.loadTexture( foundImage.getPreviewImage() );
			}
			
			ourUniforms[ curIter.name ] = { type: "t", value: foundImage.threeJSTexture }
		}
	}
		
	const newGLSLMaterial = new THREE.ShaderMaterial({
		uniforms: Object.assign( {}, ourUniforms, THREE.UniformsLib['lights'] ),
		vertexShader: GENERIC_VERTEX_SHADER,
		fragmentShader: newFragmentShader,
		lights: true
	})
	
	scene.remove( model )	
	model = new THREE.Mesh( sphereGeom, newGLSLMaterial ); 
	scene.add( model );

	renderer.render( scene, camera );
}