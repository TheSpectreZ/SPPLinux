
var GLSLTranslator = {}


let TypeConvertToGLSL = {}

TypeConvertToGLSL["Float"] = "float";
TypeConvertToGLSL["Vector2"] = "vec2";
TypeConvertToGLSL["Vector3"] = "vec3";
TypeConvertToGLSL["Vector4"] = "vec4";

let ParamTypesGLSL = [ "float", "vec2", "vec3", "vec4", "tex2d" ]

var ParamNodes = {}

ParamNodes["TextureSample"] = function(InNode, InShaderMeta) {	

	InShaderMeta.textures.push( { 
		name : InNode.paramName,
		path : InNode.path
	} )
	
	InShaderMeta.uniforms += "uniform sampler2D {0};\n".format( InNode.paramName )
}

function GetNodeAsGLSLType(InNode) {
	return TypeConvertToGLSL[ InNode.output.type ]
}

function GetNodeAsName(InNode, OutIdx) {
	if (OutIdx === undefined)
		return "{0}_{1}_0".format( InNode.type, InNode.id )
	else
		return "{0}_{1}_{2}".format( InNode.type, InNode.id, OutIdx )
}

GLSLTranslator["MaterialOutput"     ] = function(InNode, InArgNodes) {
	return "MaterialOutput.{0} = {1};".format( InNode.output.outputType, InArgNodes[0] )
}
GLSLTranslator["TextureSample"     ] = function(InNode, InArgNodes) {
	return "vec3 {0} = texture2D({1},{2}).rgb;".format( GetNodeAsName(InNode), InNode.paramName, "vUv" )
}
GLSLTranslator["VertexColor"     ] = function(InNode, InArgNodes) {
	return "VertexColor"
}
GLSLTranslator["Float"              ] = function(InNode, InArgNodes) {
	return "float {0} = float({1});".format( GetNodeAsName(InNode), InNode.output.Value )
}
GLSLTranslator["Vector2"            ] = function(InNode, InArgNodes) {
	return "vec2 {0} = vec2({1},{2});".format( GetNodeAsName(InNode), InNode.output.Value.X, InNode.output.Value.Y )
}
GLSLTranslator["Vector3"            ] = function(InNode, InArgNodes) {
	return "vec3 {0} = vec3({1},{2},{3});".format( 
		GetNodeAsName(InNode),
		InArgNodes[0] ? InArgNodes[0] : InNode.output.Value.X,
		InArgNodes[1] ? InArgNodes[1] : InNode.output.Value.Y, 
		InArgNodes[2] ? InArgNodes[2] : InNode.output.Value.Z )
}
GLSLTranslator["Vector4"            ] = function(InNode, InArgNodes) {
	return "vec4 {0} = vec4({1},{2},{3},{4});".format( 
		GetNodeAsName(InNode),
		InNode.output.Value.X, 
		InNode.output.Value.Y, 
		InNode.output.Value.Z, 
		InNode.output.Value.W )
}

GLSLTranslator["BreakVector2"            ] = function(InNode, InArgNodes) {
	let literalStr = `
	float {0} = {2}.x;
	float {1} = {2}.y;
	`
	
	return literalStr.format( GetNodeAsName(InNode,0), GetNodeAsName(InNode,1), InArgNodes[0] )
}

GLSLTranslator["BreakVector3"            ] = function(InNode, InArgNodes) {
	let literalStr = `
	float {0} = {3}.x;
	float {1} = {3}.y;
	float {2} = {3}.z;
	`
	
	return literalStr.format( GetNodeAsName(InNode,0), GetNodeAsName(InNode,1), GetNodeAsName(InNode,2), InArgNodes[0] )
}

GLSLTranslator["BreakVector4"            ] = function(InNode, InArgNodes) {
	 
	let literalStr = `
	float {0} = {4}.x;
	float {1} = {4}.y;
	float {2} = {4}.z;
	float {3} = {4}.w;
	`
	
	return literalStr.format( GetNodeAsName(InNode,0), GetNodeAsName(InNode,1), GetNodeAsName(InNode,2), GetNodeAsName(InNode,3), InArgNodes[0] )
}


