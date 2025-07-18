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

let NodeMap = {}

NodeMap["MaterialOutput"    ] = "Material/OutputNode";
NodeMap["TextureSample"     ] = "Input/TextureSample";
NodeMap["VertexColor"       ] = "Input/VertexColor";

NodeMap["Float"             ] = "Input/Float";
NodeMap["Vector2"           ] = "Input/Vector2";
NodeMap["Vector3"           ] = "Input/Vector3";
NodeMap["Vector4"           ] = "Input/Vector4";
NodeMap["BreakVector2"      ] = "Vector/BreakVector2";
NodeMap["BreakVector3"      ] = "Vector/BreakVector3";
NodeMap["BreakVector4"      ] = "Vector/BreakVector4";
NodeMap["MathAdd"           ] = "Math/Add";
NodeMap["MathSub"           ] = "Math/Sub";
NodeMap["MathMul"           ] = "Math/Mul";
NodeMap["MathDiv"           ] = "Math/Div";
NodeMap["MathMin"           ] = "Math/Min";
NodeMap["MathMax"           ] = "Math/Max";
NodeMap["MathPow"           ] = "Math/Pow";
NodeMap["MathLerp"          ] = "Math/Lerp";
NodeMap["MathClamp"         ] = "Math/Clamp";
NodeMap["MathToDegrees"     ] = "Math/ToDegrees";
NodeMap["MathToRadians"     ] = "Math/ToRadians";
NodeMap["MathExponent"      ] = "Math/Exponent";
NodeMap["MathLogE"          ] = "Math/LogE";
NodeMap["MathSqrt"          ] = "Math/Sqrt";
NodeMap["MathAbs"           ] = "Math/Absolute";
NodeMap["MathFloor"         ] = "Math/Floor";
NodeMap["MathCeil"          ] = "Math/Ceil";
NodeMap["MathRound"         ] = "Math/Round";
NodeMap["MathMod"           ] = "Math/Mod";
NodeMap["MathTruncate"      ] = "Math/Truncate";
NodeMap["MathVecLength"     ] = "Vector/Length";
NodeMap["MathVecNormalize"  ] = "Vector/Normalize";
NodeMap["MathVecDistance"   ] = "Vector/Distance";
NodeMap["MathVecDot"        ] = "Vector/Dot";
NodeMap["MathVecCross"      ] = "Vector/Cross";  
NodeMap["MathVecReflect"    ] = "Vector/Reflect";
NodeMap["MathVecRefract"    ] = "Vector/Refract";
NodeMap["MathTrigSin"       ] = "Trigonometry/Sin";
NodeMap["MathTrigCos"       ] = "Trigonometry/Cos";
NodeMap["MathTrigTan"       ] = "Trigonometry/Tan";
NodeMap["MathTrigASin"      ] = "Trigonometry/ASin";
NodeMap["MathTrigACos"      ] = "Trigonometry/ACos";
NodeMap["MathTrigATan"      ] = "Trigonometry/ATan";
NodeMap["MathTrigSinh"      ] = "Trigonometry/Sinh";
NodeMap["MathTrigCosh"      ] = "Trigonometry/Cosh";
NodeMap["MathTrigTanh"      ] = "Trigonometry/Tanh";
NodeMap["MathTrigASinh"     ] = "Trigonometry/ASinh";
NodeMap["MathTrigACosh"     ] = "Trigonometry/ACosh";
NodeMap["MathTrigATanh"     ] = "Trigonometry/ATanh";

NodeMap["RandomFloat"       ] = "Input/RandomFloat";
NodeMap["RandomVector2"     ] = "Input/RandomVector2";
NodeMap["RandomVector3"     ] = "Input/RandomVector3";
NodeMap["RandomVector4"     ] = "Input/RandomVector4";
NodeMap["RandomFloatRange"  ] = "Input/RandomFloatRange";
NodeMap["RandomVector2Range"] = "Input/RandomVector2Range";
NodeMap["RandomVector3Range"] = "Input/RandomVector3Range";
NodeMap["RandomVector4Range"] = "Input/RandomVector4Range";

NodeMap["WorldPosition"     ] = "Input/WorldPosition";

let InvNodeMap = {}

Object.entries(NodeMap).forEach(([k,v]) => {		
	InvNodeMap[v] = k
})
	
