let EnumParticleTypes = new Enum("EnumParticleTypes",
    "point", "sprite", "mesh");

let EnumParticleAlignmentTypes = new Enum("EnumParticleAlignmentTypes",
    "None", "FaceCamera", "FaceCameraLockedUp", "FaceCameraAlignToVelocity" );
class Node_ParticleType {
    constructor() {
        this.addOutput("TypeInfo", "ParticleType");

        const _that = this;

        this.base_properties = [ PropertyWithMeta.BuildFromValue("Type", EnumParticleTypes.point, this),
            PropertyWithMeta.BuildFromValue("Alignment", EnumParticleAlignmentTypes.FaceCamera, this),
            PropertyWithMeta.BuildFromValue("bWorldPosition", false, this)];

        this.combo = this.addWidget("combo", "Type", "point",
            function (v) {
                _that.base_properties[0].value = EnumParticleTypes.GetValue(v);
                ParticleLayerDetailsInstance.SetProperties(_that.base_properties);
            },
            { values: ["point", "sprite"], width: 150 });

        //this.size = [300, 200];
    }

    onPropertyChanged(InPropName, InValue) {

        if (InPropName === "Type") {
            if (InValue === EnumParticleTypes.point) {
                if (this.inputs && this.inputs.length > 0) {
                    this.removeInput(0);
                }
            } else {
                if (!this.inputs || this.inputs.length == 0) {
                    this.addInput("Image", "Image");
                }
            }
        }

        if (this.combo.value !== InValue.name) {
            this.combo.value = InValue.name;
        }

        this.setDirtyCanvas(true);
    }

    static get title() {
        return "Particle Type";
    }
}
LiteGraph.registerNodeType("ParticleSystem/ParticleType", Node_ParticleType);

let EnumParticleProperties = new Enum("EnumParticleProperties",
    "position", "color", "size", "velocity", "lifetime", "age");

class Node_EmitBegin {
    constructor() {

        this.addInput("TypeInfo", "ParticleType");
        this.addInput("Accumulator", "float");

        this.addInput("position", "Vector3");
        this.addInput("color", "Vector4");
        this.addInput("size", "Vector3");
        this.addInput("velocity", "Vector3");
        this.addInput("lifetime", "float");

        this.addOutput("Particle(s)", "Particle");

        this.addOutput("position", "Vector3");
        this.addOutput("color", "Vector4");
        this.addOutput("size", "Vector3");
        this.addOutput("velocity", "Vector3");
        this.addOutput("normalized age", "float");

        this.properties = {
            datastore: {
                accum: 0.0
            }
        };

    }

    static get title() {
        return "Emit Begin";
    }
}
LiteGraph.registerNodeType("ParticleSystem/EmitBegin", Node_EmitBegin);

class Node_EmitEnd {
    constructor() {
        this.addInput("Particle(s)", "Particle");

        this.addInput("position", "Vector3");
        this.addInput("color", "Vector4");
        this.addInput("size", "Vector3");
        this.addInput("velocity", "Vector3");
    }

    static get title() {
        return "Emit End";
    }
}
LiteGraph.registerNodeType("ParticleSystem/EmitEnd", Node_EmitEnd);


class Node_ParticleSystemAge {
    constructor() {
        this.addOutput("Ages", "float");
    }

    static get title() {
        return "Particle System Age";
    }
}
LiteGraph.registerNodeType("ParticleSystem/ParticleSystemAge", Node_ParticleSystemAge);


class Node_DeltaTime {
    constructor() {
        this.addOutput("Value", "float");
    }
    static get title() {
        return "Delta Time";
    }
}
LiteGraph.registerNodeType("ParticleSystem/DeltaTime", Node_DeltaTime);