GLSLTranslator["MathAdd"            ] = function(InNode, InArgNodes) {
	let literalStr = `{0} {1} = {2} + {3};`
		
	return literalStr.format( 
		GetNodeAsGLSLType(InNode), 
		GetNodeAsName( InNode ),
		InArgNodes[0],
		InArgNodes[1] )
}

GLSLTranslator["MathSub"            ] = function(InNode, InArgNodes) {
	let literalStr = `{0} {1} = {2} - {3};`
	return literalStr.format( 
		GetNodeAsGLSLType(InNode), 
		GetNodeAsName( InNode ),
		InArgNodes[0],
		InArgNodes[1] )
}

GLSLTranslator["MathMul"            ] = function(InNode, InArgNodes) {
	let literalStr = `{0} {1} = {2} * {3};`
	return literalStr.format( 
		GetNodeAsGLSLType(InNode), 
		GetNodeAsName( InNode ),
		InArgNodes[0],
		InArgNodes[1] )
}

GLSLTranslator["MathDiv"            ] = function(InNode, InArgNodes) {
	let literalStr = `{0} {1} = {2} / {3};`
	return literalStr.format( 
		GetNodeAsGLSLType(InNode), 
		GetNodeAsName( InNode ),
		InArgNodes[0],
		InArgNodes[1] )
}

GLSLTranslator["MathMin"            ] = function(InNode, InArgNodes) {
	let literalStr = `{0} {1} = min({2},{3});`

	return literalStr.format( 
		GetNodeAsGLSLType(InNode), 
		GetNodeAsName( InNode ),
		InArgNodes[0],
		InArgNodes[1] )
}

GLSLTranslator["MathMax"            ] = function(InNode, InArgNodes) {
	let literalStr = `{0} {1} = max({2},{3});`
	
	return literalStr.format( 
		GetNodeAsGLSLType(InNode), 
		GetNodeAsName( InNode ),
		InArgNodes[0],
		InArgNodes[1] )
}


GLSLTranslator["MathPow"            ] = function(InNode, InArgNodes) {
	let literalStr = `{0} {1} = pow({2},{3});`
	
	return literalStr.format( 
		GetNodeAsGLSLType(InNode), 
		GetNodeAsName( InNode ),
		InArgNodes[0],
		InArgNodes[1] )
}

GLSLTranslator["MathLerp"            ] = function(InNode, InArgNodes) {
	let literalStr = "lerp({0},{1},{2})"
	return literalStr.format( 
		InArgNodes[0],
		InArgNodes[1],
		InArgNodes[2] )
}

// GLSLTranslator["MathClamp"          ]
// GLSLTranslator["MathToDegrees"      ]
// GLSLTranslator["MathToRadians"      ]
// GLSLTranslator["MathExponent"       ]
// GLSLTranslator["MathLogE"           ]
// GLSLTranslator["MathSqrt"           ]
// GLSLTranslator["MathAbs"            ]
// GLSLTranslator["MathFloor"          ]
// GLSLTranslator["MathCeil"           ]
// GLSLTranslator["MathRound"          ]
// GLSLTranslator["MathMod"            ]
// GLSLTranslator["MathTruncate"       ]
// GLSLTranslator["MathVecLength"      ]
// GLSLTranslator["MathVecNormalize"   ]
// GLSLTranslator["MathVecDistance"    ]
// GLSLTranslator["MathVecDot"         ]
// GLSLTranslator["MathVecCross"       ]
// GLSLTranslator["MathVecReflect"     ]
// GLSLTranslator["MathVecRefract"     ]