function GetJsType(InTypeStr)
{
	return NodeMap[InTypeStr];
}

var MaterialGraphInstance = {};

function InitializeMaterialGraph(width, height, buttons)
{
    var Inst = {
        graphCanvas: null,
        lGraph: null,
        lGraphCanvas: null,
        button: buttons,
        Textures: [],
    }

    Inst.graphCanvas = document.getElementById("GraphCanvas");

    Inst.lGraph = new LGraph();
	
	var basicFloat = LiteGraph.createNode("Input/Float");
	basicFloat.pos = [100,100];
	basicFloat.properties.panel[0].value = 1.0
	//basicFloat.setProperty("y",1.0);
	Inst.lGraph.add(basicFloat);
	
	var node_const = LiteGraph.createNode("Input/Vector3");
	node_const.pos = [200,200];
	node_const.setProperty("y",1.0);
	Inst.lGraph.add(node_const);
	//node_const.defaults[1].value = 1.0
	

	var node_watch = LiteGraph.createNode("Material/OutputNode");
	node_watch.pos = [700,200];
	Inst.lGraph.add(node_watch);

	basicFloat.connect(0, node_const, 1 );
	node_const.connect(0, node_watch, 0 );

    Inst.lGraphCanvas = new LGraphCanvas(Inst.graphCanvas, Inst.lGraph);
    Inst.lGraphCanvas.resize(width, height);

    function CompileGraph()
    {
        Inst.lGraph.start();
        Inst.lGraph.stop();

        const output = {
            nodes: [],
            links: [],
            textures: Inst.Textures
        };

        for(const i in Inst.lGraph._nodes_by_id) {
            const node = Inst.lGraph._nodes_by_id[i];
            
			let pushNode = {
                id: node.id,
                type: node.properties.outputType,
                output: node.properties.output,
				node_type: InvNodeMap[ node.type ]
            }
			
			if( node.onGetNodeCompileInfo ) {
				Object.assign( pushNode, node.onGetNodeCompileInfo() );
			}		
			
            output.nodes.push(pushNode);
        }

        for(const i in Inst.lGraph.links)
        {
            const link  = Inst.lGraph.links[i];

            output.links.push({
                src: link.origin_id,
                dst: link.target_id,
                src_idx: link.origin_slot,
                dst_idx: link.target_slot
            });
        }

        const JsonStr = JSON.stringify(output);
		
		ProcessJS("MaterialJSONToGLSL", JsonStr);
        window.InvokeNative("MenuOptionCompile", "{0}".format(JsonStr));
        
        Inst.Textures = [];
    }
	
	
    Inst.button.compile.addEventListener("click", CompileGraph);

    Inst.button.new.addEventListener("click", function()
    {
        Inst.lGraph.clear();
        window.InvokeNative("MenuOptionNew");
    });

    Inst.button.load.addEventListener("click", function() 
    {
        window.InvokeNative("MenuOptionLoad");
    });

    Inst.button.save.addEventListener("click", function()
    {
        CompileGraph();

        window.InvokeNative("MenuOptionSave");
    });
    
    MaterialGraphInstance = Inst;
    window.InvokeNative("MaterialEditorReady");
	
	CompileGraph()
}
window["InitializeMaterialGraph"] = InitializeMaterialGraph;

function OnResizeMaterialEditorGraph(width, height) 
{
    MaterialGraphInstance.lGraphCanvas.resize(width, height);
}
window["OnResizeMaterialGraph"] = OnResizeMaterialEditorGraph;

function OnMenuOptionLoad(InValue) {
    MaterialGraphInstance.lGraph.clear();

    const Json = JSON.parse(InValue);
    
    for(const i in Json.nodes) {
        const node = Json.nodes[i];
        const newNode = LiteGraph.createNode( GetJsType(node.type) );
        newNode.id = node.id;
        newNode.loadFromCPP(node.output);
        MaterialGraphInstance.lGraph.add(newNode);
    }

    for(const i in Json.links) {
        const link = Json.links[i];

        const origin = MaterialGraphInstance.lGraph.getNodeById(link.origin);
        origin.connect(link.origin_slot, MaterialGraphInstance.lGraph.getNodeById(link.target), link.target_slot);
    }

    MaterialGraphInstance.lGraph.arrange();
}
window["OnMenuOptionLoad"] = OnMenuOptionLoad;

