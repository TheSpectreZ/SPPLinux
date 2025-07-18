if (!window.InvokeNative) {
    window.InvokeNative = function (InFuncName, ...theArgs) {
        console.log("No Native Invoke: " + JSON.stringify({ func: InFuncName, args: theArgs }))
    }
}

let ScenePropertiesInstance = {};

function InitializeSceneProperties(width, height) 
{
    const Inst = {
        root: document.getElementById("SP_Root"),
        current: null,
        data: null
    };

    Inst.root.style.width = width + "px";
    Inst.root.style.height = height + "px";

    ScenePropertiesInstance = Inst;

    // debug
    //PopulateSceneProperties(JSON.stringify(testSvvo));
}
window["InitializeSceneProperties"] = InitializeSceneProperties;

function PopulateSceneProperties(InValue) 
{
    let JsonValue =  JSON.parse(InValue);
    CreateUIPanel(JsonValue);
}
window["PopulateSceneProperties"] = PopulateSceneProperties;

function ResizeSceneProperties(width, height) {
    ScenePropertiesInstance.root.style.width = width + "px";
    ScenePropertiesInstance.root.style.height = height + "px";
}
window["ResizeSceneProperties"] = ResizeSceneProperties;

function CreateUIPanel(InValue) {
    
    function AddFolder(parent, element, title) {
        const folder = title == "" ? parent : parent.addFolder({ title: title, expanded: true });

        for(const i in element.props) {
            const prop = element.props[i];
            const data = element.data[i];

            const input = folder.addInput(data, prop.name)
            
            input.on('change', function(event){
                if(prop.callback)
                {
                    prop.callback(event, prop);
                }
                else
                {
                    const changeRequest = {
                        value: String(event.value),
                        parentChain: BuildParentChildTree(prop.parentChain)
                    };
                
                    const requestString = JSON.stringify(changeRequest);
                    window.InvokeNative("Client", `SetEditorProperty ${requestString}`);
                }
            });
        }

        for(const i in element.groups) {
            const group = element.groups[i];
            AddFolder(folder, group, i);
        }
    }

    if(ScenePropertiesInstance.current) {
        ScenePropertiesInstance.root.removeChild(Inst.current.parentNode);
        ScenePropertiesInstance.current = null;
        ScenePropertiesInstance.data = null;
    }

    const div = document.createElement("div");
    ScenePropertiesInstance.root.appendChild(div);

    const InData = typeof(InValue) == String ? JSON.parse(InValue) : InValue;
    const PaneData = GeneratePaneData(InData);
    
    const pane = new Tweakpane.Pane({
        container: div,
        title: `${PaneData.name} | ${PaneData.type}`
    });
    
    AddFolder(pane, PaneData, "");

    ScenePropertiesInstance.current = pane.element;
    ScenePropertiesInstance.data = PaneData;
}

function GeneratePaneData(InValue) {
    const data = {
        name: InValue["name"],
        type: InValue["type"],
        groups: [],
        props: [],
        data: [],
    };

    const parentChain = [{
        name: InValue["id"],
        container: InValue["container"]
    }];

    for(const groupName in InValue["value"]) {

        const InGroup = InValue["value"][groupName];

        const { group, gParentChain } = GetDataGroup(InGroup, groupName);
    
        for(const i in InGroup)
        {
            const element = InGroup[i];

            const name = element.name;
            const id = element.id;
            const type = element.type;
            const value = element.value;
            const container = element.container;

            if(KnownType[type])
            {
                const { output, callback } = KnownType[type](value);
                
                const val = {};
                val[name] = output;
        
                const prop = {
                    name: name,
                    parentChain: JSON.parse(JSON.stringify(gParentChain)),
                    callback: callback
                };

                prop.parentChain.push({
                    name: id,
                    container: container
                });

                group.props.push(prop);
                group.data.push(val);
            }
            else if(container == "object")
            {
                // Do something here ...
                console.error("Container: Object - Not Implemented")
            }
            else 
            {
                const val = {};
 
                if(container == "bool")
                {
                    if(String(value).toLowerCase() == "true") 
                        val[name] = true;
                    else if(String(value).toLowerCase() == "false")
                        val[name] = false;
                    else 
                        console.error("INVALID BOOL VALUE: ", value);        
                }
                else
                {
                   val[name] = value;
                }
            
                const prop = {
                    name: name,
                    parentChain: JSON.parse(JSON.stringify(gParentChain)),
                    callback: null,
                };

                prop.parentChain.push({
                    name: id,
                    container: container
                });

                group.props.push(prop);
                group.data.push(val);
            }
        }
    }

    function GetDataGroup(InGroup, name)
    {
        if(name == "") return { group: data, gParentChain: parentChain };

        let group = data.groups[name];
        
        if(group == null)
        {
            group = {
                groups: [],
                props: [],
                data: [],
            }

            data.groups[name] = group;
        }
        
        const chain = JSON.parse(JSON.stringify(parentChain));
        return { group: group, gParentChain: chain  };
    }

    return data
}

function BuildParentChildTree(parentChain) {
    
    let Tree = {
        name: null,
        container: null,
        child: null
    };
    
    let Root = null;
    let parent = null;

    parentChain.forEach(function(element){
        
        if(Root == null)
        {
            Root = Tree;
        }

        Tree.name = element.name;
        Tree.container = element.container;
        Tree.child = {
            name: null,
            container: null,
            child: null
        };

        parent = Tree;
        Tree = Tree.child;
    });

    if(parent.child.name == null)
        parent.child = null;

    return Root;
}