// GLSLTranslator["MathTrigSin"        ]
// GLSLTranslator["MathTrigCos"        ]
// GLSLTranslator["MathTrigTan"        ]
// GLSLTranslator["MathTrigASin"       ]
// GLSLTranslator["MathTrigACos"       ]
// GLSLTranslator["MathTrigATan"       ]
// GLSLTranslator["MathTrigSinh"       ]
// GLSLTranslator["MathTrigCosh"       ]
// GLSLTranslator["MathTrigTanh"       ]
// GLSLTranslator["MathTrigASinh"      ]
// GLSLTranslator["MathTrigACosh"      ]
// GLSLTranslator["MathTrigATanh"      ]

// GLSLTranslator["RandomFloat"        ]
// GLSLTranslator["RandomVector2"      ]
// GLSLTranslator["RandomVector3"      ]
// GLSLTranslator["RandomVector4"      ]
// GLSLTranslator["RandomFloatRange"   ]
// GLSLTranslator["RandomVector2Range" ]
// GLSLTranslator["RandomVector3Range" ]
// GLSLTranslator["RandomVector4Range" ]

// GLSLTranslator["WorldPosition"      ]


function ProcessNode( InNode, outString, InShaderMeta ) {
	
	var NodeStrings = {}
	
	for (let curIter of InNode.parents) {
		
		if (curIter.node.processed == false) {
			ProcessNode(curIter.node, outString, InShaderMeta)
			curIter.node.processed = true
		}		
			
		// this are the input links
		NodeStrings[ curIter.dst_idx ] = GetNodeAsName( curIter.node, curIter.src_idx )
	}
	
	if ( InNode.type in ParamNodes ) {
		ParamNodes[ InNode.type ]( InNode, InShaderMeta )
	}
	
	outString.str += GLSLTranslator[ InNode.type ] ( InNode, NodeStrings ) + "\n"
}

function GenerateGLSL( InOutputNodes, InShaderMeta ) {
	
	var outString = {
		str: ""
	};

	for (let curIter of InOutputNodes) {		
		ProcessNode( curIter, outString, InShaderMeta ) 
	}
	
	return outString.str
}
	
function GenerateNodesList(InMatDataSet) {
	
	let nodesByID = {}	
	let outputNodes = []
	
	for (let curIter of InMatDataSet.nodes) {		
		curIter.parents = []
		curIter.processed = false
		nodesByID[ curIter.id ] = curIter
		
		if( curIter.type === "MaterialOutput" ) {
			outputNodes.push( curIter )
		}
	}
	
	for (let curIter of InMatDataSet.links) {		
		nodesByID[ curIter.dst ].parents.push( {
			node : nodesByID[ curIter.src ],
			dst_idx : curIter.dst_idx,
			src_idx : curIter.src_idx
		} )
	}
	
	let shaderMeta = {
		uniforms: "",
		textures: []		
	}
	let newShaderCode = GenerateGLSL( outputNodes, shaderMeta )
	
	ProcessJS("CompiledShader", shaderMeta, newShaderCode);
}

window["MaterialJSONToGLSL"] = function (InJsonString) {	
	
	const MatDataSet = JSON.parse( InJsonString );
	GenerateNodesList(MatDataSet)
	
}

function loadimage(filename)
{
  //var filename = e1.target.files[0]; 
  var fr = new FileReader();
  fr.onload = imageHandler;  
  fr.readAsDataURL(filename); 
}

var GImageProvider = new ImageProvider()

function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  const data = ev.dataTransfer.items;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].kind === "file" && data[i].type.match("^image/")) {
      // Drag data item is an image file
      const f = data[i].getAsFile();
      console.log("… Drop: File" );
	  
		var fr = new FileReader();
		fr.onload = function(ev) {
			console.log("doneeee");
			
			let imageLink = GImageProvider.addImage( f.name, fr.result )
			
			var newImageNode = LiteGraph.createNode("Input/TextureSample");
			newImageNode.pos = [100,100];
			newImageNode.properties.panel[0].path = imageLink
			//basicFloat.setProperty("y",1.0);
			MaterialGraphInstance.lGraph.add(newImageNode);
	
		};  
		fr.readAsDataURL(f); 
    }
  }
}