if(!window.InvokeNative) {
    window.InvokeNative = function(InFuncName, ...theArgs) {
        console.log("No Native Invoke: " + JSON.stringify({func: InFuncName, args: theArgs }));
    }
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

function GetJsType(InTypeStr)
{
    switch(InTypeStr)
    {
        case "GN_ParticleSpawn"         : return "Module/Spawn";
        case "GN_ParticleInit"          : return "Module/Init";
        case "GN_ParticleUpdate"        : return "Module/Update";
        case "GN_ParticlePointPosition" : return "Initialize/PointPosition";
        case "GN_ParticleBoxPosition"   : return "Initialize/BoxPosition";
        case "GN_ParticleSpherePosition": return "Initialize/SpherePosition";
        case "GN_ParticleVelocity"      : return "Initialize/Velocity";
        case "GN_ParticleSize"          : return "Initialize/Size";
        case "GN_ParticleColor"         : return "Initialize/Color";
        case "GN_ParticleRotation"      : return "Initialize/Rotation";
        case "GN_ParticleMass"          : return "Initialize/Mass";
        case "GN_ParticleLife"          : return "Initialize/Life";
        case "GN_ParticleGravity"       : return "Update/Gravity";
        case "GN_ParticleDrag"          : return "Update/Drag";
        case "GN_ParticleForce"         : return "Update/Force";
        case "GN_ParticlePointForce"    : return "Update/PointForce";
        case "GN_ParticleWindForce"     : return "Update/WindForce";
        case "GN_ParticleCurlForce"     : return "Update/CurlForce";
        case "GN_ParticleVortexForce"   : return "Update/VortexForce";

        case "GN_Float"                 : return "Input/Float";
        case "GN_Vector2"               : return "Input/Vector2";
        case "GN_Vector3"               : return "Input/Vector3";
        case "GN_Vector4"               : return "Input/Vector4";
        case "GN_BreakVector2"          : return "Vector/BreakVector2";
        case "GN_BreakVector3"          : return "Vector/BreakVector3";
        case "GN_BreakVector4"          : return "Vector/BreakVector4";
        case "GN_MathAdd"               : return "Math/Add";
        case "GN_MathSub"               : return "Math/Sub";
        case "GN_MathMul"               : return "Math/Mul";
        case "GN_MathDiv"               : return "Math/Div";
        case "GN_MathMin"               : return "Math/Min";
        case "GN_MathMax"               : return "Math/Max";
        case "GN_MathPow"               : return "Math/Pow";
        case "GN_MathLerp"              : return "Math/Lerp";
        case "GN_MathClamp"             : return "Math/Clamp";
        case "GN_MathToDegrees"         : return "Math/ToDegrees";
        case "GN_MathToRadians"         : return "Math/ToRadians";
        case "GN_MathExponent"          : return "Math/Exponent";
        case "GN_MathLogE"              : return "Math/LogE";
        case "GN_MathSqrt"              : return "Math/Sqrt";
        case "GN_MathAbs"               : return "Math/Absolute";
        case "GN_MathFloor"             : return "Math/Floor";
        case "GN_MathCeil"              : return "Math/Ceil";
        case "GN_MathRound"             : return "Math/Round";
        case "GN_MathMod"               : return "Math/Mod";
        case "GN_MathTruncate"          : return "Math/Truncate";
        case "GN_MathVecLength"         : return "Vector/Length";
        case "GN_MathVecNormalize"      : return "Vector/Normalize";
        case "GN_MathVecDistance"       : return "Vector/Distance";
        case "GN_MathVecDot"            : return "Vector/Dot";
        case "GN_MathVecCross"          : return "Vector/Cross";  
        case "GN_MathVecReflect"        : return "Vector/Reflect";
        case "GN_MathVecRefract"        : return "Vector/Refract";
        case "GN_MathTrigSin"           : return "Trigonometry/Sin";
        case "GN_MathTrigCos"           : return "Trigonometry/Cos";
        case "GN_MathTrigTan"           : return "Trigonometry/Tan";
        case "GN_MathTrigASin"          : return "Trigonometry/ASin";
        case "GN_MathTrigACos"          : return "Trigonometry/ACos";
        case "GN_MathTrigATan"          : return "Trigonometry/ATan";
        case "GN_MathTrigSinh"          : return "Trigonometry/Sinh";
        case "GN_MathTrigCosh"          : return "Trigonometry/Cosh";
        case "GN_MathTrigTanh"          : return "Trigonometry/Tanh";
        case "GN_MathTrigASinh"         : return "Trigonometry/ASinh";
        case "GN_MathTrigACosh"         : return "Trigonometry/ACosh";
        case "GN_MathTrigATanh"         : return "Trigonometry/ATanh";

        case "SH_RandomFloat"           : return "Input/RandomFloat";
        case "SH_RandomVector2"         : return "Input/RandomVector2";
        case "SH_RandomVector3"         : return "Input/RandomVector3";
        case "SH_RandomVector4"         : return "Input/RandomVector4";
        case "SH_RandomFloatRange"      : return "Input/RandomFloatRange";
        case "SH_RandomVector2Range"    : return "Input/RandomVector2Range";
        case "SH_RandomVector3Range"    : return "Input/RandomVector3Range";
        case "SH_RandomVector4Range"    : return "Input/RandomVector4Range";

        case "SH_WorldPosition"         : return "Input/WorldPosition";
    }

    return null;
}

let ParticleEditorInstance = {};

function InitializeParticleGraph(width, height, buttons) 
{
    const Inst = {
        graphCanvas: null,
        lGraph: null,
        lGraphCanvas: null,
        button: buttons
    };

    Inst.graphCanvas = document.getElementById("GraphCanvas");

    Inst.lGraph = new LGraph();
    Inst.lGraphCanvas = new LGraphCanvas(Inst.graphCanvas, Inst.lGraph);
    Inst.lGraphCanvas.resize(width, height);

    function New()
    {   
        const spawnNode = LiteGraph.createNode("Module/Spawn");
        Inst.lGraph.add(spawnNode);
        
        const initNode = LiteGraph.createNode("Module/Init");
        Inst.lGraph.add(initNode);
        
        const updateNode = LiteGraph.createNode("Module/Update");
        Inst.lGraph.add(updateNode);
       
        Inst.lGraph.arrange();

        return emitter;
    }

    function CompileGraph()
    {
        Inst.lGraph.start();
        Inst.lGraph.stop();

        const output = {
            nodes: [],
            links: [],
        };
        
        const excludeIds = [];

        for(const i in Inst.lGraph._nodes_by_id)
        {
            const node = Inst.lGraph._nodes_by_id[i];

            if(node.type == "ParticleSystem")
            {
                excludeIds.push(node.id);
                continue;
            }

            if(node.type == "Emitter")
            {
                excludeIds.push(node.id);
                continue;
            }

            output.nodes.push({
                id: node.id,
                type: node.properties.outputType,
                output: node.properties.output,
            });
        }

        for(const i in Inst.lGraph.links)
        {
            const link = Inst.lGraph.links[i];

            if(excludeIds.includes(link.origin_id) || excludeIds.includes(link.target_id))
                continue;

            output.links.push({
                origin: link.origin_id,
                target: link.target_id,
                origin_slot: link.origin_slot,
                target_slot: link.target_slot
            });
        }
        console.log(output);
        const JsonStr = JSON.stringify(output);
        window.InvokeNative("MenuOptionCompile", "{0}".format(JsonStr));
    }

    Inst.button.compile.addEventListener("click", CompileGraph);

    Inst.button.new.addEventListener("click", function () {
        Inst.lGraph.clear();
        New();

        window.InvokeNative("MenuOptionNew");
    });

    Inst.button.load.addEventListener("click", function () {
        window.InvokeNative("MenuOptionLoad");
    });

    Inst.button.save.addEventListener("click", function () {
        CompileGraph();
        window.InvokeNative("MenuOptionSave");
    });

    Inst.button.setMaterial.addEventListener("click", function(){
        window.InvokeNative("MenuOptionSetMaterial");
    });
    
    ParticleEditorInstance = Inst;
    window.InvokeNative("ParticleEditorReady");

    const test = {
        "links" : 
        [
            {
                "origin" : 2,
                "origin_slot" : 0,
                "target" : 1,
                "target_slot" : 0
            },
            {
                "origin" : 3,
                "origin_slot" : 0,
                "target" : 1,
                "target_slot" : 1
            },
            {
                "origin" : 4,
                "origin_slot" : 0,
                "target" : 3,
                "target_slot" : 0
            },
            {
                "origin" : 5,
                "origin_slot" : 0,
                "target" : 1,
                "target_slot" : 2
            },
            {
                "origin" : 6,
                "origin_slot" : 0,
                "target" : 1,
                "target_slot" : 3
            }
        ],
        "nodes" : 
        [
            {
                "id" : 0,
                "output" : 
                {
                    "NodeID" : null,
                    "_spawnCount" : "10.000000",
                    "_spawnInterval" : "1.000000"
                },
                "type" : "GN_ParticleSpawn"
            },
            {
                "id" : 1,
                "output" : 
                {
                    "NodeID" : null,
                    "_InputDescriptions" : 
                    {
                        "data" : 
                        [
                            {
                                "Name" : "Module",
                                "Type" : "Module",
                                "idx" : 0
                            },
                            {
                                "Name" : "Module",
                                "Type" : "Module",
                                "idx" : 1
                            },
                            {
                                "Name" : "Module",
                                "Type" : "Module",
                                "idx" : 2
                            },
                            {
                                "Name" : "Module",
                                "Type" : "Module",
                                "idx" : 3
                            }
                        ],
                        "type" : "array"
                    }
                },
                "type" : "GN_ParticleInit"
            },
            {
                "id" : 2,
                "output" : 
                {
                    "NodeID" : null,
                    "_life" : "1.000000"
                },
                "type" : "GN_ParticleLife"
            },
            {
                "id" : 3,
                "output" : 
                {
                    "NodeID" : null,
                    "_color" : 
                    {
                        "X" : "1.000000",
                        "Y" : "1.000000",
                        "Z" : "1.000000"
                    },
                    "_opacity" : "1.000000"
                },
                "type" : "GN_ParticleColor"
            },
            {
                "id" : 4,
                "output" : 
                {
                    "NodeID" : null,
                    "_max" : 
                    {
                        "X" : "1.000000",
                        "Y" : "0.100000",
                        "Z" : "0.200000"
                    },
                    "_min" : 
                    {
                        "X" : "0.100000",
                        "Y" : "0.000000",
                        "Z" : "0.000000"
                    },
                    "_perComponentRandom" : "0"
                },
                "type" : "SH_RandomVector3Range"
            },
            {
                "id" : 5,
                "output" : 
                {
                    "NodeID" : null,
                    "_position" : 
                    {
                        "X" : "0.000000",
                        "Y" : "0.000000",
                        "Z" : "0.000000"
                    },
                    "_radius" : "0.100000"
                },
                "type" : "GN_ParticleSpherePosition"
            },
            {
                "id" : 6,
                "output" : 
                {
                    "NodeID" : null,
                    "_size" : 
                    {
                        "X" : "0.147059",
                        "Y" : "0.150000"
                    }
                },
                "type" : "GN_ParticleSize"
            }
        ]
    };

    OnMenuOptionLoad(JSON.stringify(test));
}
window["InitializeParticleGraph"] = InitializeParticleGraph;

function OnResizeParticleGraph(width, height) 
{
    ParticleEditorInstance.lGraphCanvas.resize(width, height);
}
window["OnResizeParticleGraph"] = OnResizeParticleGraph;

function OnMenuOptionLoad(InValue)
{
    ParticleEditorInstance.lGraph.clear();

    const Json = JSON.parse(InValue);

    for(const i in Json.nodes)
    {
        const node = Json.nodes[i];
        const newNode = LiteGraph.createNode( GetJsType(node.type) );
        newNode.id = node.id;
        newNode.loadFromCPP(node.output);
        ParticleEditorInstance.lGraph.add(newNode);
    }

    for(const i in Json.links)
    {
        const link = Json.links[i];

        const origin = ParticleEditorInstance.lGraph.getNodeById(link.origin);
        origin.connect(link.origin_slot, ParticleEditorInstance.lGraph.getNodeById(link.target), link.target_slot);
    }

    ParticleEditorInstance.lGraph.arrange();
}
window["OnMenuOptionLoad"] = OnMenuOptionLoad;

class ParticleSystem
{
    constructor()
    {
        this.AddEmitter = function()
        {
            this.addInput("", "Emitter");
            this.properties.count++;
        };

        const that = this;

        this.properties = {
            panel: [],
            buttons: [
                {
                    title: "Add Emitter",
                    label: "",
                    callback: [
                        function(event) {
                            that.AddEmitter();
                        }
                    ]
                }
            ],
            count: 0
        };

        this.AddEmitter();
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onExecute()
    {
        console.log("System Executed");
    }

    static get title()
    {
        return "System";
    }
}
LiteGraph.registerNodeType("ParticleSystem", ParticleSystem);

class ParticleEmitter
{
    constructor()
    {
        this.addInput("Spawn"   , "EmitterProp");
        this.addInput("Init"    , "EmitterProp");
        this.addInput("Update"  , "EmitterProp");
        
        this.addOutput("", "Emitter");

        this.properties = {
            panel: [],
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onExecute()
    {
        console.log("Emitter Executed");
    }

    static get title()
    {
        return "Emitter";
    }
}
LiteGraph.registerNodeType("Emitter", ParticleEmitter);

class ParticleSpawn
{
    constructor()
    {
        this.addInput("Interval", "Float");
        this.addInput("Count", "Float");
        
        this.addOutput("", "EmitterProp");

        this.properties = {
            panel: [
                {
                    Interval: 1.0,
                    disabled: false,
                    options: {
                        min: 0.0,
                    }
                },
                {
                    Count: 1.0,
                    disabled: false,
                    options: {
                        min: 0.0,
                    }
                }
            ],
            outputType: "GN_ParticleSpawn",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Interval = Number(InValue._spawnInterval);
        this.properties.panel[1].Count = Number(InValue._spawnCount);
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onExecute()
    {
        this.properties.output = {
            "_spawnInterval": String(this.properties.panel[0].Interval),
            "_spawnCount": String(this.properties.panel[1].Count)
        };

        console.log("Spawn Executed");
    }

    static get title()
    {
        return "Spawn";
    }
}
LiteGraph.registerNodeType("Module/Spawn", ParticleSpawn);

function AddModuleSlot(node)
{
    node.addInput("", "Module");

    node.properties.panel.push({
        Name: "None",
        readonly: true,
    });

    node.properties.slotCount++;
}

function ModuleOnConnectionsChange(node, connection, slot, connected, link_info)
{
    if(connection == LiteGraph.OUTPUT || !link_info)
        return;

    const InNode = node.graph.getNodeById(link_info.origin_id);

    node.properties.panel[slot].Name = connected ? InNode.title : "None";
}

class ParticleInit
{
    constructor()
    {
        this.addOutput("", "EmitterProp");

        const that = this;

        this.properties = {
            panel: [],
            buttons: [
                {
                    title: "Add Module",
                    label: "",
                    callback: [
                        function(event) {
                            AddModuleSlot(that);
                            that.onSelected();
                        }
                    ]
                }
            ],
            outputType: "GN_ParticleInit",
            output: {},
            slotCount: 0
        }

        AddModuleSlot(this);
    }

    loadFromCPP(InValue)
    {
        console.log(InValue);
        for(let i = 0; i < this.properties.slotCount; i++)
        {
            this.removeInput(i);
        }

        this.properties.slotCount = 0;
        this.properties.panel = [];
        
        for(let i = 0; i < InValue._InputDescriptions.data.length; i++)
        {
            AddModuleSlot(this);
        }
    }

    onExecute()
    {
        this.properties.output = {
            "_InputDescriptions": [],
            "InputCount": this.properties.slotCount
        };

        for(let i = 0; i < this.properties.slotCount; i++)
        {
            this.properties.output._InputDescriptions.push({
                "Name": "Module",
                "Type": "Module"
            });
        }
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        ModuleOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Initialize";
    }
}
LiteGraph.registerNodeType("Module/Init", ParticleInit);

class ParticleUpdate
{
    constructor()
    {
        this.addOutput("", "EmitterProp");

        const that = this;

        this.properties = {
            panel: [],
            buttons: [
                {
                    title: "Add Module",
                    label: "",
                    callback: [
                        function(event) {
                            AddModuleSlot(that);
                            that.onSelected();
                        }
                    ]
                }
            ],
            outputType: "GN_ParticleUpdate",
            output: {},
            slotCount: 0
        };

        AddModuleSlot(this);
    }

    loadFromCPP(InValue)
    {
        for(const i in InValue._InputDescriptions)
        {
            AddModuleSlot(this);
        }
    }

    onExecute()
    {
        this.properties.output = {
            "_InputDescriptions": [],
            "InputCount": this.properties.slotCount
        };

        for(let i = 0; i < this.properties.slotCount; i++)
        {
            this.properties.output._InputDescriptions.push({
                "Name": "Module",
                "Type": "Module"
            });
        }
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        ModuleOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Update";
    }
}
LiteGraph.registerNodeType("Module/Update", ParticleUpdate);

class InitPointPosition
{
    constructor()
    {
        this.addInput("Value", "Vector3");
        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Position: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                }
            ],
            outputType: "GN_ParticlePointPosition",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Position.x = Number(InValue._position.X);
        this.properties.panel[0].Position.y = Number(InValue._position.Y);
        this.properties.panel[0].Position.z = Number(InValue._position.Z);
    }

    onExecute()
    {
        this.properties.output = {
            "_position": {
                "X": String(this.properties.panel[0].Position.x),
                "Y": String(this.properties.panel[0].Position.y),
                "Z": String(this.properties.panel[0].Position.z)
            }
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Point Position";
    }
}
LiteGraph.registerNodeType("Initialize/PointPosition", InitPointPosition);

class InitBoxPosition
{
    constructor()
    {
        this.addInput("Position", "Vector3");
        this.addInput("Size", "Vector3");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Position: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    Size: {
                        x: 1.0,
                        y: 1.0,
                        z: 1.0
                    },
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleBoxPosition",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Position.x = Number(InValue._position.X);
        this.properties.panel[0].Position.y = Number(InValue._position.Y);
        this.properties.panel[0].Position.z = Number(InValue._position.Z);

        this.properties.panel[1].Size.x = Number(InValue._size.X);
        this.properties.panel[1].Size.y = Number(InValue._size.Y);
        this.properties.panel[1].Size.z = Number(InValue._size.Z);
    }

    onExecute()
    {
        this.properties.output = {
            "_position": {
                "X": String(this.properties.panel[0].Position.x),
                "Y": String(this.properties.panel[0].Position.y),
                "Z": String(this.properties.panel[0].Position.z)
            },
            "_size": {
                "X": String(this.properties.panel[1].Size.x),
                "Y": String(this.properties.panel[1].Size.y),
                "Z": String(this.properties.panel[1].Size.z)
            }
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Box Position";
    }
}
LiteGraph.registerNodeType("Initialize/BoxPosition", InitBoxPosition);

class InitSpherePosition
{
    constructor()
    {
        this.addInput("Position", "Vector3");
        this.addInput("Radius", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Position: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    Radius: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleSpherePosition",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Position.x = Number(InValue._position.X);
        this.properties.panel[0].Position.y = Number(InValue._position.Y);
        this.properties.panel[0].Position.z = Number(InValue._position.Z);

        this.properties.panel[1].Radius = Number(InValue._radius);
    }

    onExecute()
    {
        this.properties.output = {
            "_position": {
                "X": String(this.properties.panel[0].Position.x),
                "Y": String(this.properties.panel[0].Position.y),
                "Z": String(this.properties.panel[0].Position.z)
            },
            "_radius": String(this.properties.panel[1].Radius)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Sphere Position";
    }
}
LiteGraph.registerNodeType("Initialize/SpherePosition", InitSpherePosition);

class InitVelocity
{
    constructor()
    {
        this.addInput("Direction", "Vector3");
        this.addInput("Speed", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Direction: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    Speed: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleVelocity",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Direction.x = Number(InValue._direction.X);
        this.properties.panel[0].Direction.y = Number(InValue._direction.Y);
        this.properties.panel[0].Direction.z = Number(InValue._direction.Z);

        this.properties.panel[1].Speed = Number(InValue._speed);
    }

    onExecute()
    {
        this.properties.output = {
            "_direction": {
                "X": String(this.properties.panel[0].Direction.x),
                "Y": String(this.properties.panel[0].Direction.y),
                "Z": String(this.properties.panel[0].Direction.z)
            },
            "_speed": String(this.properties.panel[1].Speed)
        };
    }

    onSelected()
    {
        console.log(this);
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Velocity";
    }
}
LiteGraph.registerNodeType("Initialize/Velocity", InitVelocity);

class InitSize
{
    constructor()
    {
        this.addInput("Size", "Vector2");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Size: {
                        x: 1.0,
                        y: 1.0
                    },
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleSize",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Size.x = Number(InValue._size.X);
        this.properties.panel[0].Size.y = Number(InValue._size.Y);
    }

    onExecute()
    {
        this.properties.output = {
            "_size": {
                "X": String(this.properties.panel[0].Size.x),
                "Y": String(this.properties.panel[0].Size.y)
            }
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Size";
    }
}
LiteGraph.registerNodeType("Initialize/Size", InitSize);

class InitColor
{
    constructor()
    {
        this.addInput("Color", "Vector3");
        this.addInput("Opacity", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Color: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0
                    },
                    disabled: false,
                    options: {
                        color: {type: 'float'},
                    }
                },
                {
                    Opacity: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleColor",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Color.r = Number(InValue._color.X);
        this.properties.panel[0].Color.g = Number(InValue._color.Y);
        this.properties.panel[0].Color.b = Number(InValue._color.Z);

        this.properties.panel[1].Opacity = Number(InValue._opacity);
    }

    onExecute()
    {
        this.properties.output = {
            "_color": {
                "X": String(this.properties.panel[0].Color.r),
                "Y": String(this.properties.panel[0].Color.g),
                "Z": String(this.properties.panel[0].Color.b)
            },
            "_opacity": String(this.properties.panel[1].Opacity)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Color";
    }
}
LiteGraph.registerNodeType("Initialize/Color", InitColor);

class InitRotation
{
    constructor()
    {
        this.addInput("Rotation", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Rotation: 0.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleRotation",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Rotation = Number(InValue._rotation);
    }

    onExecute()
    {
        this.properties.output = {
            "_rotation": String(this.properties.panel[0].Rotation)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Rotation";
    }
}
LiteGraph.registerNodeType("Initialize/Rotation", InitRotation);

class InitMass
{
    constructor()
    {
        this.addInput("Mass", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Mass: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleMass",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Mass = Number(InValue._mass);
    }

    onExecute()
    {
        this.properties.output = {
            "_mass": String(this.properties.panel[0].Mass)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Mass";
    }
}
LiteGraph.registerNodeType("Initialize/Mass", InitMass);

class InitLife
{
    constructor()
    {
        this.addInput("Life", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Life: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleLife",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Life = Number(InValue._life);
    }

    onExecute()
    {
        this.properties.output = {
            "_life": String(this.properties.panel[0].Life)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Life";
    }
}
LiteGraph.registerNodeType("Initialize/Life", InitLife);

class UpdGravity
{
    constructor()
    {
        this.addInput("Gravity", "Vector3");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Gravity: {
                        x: 0.0,
                        y: -9.8,
                        z: 0.0
                    },
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleGravity",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Gravity.x = Number(InValue._gravity.X);
        this.properties.panel[0].Gravity.y = Number(InValue._gravity.Y);
        this.properties.panel[0].Gravity.z = Number(InValue._gravity.Z);
    }
    
    onExecute()
    {
        this.properties.output = {
            "_gravity": {
                "X": String(this.properties.panel[0].Gravity.x),
                "Y": String(this.properties.panel[0].Gravity.y),
                "Z": String(this.properties.panel[0].Gravity.z)
            }
        };
    }
    
    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Gravity";
    }
}
LiteGraph.registerNodeType("Update/Gravity", UpdGravity);

class UpdDrag
{
    constructor()
    {
        this.addInput("Drag", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Drag: 0.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleDrag",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Drag = Number(InValue._drag);
    }

    onExecute()
    {
        this.properties.output = {
            "_drag": String(this.properties.panel[0].Drag)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Drag";
    }
}
LiteGraph.registerNodeType("Update/Drag", UpdDrag);

class UpdForce
{
    constructor()
    {
        this.addInput("Direction", "Vector3");
        this.addInput("Strength", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Direction: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    Strength: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleForce",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Direction.x = Number(InValue._direction.X);
        this.properties.panel[0].Direction.y = Number(InValue._direction.Y);
        this.properties.panel[0].Direction.z = Number(InValue._direction.Z);

        this.properties.panel[1].Strength = Number(InValue._strength);
    }

    onExecute()
    {
        this.properties.output = {
            "_direction": {
                "X": String(this.properties.panel[0].Direction.x),
                "Y": String(this.properties.panel[0].Direction.y),
                "Z": String(this.properties.panel[0].Direction.z)
            },
            "_strength": String(this.properties.panel[1].Strength)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Force";
    }
}
LiteGraph.registerNodeType("Update/Force", UpdForce);

class UpdPointForce
{
    constructor()
    {
        this.addInput("Position", "Vector3");
        this.addInput("Strength", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Position: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    Strength: 1.0,
                    disabled: false,
                },
                {
                    UseSpawnPosition: false,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticlePointForce",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Position.x = Number(InValue._position.X);
        this.properties.panel[0].Position.y = Number(InValue._position.Y);
        this.properties.panel[0].Position.z = Number(InValue._position.Z);

        this.properties.panel[1].Strength = Number(InValue._strength);

        this.properties.panel[2].UseSpawnPosition = Boolean(InValue._bUseSpawnPosition);
    }

    onExecute()
    {
        this.properties.output = {
            "_position": {
                "X": String(this.properties.panel[0].Position.x),
                "Y": String(this.properties.panel[0].Position.y),
                "Z": String(this.properties.panel[0].Position.z)
            },
            "_strength": String(this.properties.panel[1].Strength),
            "_bUseSpawnPosition": String(this.properties.panel[2].UseSpawnPosition)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Point Force";
    }
}
LiteGraph.registerNodeType("Update/PointForce", UpdPointForce);

class UpdWindForce
{
    constructor()
    {
        this.addInput("Direction", "Vector3");
        this.addInput("Strength", "Float");
        this.addInput("Air Density", "Float");  

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Direction: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    Strength: 1.0,
                    disabled: false,
                },
                {
                    AirDensity: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleWindForce",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Direction.x = Number(InValue._direction.X);
        this.properties.panel[0].Direction.y = Number(InValue._direction.Y);
        this.properties.panel[0].Direction.z = Number(InValue._direction.Z);

        this.properties.panel[1].Strength = Number(InValue._strength);
        this.properties.panel[2].AirDensity = Number(InValue._airDensity);
    }

    onExecute()
    {
        this.properties.output = {
            "_direction": {
                "X": String(this.properties.panel[0].Direction.x),
                "Y": String(this.properties.panel[0].Direction.y),
                "Z": String(this.properties.panel[0].Direction.z)
            },
            "_strength": String(this.properties.panel[1].Strength),
            "_airDensity": String(this.properties.panel[2].AirDensity)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Wind Force";
    }
}
LiteGraph.registerNodeType("Update/WindForce", UpdWindForce);

class UpdCurlForce
{
    constructor()
    {
        this.addInput("Strength", "Vector3");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Strength: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleCurlForce",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Strength.x = Number(InValue._strength.X);
        this.properties.panel[0].Strength.y = Number(InValue._strength.Y);
        this.properties.panel[0].Strength.z = Number(InValue._strength.Z);
    }

    onExecute()
    {
        this.properties.output = {
            "_strength": {
                "X": String(this.properties.panel[0].Strength.x),
                "Y": String(this.properties.panel[0].Strength.y),
                "Z": String(this.properties.panel[0].Strength.z)
            }
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Curl Force";
    }
}
LiteGraph.registerNodeType("Update/CurlForce", UpdCurlForce);

class UpdVortexForce
{
    constructor()
    {
        this.addInput("Axis", "Vector3");
        this.addInput("Strength", "Float");
        this.addInput("Radius", "Float");

        this.addOutput("", "Module");

        this.properties = {
            panel: [
                {
                    Axis: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    Strength: 1.0,
                    disabled: false,
                },
                {
                    Radius: 1.0,
                    disabled: false,
                }
            ],
            outputType: "GN_ParticleVortexForce",
            output: {}
        };
    }   

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Axis.x = Number(InValue._axis.X);
        this.properties.panel[0].Axis.y = Number(InValue._axis.Y);
        this.properties.panel[0].Axis.z = Number(InValue._axis.Z);

        this.properties.panel[1].Strength = Number(InValue._strength);
        this.properties.panel[2].Radius = Number(InValue._radius);
    }

    onExecute()
    {
        this.properties.output = {
            "_axis": {
                "X": String(this.properties.panel[0].Axis.x),
                "Y": String(this.properties.panel[0].Axis.y),
                "Z": String(this.properties.panel[0].Axis.z)
            },
            "_strength": String(this.properties.panel[1].Strength),
            "_radius": String(this.properties.panel[2].Radius)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Vortex Force";
    }
}
LiteGraph.registerNodeType("Update/VortexForce", UpdVortexForce);