function OnMenuOptionTextureSelect(nodeId, InValue) {
    const Node = MaterialGraphInstance.lGraph.getNodeById(nodeId);
    Node.properties.panel[0].path = InValue;
    Node.title = InValue.substring(InValue.lastIndexOf("/") + 1).split(".")[0];
    Node.onSelected();
}
window["OnMenuOptionTextureSelect"] = OnMenuOptionTextureSelect;

const OutputTypes = {
    "Diffuse"       : "Vector3",
    "Normal"        : "Vector3",
    "Specular"      : "Float",
    "Emissive"      : "Float",
    "Metallic"      : "Float",
    "Roughness"     : "Float",
    "Translucency"  : "Float",
};

class MaterialOutputNode
{
    constructor()
    {
        this.addInput("Value", "Vector3");

        this.OnTypeSelection = function(InType)
        {
            this.inputs[0].name = InType;
            this.inputs[0].type = OutputTypes[InType];

            this.disconnectInput(0);

            if(MaterialGraphInstance.lGraph)
            {
                MaterialGraphInstance.lGraph.setDirtyCanvas(true, true);
            }
        }

        const that = this;

        this.properties = {
            panel:[
                {
                    Type: "Diffuse",
                    disabled: false,
                    options: {
                        options: {
                            "Diffuse": "Diffuse",
                            "Normal": "Normal",
                            "Specular": "Specular",
                            "Emissive": "Emissive",
                            "Metallic": "Metallic",
                            "Roughness": "Roughness",
                            "Translucency": "Translucency"
                        }
                    },
                    callback: function(event) {
                        that.OnTypeSelection(event.value);
                    }
                }
            ],
            outputType: "MaterialOutput",
            output: {},
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].Type = InValue.outputType;
        this.OnTypeSelection(InValue.outputType);
    }

    onExecute()
    {
        this.properties.output = {
            "outputType": this.properties.panel[0].Type,
        };  
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Material Output";
    }
}
LiteGraph.registerNodeType("Material/OutputNode", MaterialOutputNode);

class TextureSampleNode
{
    constructor()
    {
        this.addOutput("RGB", "Vector3");
        this.addOutput("R", "Float");
        this.addOutput("G", "Float");
        this.addOutput("B", "Float");
        this.addOutput("A", "Float");

        const that = this;

        this.properties = {
            panel: [
                {
                    path: "",
                    options: {
                        readonly: true,
                        label: "Filepath"
                    }
                },
				{
                    paramName: "textParam",
                    options: {
                        readonly: false,
                        label: "Parameter Name"
                    }
                },
            ],
            buttons: [
                {
                    title: "Select",
                    label: "",
                    callback:[
                        {
                            type: "click",
                            func: function() {
                                window.InvokeNative("MenuOptionTextureSelect", "{0}".format(that.id));
                            }
                        }
                    ] 
                }
            ],
            outputType: "TextureSample",
            output: {}
        };
    }

    loadFromCPP(InValue)
    {
        this.properties.panel[0].path = InValue.path;
    }

	onDrawForeground = function(ctx, graphcanvas)
	{
		if(this.flags.collapsed)
			return;
		ctx.save();
		
		let foundImage = GImageProvider.getImage( this.properties.panel[0].path )
		
		if (foundImage!= null) {		 
			ctx.drawImage(foundImage, 0, 0, this.size[0],this.size[1]);
		}
		
		ctx.restore();
	}
	
	onGetNodeCompileInfo() {
		return { 
			paramName: this.properties.panel[1].paramName,
			path: this.properties.panel[0].path,
		}
	}

    onExecute()
    {
        MaterialGraphInstance.Textures.push({
            id: this.id,
            path: this.properties.panel[0].path
        });
    };

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Texture Sample";
    }
}
LiteGraph.registerNodeType("Input/TextureSample", TextureSampleNode);

class VertexColorNode
{
    constructor()
    {
        this.addOutput("Value", "Vector3");

        this.properties = {
            panel: [],
            outputType: "VertexColor",
            output: {}
        };
    }
    
    loadFromCPP(InValue)
    {

    }

    onExecute()
    {

    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Vertex Color";
    }
}
LiteGraph.registerNodeType("Input/VertexColor", VertexColorNode);
