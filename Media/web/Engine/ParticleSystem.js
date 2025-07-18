//needs threejs

class Particle {
    constructor() {
        this.position = new THREE.Vector3();
        this.color = new THREE.Vector4(1.0,1.0,1.0,1.0);
        this.size = new THREE.Vector3(1.0, 1.0, 1.0);
        this.velocity = new THREE.Vector3();
        this.lifetime = 1.0;
        this.age = 0.0;
    }
}


class ParticleSystemType {
    constructor() {
        this.name = "UNSET";
        this.properties = [];

        this.properties.push(new PropertyWithMeta("label", new StringValue("Label")));
    }

    GenerateUI(InContainerDiv) {
        let particleLayerHeader = document.createElement("div");
        particleLayerHeader.innerHTML = this.name;
        particleLayerHeader.classList.add('ps_layer_header');
        InContainerDiv.appendChild(particleLayerHeader);
    }
}

class PST_Point extends ParticleSystemType {

    constructor() {
        super();
        this.name = "POINT";
    }

}

class PST_Sprite extends ParticleSystemType {

    constructor() {
        super();
        this.properties.push(new PropertyWithMeta("url", "string", ""));
        this.name = "SPRITE";
    }

}

var SystemTiming = {
    deltaTime: 0.01,
    totalTime: 0
}

class EmitterInstance {

    constructor() {
       
        this.particles = []

        this.gpu_bufferChange = false;
        this.gpu_particleCount = 0;
        this.gpu_positions = []
        this.gpu_colors = []
        this.gpu_sizes = []
    }

    createParticle(InInfo) {
        let newParticle = new Particle();

        if (InInfo.position) {
            newParticle.position.copy(InInfo.position)
        }
        if (InInfo.color) {
            newParticle.color.copy(InInfo.color)
        }
        if (InInfo.size) {
            newParticle.size.copy(InInfo.size)
        }
        if (InInfo.velocity) {
            newParticle.velocity.copy(InInfo.velocity)
        }
        if (InInfo.lifetime) {
            newParticle.lifetime = InInfo.lifetime;
        }        

        this.particles.push(newParticle)
    }

    checkGPUSize() {
        if (this.gpu_particleCount < this.particles.length) {
            this.gpu_particleCount = this.particles.length * 2;

            let tripleCount = this.gpu_particleCount * 3;
            let quadCount = this.gpu_particleCount * 4;

            this.gpu_positions = new Float32Array(tripleCount);
            this.gpu_colors = new Float32Array(quadCount);
            this.gpu_sizes = new Float32Array(tripleCount);

            this.gpu_bufferChange = true;
        }
    }

    getParticleCount() {
        return this.particles.length;
    }

    updateParticles(InDeltaTime) {
        this.checkGPUSize();       

        for (var i = this.particles.length - 1; i >= 0; i--) {
            let curParticle = this.particles[i];

            curParticle.age += InDeltaTime;
            if (curParticle.age >= curParticle.lifetime) {
                this.particles.splice(i, 1);
                continue;
            }

            let positionChanged = curParticle.velocity.clone().multiplyScalar(InDeltaTime)
            curParticle.position.add(positionChanged)

            let particleIdx = i * 3;
            let particleIdx4 = i * 4;
            this.gpu_positions[particleIdx + 0] = curParticle.position.x;
            this.gpu_positions[particleIdx + 1] = curParticle.position.y;
            this.gpu_positions[particleIdx + 2] = curParticle.position.z;

            this.gpu_colors[particleIdx4 + 0] = curParticle.color.x;
            this.gpu_colors[particleIdx4 + 1] = curParticle.color.y;
            this.gpu_colors[particleIdx4 + 2] = curParticle.color.z;
            this.gpu_colors[particleIdx4 + 3] = curParticle.color.w;

            this.gpu_sizes[particleIdx + 0] = curParticle.size.x;
            this.gpu_sizes[particleIdx + 1] = curParticle.size.y;
            this.gpu_sizes[particleIdx + 2] = curParticle.size.z;
        }

        
    }
}

class ParticleSystem {

    constructor() {
        this.emitters = []
    }

    AddEmitter(InEmitter) {
        this.emitters.push(InEmitter);
    }

    Clear() {
        for (const curEmitter of this.emitters) {

            if (curEmitter.gpu_particleGeom) {
                curEmitter.gpu_particleGeom.dispose();
                curEmitter.gpu_particleGeom = null;
            }
            if (curEmitter.scenePrimitive) {
                scene.remove(curEmitter.scenePrimitive);
                curEmitter.scenePrimitive = null;
            }
        }

        this.emitters = [];
    }

    Update(InDeltaTime) {
        for (const curEmitter of this.emitters) {
            curEmitter.updateParticles(InDeltaTime);
        }
    }
}


var ParticleSystemGlobal = new ParticleSystem();