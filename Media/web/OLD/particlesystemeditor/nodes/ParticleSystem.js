(function(global){

    const LiteGraph = global.LiteGraph;
    const window = global.window;

    function FillValueTypePair(node, slot) {
        return {
            value: node.getInputData(slot),
            Type: node.getInputDataType(slot)
        };
    }

    function GetCheckedValue(node, slot, proxy) {
        var value = node.getInputData(slot);
        if(!value)
            value = proxy;
        return value;
    }

    function ParticleEmitterNode() {

        this.addInput("Spawn Module", "SpawnModule");
        this.addInput("Physics Module", "PhysicsModule");
        this.addInput("Emission Module", "EmissionModule");
        this.addInput("Update Module", "UpdateModule");
        this.addOutput("value", "emitter");
       
        this.properties = {
            layerIndex: -1
        }

        this._data = {
            spawn: 0,
            physics: 0,
            emission: 0,
            update: 0
        };

        this.addWidget("button", "Set Texture", "", function(value, widget, node)
        {
           
            if(node.properties.layerIndex >= 0) {
                window.InvokeNative("EDITOR", "SetTexture " + node.properties.layerIndex);
            }

        }, {width: 100});
        
        this.addWidget("button", "Remove Texture", "", function(value, widget, node)
        {
           
            if(node.properties.layerIndex >= 0) {
                window.InvokeNative("EDITOR", "RemoveTexture " + node.properties.layerIndex);
            }

        }, {width: 140});
    }
    
    ParticleEmitterNode.prototype.onExecute = function() {
        this._data.spawn = FillValueTypePair(this, 0);
        this._data.physics = FillValueTypePair(this, 1);
        this._data.emission = FillValueTypePair(this, 2);
        this._data.update = FillValueTypePair(this, 3);

        this.setOutputData(0, this._data);
    }

    ParticleEmitterNode.title = "Particle Emitter";
    LiteGraph.registerNodeType("PS/ParticleEmitter", ParticleEmitterNode);

    function PS_SpawnModule() {
        this.addInput("Position", "vec3");
        this.addInput("Position Offset", "vec3,Shape");
        this.addInput("Velocity", "vec3,Vec3Range,VelocityCone");
        this.addInput("Scale"	, "vec2,Vec2Range");
        this.addInput("Color"	, "vec3,Vec3Range");
    
        this.addInput("Rotation", "float,FloatRange");
        this.addInput("Mass"    , "float,FloatRange");

        this.addOutput("value", "SpawnModule");

        this._data = {
            position: 0,
            posOffset: 0,
            velocity: 0,
            scale: 0,
            color: 0,
            rotation: 0,
            mass: 0
        };
    }

    PS_SpawnModule.prototype.onExecute = function() {
        this._data.position = FillValueTypePair(this, 0);
        this._data.posOffset = FillValueTypePair(this, 1);
        this._data.velocity = FillValueTypePair(this, 2);
        this._data.scale = FillValueTypePair(this, 3);
        this._data.color = FillValueTypePair(this, 4);
        this._data.rotation = FillValueTypePair(this, 5);
        this._data.mass = FillValueTypePair(this, 6);

        this.setOutputData(0, this._data);
    }

    PS_SpawnModule.title = "Spawn Module";
    LiteGraph.registerNodeType("PS/SpawnBehavior", PS_SpawnModule);

    function PS_PhysicsModule() {
        this.addInput("Gravity", "vec3");
        this.addInput("Linear Force", "vec3");
        this.addInput("Point Attract Force", "float");
        this.addInput("Point Repel Force", "float");
        this.addInput("Curl Force", "CurlForce");
        this.addInput("Wind Force", "WindForce");
        this.addInput("Vortex Force", "VortexForce");
        this.addInput("Drag", "float");

        this.addOutput("Value", "PhysicsModule");

        this._data = {
            gravity: 0,
            force: 0,
            pointAForce: 0,
            pointRForce: 0,
            curlForce: 0,
            windForce: 0,
            vortexForce: 0,
            drag: 0,
        };
    }

    PS_PhysicsModule.prototype.onExecute = function() {

        this._data.gravity = GetCheckedValue(this, 0, {x:0, y:0, z:0});
        this._data.force = GetCheckedValue(this, 1, {x:0, y:0, z:0});
        this._data.pointAForce = GetCheckedValue(this, 2, 0);
        this._data.pointRForce = GetCheckedValue(this, 3, 0);
        this._data.curlForce = FillValueTypePair(this, 4);
        this._data.windForce = FillValueTypePair(this, 5);
        this._data.vortexForce = FillValueTypePair(this, 6);
        this._data.drag = GetCheckedValue(this, 7, 0);

        this.setOutputData(0, this._data);
    }

    PS_PhysicsModule.title = "Physics Module";
    LiteGraph.registerNodeType("PS/PhysicsBehavior", PS_PhysicsModule);

    function PS_EmissionModule() {
        this.addInput("Particle Life", "float,FloatRange");
        this.addInput("Emission Rate", "float");
        this.addInput("Emission Interval", "float");

        this.addOutput("value", "EmissionModule");
        
        this._data = {
            life: 0,
            emissionRate: 0,
            emissionInterval: 0
        };
    }

    PS_EmissionModule.prototype.onExecute = function() {

        this._data.life = FillValueTypePair(this, 0);
        this._data.emissionRate = GetCheckedValue(this, 1, 0);
        this._data.emissionInterval = GetCheckedValue(this, 2, 0);

        this.setOutputData(0, this._data);
    }

    PS_EmissionModule.title = "Emission Module";
    LiteGraph.registerNodeType("PS/EmissionBehavior", PS_EmissionModule);

    function PS_UpdateModule() {
        this.addInput("Color Curve", "Vec3Curve");
        this.addInput("Scale Curve", "Vec2Curve");
        this.addInput("Opacity Curve", "FloatCurve");

        this.addOutput("value", "UpdateModule");

        this._data = {
            colorCurve: 0,
            scaleCurve: 0,
            opacityCurve: 0
        };
    }

    PS_UpdateModule.prototype.onExecute = function() {
        this._data.colorCurve = FillValueTypePair(this, 0)
        this._data.scaleCurve = FillValueTypePair(this, 1);
        this._data.opacityCurve = FillValueTypePair(this, 2);

        this.setOutputData(0, this._data);
    }

    PS_UpdateModule.title = "Update Module";
    LiteGraph.registerNodeType("PS/UpdateModule", PS_UpdateModule);

    function PS_PositionOffsetBoxShape() {
        this.addInput("scale", "vec3");
        this.addOutput("Value", "Shape");
        
        this._data = {
            Type: "Box",
            Scale: 0
        };
    }

    PS_PositionOffsetBoxShape.prototype.onExecute = function() {

        this._data.Scale = GetCheckedValue(this, 0, { x:0, y:0, z: 0 });
        this.setOutputData(0, this._data);
    }

    PS_PositionOffsetBoxShape.title = "Box Shape";
    LiteGraph.registerNodeType("PS/BoxShape", PS_PositionOffsetBoxShape);

    function PS_PositionOffsetSphereShape() {
        this.addInput("Radius", "float");
        
        this.addOutput("Value", "Shape");

        this.properties = { velType: "Outward" };
		this.addWidget("combo", "Velocity Type ", "Outward", "velType", { values: ["Outward", "Random"], width: 180 } );

        this._data = {
            Type: "Sphere",
            velType: 0,
            Radius: 0
        };
    }

    PS_PositionOffsetSphereShape.prototype.onExecute = function() {
        this._data.Radius = GetCheckedValue(this, 0, 0);
        this._data.velType = this.properties.velType;
        this.setOutputData(0, this._data);
    }

    PS_PositionOffsetSphereShape.title = "Sphere Shape";
    LiteGraph.registerNodeType("PS/SphereShape", PS_PositionOffsetSphereShape);

    function PS_VelocityCone() {

        this.addInput("Min Speed",  "float");
        this.addInput("Max Speed",  "float");
        this.addInput("Cone Axis", "vec3");
        this.addInput("Outer Cone Angle", "float");
        this.addInput("Inner Cone Angle", "float");

        this.addOutput("value", "VelocityCone");

        this._data = {
            minSpeed: 0,
            maxSpeed: 0,
            coneAxis: 0,
            outerConeAngle: 0,
            innerConeAngle: 0,
        };
    }

    PS_VelocityCone.prototype.onExecute = function() {

        this._data.minSpeed = GetCheckedValue(this, 0, 0);
        this._data.maxSpeed = GetCheckedValue(this, 1, 0);
        this._data.coneAxis = GetCheckedValue(this, 2, { x:0, y:0, z:0 });
        this._data.outerConeAngle = GetCheckedValue(this, 3, 0);
        this._data.innerConeAngle = GetCheckedValue(this, 4, 0);

        this.setOutputData(0, this._data);
    }

    PS_VelocityCone.title = "Velocity Cone";
    LiteGraph.registerNodeType("PS/VelocityCone", PS_VelocityCone);

    function PS_WindForce() {
        this.addInput("Wind Velocity", "vec3");
        this.addInput("Air Density", "float");

        this.addOutput("value", "WindForce");

        this._data = {
            windVelocity: 0,
            airDensity: 0
        };
    }

    PS_WindForce.prototype.onExecute = function() {
        this._data.windVelocity = GetCheckedValue(this, 0, { X:0, y:0, z: 0 });
        this._data.airDensity = GetCheckedValue(this, 1, 0);

        this.setOutputData(0, this._data);
    }

    PS_WindForce.title = "Wind Force";
    LiteGraph.registerNodeType("PS/WindForce", PS_WindForce);

    function PS_CurlForce() {
        this.addInput("Force", "vec3");

        this.addOutput("value", "CurlForce");

        this._data = {
            force: 0
        };
    }

    PS_CurlForce.prototype.onExecute = function() {
        this._data.force = GetCheckedValue(this, 0, { X:0, y:0, z: 0 });
        this.setOutputData(0, this._data);
    }

    PS_CurlForce.title = "Curl Force";
    LiteGraph.registerNodeType("PS/CurlForce", PS_CurlForce);

    function PS_VortexForce() {

        this.addInput("Strength", "float");
        this.addInput("Radius", "float");
        this.addInput("Axis", "vec3");

        this.addOutput("value", "VortexForce");

        this._data = {
            strength: 0,
            radius: 0,
            axis: 0,
        }
    }

    PS_VortexForce.prototype.onExecute = function() {

        this._data.strength = GetCheckedValue(this, 0, 0);
        this._data.radius = GetCheckedValue(this, 1, 0);
        this._data.axis = GetCheckedValue(this, 2, {x:0, y: 1, z: 0});

        this.setOutputData(0, this._data);
    }

    PS_VortexForce.title = "Vortex Force";
    LiteGraph.registerNodeType("PS/VortexForce", PS_VortexForce);

}) (this)