function KnownType_Vec2(data) {
    const output = {
        x: Number(data[""][0].value), y: Number(data[""][1].value)
    };

    const callback = function(event, prop) {
        const chainCopy = JSON.parse(JSON.stringify(prop.parentChain));
        chainCopy.push({
            name: "",
            container: "arithmetic"
        });

        const len = chainCopy.length;

        const vars = ["x", "y"];
        for(const i in vars)
        {
            chainCopy[len-1].name = vars[i];

            const changeRequest = {
                value: String(event.value[vars[i]]),
                parentChain: BuildParentChildTree(chainCopy)
            };
            
            const requestString = JSON.stringify(changeRequest);
            window.InvokeNative("Client", `SetEditorProperty ${requestString}`);
        }
    }

    return { output: output, callback: callback };
}
function KnownType_Vec3(data) {
    const output = {
        x: Number(data[""][0].value), y: Number(data[""][1].value), z: Number(data[""][2].value)
    };

    const callback = function(event, prop) {
        const chainCopy = JSON.parse(JSON.stringify(prop.parentChain));
        chainCopy.push({
            name: "",
            container: "arithmetic"
        });

        const len = chainCopy.length;

        const vars = ["x", "y", "z"];
        for(const i in vars)
        {
            chainCopy[len-1].name = vars[i];

            const changeRequest = {
                value: String(event.value[vars[i]]),
                parentChain: BuildParentChildTree(chainCopy)
            };
            
            const requestString = JSON.stringify(changeRequest);
            window.InvokeNative("Client", `SetEditorProperty ${requestString}`);
        }
    }
    
    return { output: output, callback: callback };
}
function KnownType_Vec4(data) {
    const output = {
        x: Number(data[""][0].value), y: Number(data[""][1].value), z: Number(data[""][2].value), w: Number(data[""][3])
    };
     
    const callback = function(event, prop) {
        const chainCopy = JSON.parse(JSON.stringify(prop.parentChain));
        chainCopy.push({
            name: "",
            container: "arithmetic"
        });

        const len = chainCopy.length;

        const vars = ["x", "y", "z", "w"];
        for(const i in vars)
        {
            chainCopy[len-1].name = vars[i];

            const changeRequest = {
                value: String(event.value[vars[i]]),
                parentChain: BuildParentChildTree(chainCopy)
            };
            
            const requestString = JSON.stringify(changeRequest);
            window.InvokeNative("Client", `SetEditorProperty ${requestString}`);
        }
    }

    return { output: output, callback: callback };
}

const KnownType = {};
KnownType["Vector2"]    = KnownType_Vec2;
KnownType["Vector2d"]   = KnownType_Vec2;
KnownType["Vector3"]    = KnownType_Vec3;
KnownType["Vector3d"]   = KnownType_Vec3;
KnownType["Vector4"]    = KnownType_Vec4;
KnownType["Vector4d"]   = KnownType_Vec4;

const testSvvo = {
	"container" : "object",
	"id" : "SVVO",
	"name" : "SVVO",
	"type" : "VgSVVO",
	"value" : 
	{
		"" : 
		[
			{
				"container" : "arithmetic",
				"id" : "_voxelSize",
				"name" : "VoxelSize",
				"type" : "float",
				"value" : "0.1"
			}
		],
		"Transform" : 
		[
			{
				"container" : "object",
				"id" : "translation",
				"name" : "Translation",
				"type" : "Vector3d",
				"value" : 
				{
					"" : 
					[
						{
							"container" : "arithmetic",
							"id" : "x",
							"name" : "x",
							"type" : "double",
							"value" : "0"
						},
						{
							"container" : "arithmetic",
							"id" : "y",
							"name" : "y",
							"type" : "double",
							"value" : "0"
						},
						{
							"container" : "arithmetic",
							"id" : "z",
							"name" : "z",
							"type" : "double",
							"value" : "0"
						}
					]
				}
			},
			{
				"container" : "object",
				"id" : "rotation",
				"name" : "Rotation",
				"type" : "Vector3",
				"value" : 
				{
					"" : 
					[
						{
							"container" : "arithmetic",
							"id" : "x",
							"name" : "x",
							"type" : "float",
							"value" : "0"
						},
						{
							"container" : "arithmetic",
							"id" : "y",
							"name" : "y",
							"type" : "float",
							"value" : "0"
						},
						{
							"container" : "arithmetic",
							"id" : "z",
							"name" : "z",
							"type" : "float",
							"value" : "0"
						}
					]
				}
			},
			{
				"container" : "object",
				"id" : "scale",
				"name" : "Scale",
				"type" : "Vector3",
				"value" : 
				{
					"" : 
					[
						{
							"container" : "arithmetic",
							"id" : "x",
							"name" : "x",
							"type" : "float",
							"value" : "204.8"
						},
						{
							"container" : "arithmetic",
							"id" : "y",
							"name" : "y",
							"type" : "float",
							"value" : "25.6"
						},
						{
							"container" : "arithmetic",
							"id" : "z",
							"name" : "z",
							"type" : "float",
							"value" : "204.8"
						}
					]
				}
			}
		]
	}
}