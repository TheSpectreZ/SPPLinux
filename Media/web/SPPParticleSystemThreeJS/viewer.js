
let camera, scene, renderer, model, sphereGeom, pointShaderMaterial, spriteShaderMaterial;
let bReady = false

let particleGeom;

let quadPositions, quadUVs;
let spriteGeom;

const GENERIC_POINT_VS =
`
attribute vec3 size;
varying vec4 vColor;

void main() {
	vColor = color;
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = size.x;
	gl_Position = projectionMatrix * mvPosition;
}

`;

const GENERIC_POINT_PS =
`
varying vec4 vColor;
void main() {
	gl_FragColor = vColor;
}
`;

const GENERIC_SPRITE_VS =
`
attribute vec3 offset;
attribute vec3 size;

varying vec4 vColor;
varying vec2 vUv;

void main() {
	vColor = color;
	vUv = uv;

	mat3 viewNoTrans = mat3(viewMatrix);
	vec3 outPosition = (position * size) * viewNoTrans;

	vec4 mvPosition = modelViewMatrix * vec4( outPosition + offset , 1.0 );
	gl_Position = projectionMatrix * mvPosition;
}

`;

const GENERIC_SPRITE_PS =
`
uniform sampler2D particleTexture;

varying vec4 vColor;
varying vec2 vUv;

void main() {

	vec4 textureColor = texture2D(particleTexture, vUv);
	gl_FragColor = textureColor * vColor;
}
`;



//var loader = new THREE.TextureLoader();
//loader.load('texture.png', function (texture) {
//	var geometry = new THREE.SphereGeometry(1000, 20, 20);
//	var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
//	var mesh = new THREE.Mesh(geometry, material);
//	scene.add(mesh);
//});

function RunViewer() {
	
	
	let viewerDiv = document.getElementById("VIEWER")
	
	camera = new THREE.PerspectiveCamera( 45, viewerDiv.clientWidth / viewerDiv.clientHeight, 0.25, 20 );
	camera.position.set( - 1.8, 0.6, 2.7 );

	scene = new THREE.Scene();
	
	renderer = new THREE.WebGLRenderer( { antialias: false } );
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
	//controls.addEventListener( 'change', render ); // use if there is no animation loop
	controls.minDistance = 2;
	controls.maxDistance = 10;
	controls.target.set( 0, 0, - 0.2 );
	controls.update();

	pointShaderMaterial = new THREE.ShaderMaterial({
		//uniforms: Object.assign( {}, ourUniforms, THREE.UniformsLib['lights'] ),
		vertexShader: GENERIC_POINT_VS,
		fragmentShader: GENERIC_POINT_PS,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		vertexColors: true
	})

	quadPositions = [];
	quadPositions.push(-1, -1, 0);
	quadPositions.push(+1, -1, 0);
	quadPositions.push(-1, +1, 0);

	quadPositions.push(-1, +1, 0);
	quadPositions.push(+1, -1, 0);
	quadPositions.push(+1, +1, 0);

	quadUVs = [];
	quadUVs.push(0.0, 0.0);
	quadUVs.push(1.0, 0.0);
	quadUVs.push(0.0, 1.0);

	quadUVs.push(0.0, 1.0);
	quadUVs.push(1.0, 0.0);
	quadUVs.push(1.0, 1.0);

	const loader = new THREE.TextureLoader();
	const alphaTexture = loader.load('../ParticleImages/noisetexture.png', //alphasphere.png
		// onLoad callback
		function (InTexture) {
			console.log("loaded");
		},
		// onProgress callback currently not supported
		undefined,
		// onError callback
		function (err) {
			console.error('An error happened.');
		}
	);

	var uniforms = {
		particleTexture: { value: alphaTexture }
    };

	spriteShaderMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: GENERIC_SPRITE_VS,
		fragmentShader: GENERIC_SPRITE_PS,
		side: THREE.DoubleSide,
		blending: THREE.NormalBlending,
		depthTest: false,
		transparent: true,
		vertexColors: true
	})
		
	requestAnimationFrame(update);						
						
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

let clock = new THREE.Clock();
let delta = 0;
// 30 fps
let interval = 1 / 30;

function update() {
	requestAnimationFrame(update);
	delta += clock.getDelta();

	if (delta > interval) {

		UpdateParticleSystem(delta);
		UpdateRenderer();

		// The draw or time dependent code are here
		render();

		delta = 0;// delta % interval;
	}
}


function GeneratePointPrimitive(curEmitter) {
	let particleGeom = new THREE.BufferGeometry();

	particleGeom.setAttribute('position',
		new THREE.BufferAttribute(curEmitter.gpu_positions, 3));
	particleGeom.setAttribute('color',
		new THREE.BufferAttribute(curEmitter.gpu_colors, 4));
	particleGeom.setAttribute('size',
		new THREE.BufferAttribute(curEmitter.gpu_sizes, 3));

	particleGeom.setDrawRange(0, curEmitter.getParticleCount())

	curEmitter.gpu_particleGeom = particleGeom;

	let _particleGeom = particleGeom;
	curEmitter.updateFunc = function (InPartCount) {
		_particleGeom.setDrawRange(0, curEmitter.getParticleCount())
		_particleGeom.getAttribute('position').needsUpdate = true;
		_particleGeom.getAttribute('color').needsUpdate = true;
		_particleGeom.getAttribute('size').needsUpdate = true;
	}

	return new THREE.Points(curEmitter.gpu_particleGeom, pointShaderMaterial);
}

function GenerateSpritePrimitive(curEmitter) {
	const particleGeom = new THREE.InstancedBufferGeometry();
	particleGeom.instanceCount = curEmitter.getParticleCount();

	particleGeom.setAttribute('position', new THREE.Float32BufferAttribute(quadPositions, 3));
	particleGeom.setAttribute('uv', new THREE.Float32BufferAttribute(quadUVs, 2));

	particleGeom.setAttribute('offset', new THREE.InstancedBufferAttribute(curEmitter.gpu_positions, 3));
	particleGeom.setAttribute('color', new THREE.InstancedBufferAttribute(curEmitter.gpu_colors, 4));
	particleGeom.setAttribute('size', new THREE.InstancedBufferAttribute(curEmitter.gpu_sizes, 3));

	curEmitter.gpu_particleGeom = particleGeom;

	let _particleGeom = particleGeom;
	curEmitter.updateFunc = function(InPartCount) { 
		_particleGeom.instanceCount = curEmitter.getParticleCount();
		_particleGeom.getAttribute('offset').needsUpdate = true;
		_particleGeom.getAttribute('color').needsUpdate = true;
		_particleGeom.getAttribute('size').needsUpdate = true;
	}

	return new THREE.Mesh(curEmitter.gpu_particleGeom, spriteShaderMaterial);
}




function UpdateRenderer() {

	for (const curEmitter of ParticleSystemGlobal.emitters) {

		if (curEmitter.gpu_bufferChange) {

			if (curEmitter.gpu_particleGeom) {
				curEmitter.gpu_particleGeom.dispose();
				curEmitter.gpu_particleGeom = null;
			}
			if (curEmitter.scenePrimitive) {
				scene.remove(curEmitter.scenePrimitive);
				curEmitter.scenePrimitive = null;
			}

			curEmitter.scenePrimitive = GenerateSpritePrimitive(curEmitter);
			scene.add(curEmitter.scenePrimitive);

			curEmitter.gpu_bufferChange = false;
		} else {
			if (curEmitter.gpu_particleGeom) {
				curEmitter.updateFunc(curEmitter.getParticleCount());
			}
		}
	}
}

function render() {
	renderer.render( scene, camera );
}

