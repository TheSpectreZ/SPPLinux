let CB_Open = false;
const CB_Tabs = {};
const Script_Status = {}; 

const UI_Layouts = {};
const UI_Headers = {};

CreateHeader();
CreateFooter();

const editorStack = CreateEditorTabStack();

function CreateEditorTabStack() 
{
   const config = {
        content: [{
            type: 'stack',
            content: []
        }],
        callbacks: [
            {
                name: 'initialised',
                func: function() {
                    CreateSceneEditorTab("", "NewScene.spj");

                    editorStack.root.contentItems[0].on("activeContentItemChanged", function(curItem) {
                        const id = curItem.config.componentState.fname;
                        window.InvokeNative("Editor", `SwitchEditorTab ${id}`);
                    });
                },
            }
        ]
    };

    return CreateUILayout(config, document.getElementById("EDITOR_MAIN"), false);
}

window.addEventListener("resize", function(e)
{
    const headerDiv = document.getElementById("EDITOR_HEADER");
    const footerDiv = document.getElementById("EDITOR_FOOTER");

    const size = headerDiv.getBoundingClientRect().height + footerDiv.getBoundingClientRect().height - 0.2;

    editorStack.updateSize(window.innerWidth , window.innerHeight - size);
});

function CreateSceneEditorTab(file, name) 
{
    const headerConfig = {
        classList: [ "EditorHeader" ],
        Menu: [
            {
                name: "Save",
                func: function() { window.InvokeNative("Client", "MenuOptionSave"); }
            },
            {
                name: "Load",
                func: function() { window.InvokeNative("Client", "MenuOptionLoad"); }
            }
        ]
    };

    const Tab = CreateTabContainer(name, "SceneEditor");
    
    const fName = Tab.fname;
    const ID = Tab.Id;

    UI_Headers[fName] = CreateHeaderMenu(headerConfig, document.getElementById(ID + "-Header"));

    const config = {
        content: [{
            type: 'row',
            content: [{
                type: 'column',
                width: 35,
                content: [{
                    type: 'component',
                    componentName: 'Outline',
                    height: 50,
                    isClosable: false,
                },   
                {
                    type: 'component',
                    componentName: 'Properties',
                    isClosable: false,
                }],
            },
            {
                type: 'column',
                content: [{
                    type: 'component',
                    componentName: 'Viewer',
                    componentState: {
                        name: fName
                    },
                    isClosable: false,
                }]
            }]
        }],
        componentCtor: [
            {
                name: "Outline",
                func: function (container, componentState) {
                    container.getElement().html('<div id="' + ID + '-Outline" style="width: 100%; height: 100%;"> </div>');
                    container.getElement().css("background", "#1a1a1a");

                    container.on("resize", function(){
                        ProcessJS("ResizeSceneOutline", ID, container.width, container.height);
                    });
                }
            },
            {
                name: "Properties",
                func: function (container, componentState) {
                    container.getElement().html('<div id="' + ID + '-Properties" style="width: 100%; height: 100%;"></div>');
                    container.getElement().css("background", "#1a1a1a");

                    container.on("resize", function() {
                        ProcessJS("ResizeSceneProperties", ID, container.width, container.height);
                    });
                }
            },
            {
                name: "Viewer",
                func: function (container, componentState) {

                    const Id = ID + "-Viewer";
                    container.getElement().html('<div id="' + Id + '"style="width: 100%; height: 100%;"></div>');
                    //container.getElement().css("background", "#1a1a1a");
                    
                    container.on('resize', function () {

                        const element = $("#" + Id)[0];
                        
                        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
                        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
                        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
                        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

                        window.InvokeNative("Client", `GameViewCoords ${leftPos} ${rightPos} ${topPos} ${bottomPos}`);
                    });    
                }
            }
        ],
        callbacks: [
            {
                name: "initialised",
                func: function() {
                    const outline = $("#" + ID + "-Outline");
                    outline.load("./../Components/sceneOutline.html", null, function()
                    {
                        outline.find("#SO_Root").attr("id", ID + "-SO_Root");

                        if(Script_Status["SceneOutline"])
                        {
                            ProcessJS("CreateSceneOutlineInstance", ID, outline[0].clientWidth, outline[0].clientHeight);
                            return;
                        }

                        Script_Status["SceneOutline"] = true;

                        $.getScript("./../Components/sceneOutline.js", function(data, textStatus, jqxhr) 
                        {
                            ProcessJS("CreateSceneOutlineInstance", ID, outline[0].clientWidth, outline[0].clientHeight);
                        });
                        
                    });

                    const props = $("#" + ID + "-Properties");
                    props.load("./../Components/sceneProperties.html", null, function()
                    {
                        props.find("#SP_Root").attr("id", ID + "-SP_Root");

                        if(Script_Status["SceneProperties"])
                        {
                            ProcessJS("CreateScenePropertiesInstance", ID, props[0].clientWidth, props[0].clientHeight);
                            return;
                        }

                        Script_Status["SceneProperties"] = true;
                        $.getScript("./../Components/sceneProperties.js", function(data, textStatus, jqxhr)
                        {
                            ProcessJS("CreateScenePropertiesInstance", ID, props[0].clientWidth, props[0].clientHeight);
                        });
                    })
                }
            }
        ]
    }   
    
    window.InvokeNative("Editor", `CreateEditorTab ${fName} ${ID} ${file} VgSceneEnvironment`);
    UI_Layouts[fName] = CreateUILayout(config, document.getElementById(ID));
    ResizeTabContainer(ID, fName, GetTabContainerFromEditorStack(ID));
}

function CreateParticleEditorTab(file, name) 
{
    const Tab = CreateTabContainer(name, "ParticleEditor");
    const fName = Tab.fname;
    const ID = Tab.Id;
   
    const headerConfig = {
        Id: ID,
        MenuGroup: [
            {
                name: "File",
                items: [
                    { name: "New"  },
                    { name: "Load" },
                    { name: "Save" },
                ]
            },
        ],
        Menu: [
            { name: "Compile" },
            { name: "Back"    }
        ]
    };

    UI_Headers[fName] = CreateHeaderMenu(headerConfig, document.getElementById(ID + "-Header"));

    const config = {
        content: [{
            type: 'row',
            content: [
                {
                    type: 'component',
                    componentName: 'Graph',
                    width: 40,
                    isClosable: false,
                },
                {
                    type: 'component',
                    componentName: 'Viewer',
                    componentState: {
                        name: fName
                    },
                    isClosable: false,
                }
            ]
        }],
        componentCtor: [
            {
                name: "Graph",
                func: function (container, componentState) {
                    container.getElement().html('<div id="' + ID + '-Graph" style="width: 100%; height: 100%;"> </div>');
                    container.getElement().css("background", "#293036");

                    container.on("resize", function()
                    {
                        ProcessJS("OnResizeParticleEditorGraph", ID, container.width, container.height - 35);
                    });
                }
            },
            {
                name: "Viewer",
                func: function (container, componentState) {
                    
                    const Id = ID + "-Viewer";
                    container.getElement().html('<div id="' + Id + '"style="width: 100%; height: 100%;"></div>');
                    container.on('resize', function () {

                        const element = $("#" + Id)[0];
                        
                        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
                        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
                        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
                        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

                        window.InvokeNative("Client", `GameViewCoords ${leftPos} ${rightPos} ${topPos} ${bottomPos}`);
                    });    
                }
            },
        ],
        callbacks: [
            {
                name: "initialised",
                func: function () 
                {
                    const graph = $("#" + ID + "-Graph");
                    graph.load("./../Components/particleEditor.html", null, function() 
                    {
                        graph.find("#CompileBtn").attr("id", ID + "CompileBtn");
                        graph.find("#BackBtn").attr("id", ID + "BackBtn");
                        graph.find("#GraphCanvas").attr("id", ID + "GraphCanvas");
                        graph.find("#CurveTab").attr("id",  ID + "CurveTab");

                        const headerBtns = {
                            compile: document.getElementById(ID + "-Compile"),
                            back: document.getElementById(ID + "-Back"),
                            new: document.getElementById(ID + "-New"),
                            load: document.getElementById(ID + "-Load"),
                            save: document.getElementById(ID + "-Save")
                        };

                        const container = GetTabContainerFromEditorStack(ID);

                        if(Script_Status["ParticleEditor"])
                        {
                            ProcessJS("CreateParticleEditorInstance", ID, fName, headerBtns, container.width, container.height - 56);
                            return;
                        }

                        Script_Status["ParticleEditor"] = true;

                        $.getScript("./../Components/particleEditor.js", function(data, textStatus, jqxhr)
                        {
                            ProcessJS("CreateParticleEditorInstance", ID, fName, headerBtns, container.width, container.height - 56);
                        });
                    });
                }
            }
        ]
    }       

    window.InvokeNative("Editor", `CreateEditorTab ${fName} ${ID} ${file} VgParticleEnvironment`);
    UI_Layouts[fName] = CreateUILayout(config, document.getElementById(ID));
    ResizeTabContainer(ID, fName, GetTabContainerFromEditorStack(ID));
}

function CreateVoxelEditorTab(file, name) {
    
    const Tab = CreateTabContainer(name, "VoxelEditor");
    const fName = Tab.fname;
    const ID = Tab.Id;

    const headerConfig = {
        Id: ID,
        MenuGroup: [
            {
                name: "File",
                items: [
                    {
                        name: "New",
                        func: function() { window.InvokeNative("Client", "MenuOptionNew"); }
                    },
                    {
                        name: "Load",
                        func: function() { window.InvokeNative("Client", "MenuOptionLoad"); }
                    },
                    {
                        name: "Save",
                        func: function() { window.InvokeNative("Client", "MenuOptionSave"); }
                    }
                ]
            }
        ]
    };

    UI_Headers[fName] = CreateHeaderMenu(headerConfig, document.getElementById(ID + "-Header"));

    const config = {
        content: [{
            type: 'row',
            content: [
                {
                    type: 'component',
                    componentName: 'ControlPanel',
                    width: 20,
                    isClosable: false,
                },
                {
                    type: 'component',
                    componentName: 'Viewer',
                    componentState: {
                        name: fName
                    },
                    isClosable: false,
                }
            ]
        }],
        componentCtor: [
            {
                name: "ControlPanel",
                func: function (container, componentState) {
                    container.getElement().html('<div id="' + ID + '-ControlPanel" style="width: 100%; height: 100%;"> </div>');
                    container.getElement().css("background", "#293036");
                }
            },
            {
                name: "Viewer",
                func: function (container, componentState) {
                
                    const Id = ID + "-Viewer";
                    container.getElement().html('<div id="' + Id + '"style="width: 100%; height: 100%;"></div>');
                    
                    container.on('resize', function () {

                        const element = $("#" + Id)[0];
                        
                        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
                        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
                        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
                        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

                        window.InvokeNative("Client", `GameViewCoords ${leftPos} ${rightPos} ${topPos} ${bottomPos}`);
                    });   
                }
            },
        ],
        callbacks: [
            {
                name: "initialised",
                func: function () {
                    const panel = $("#" + ID + "-ControlPanel");
                    panel.load("./../Components/voxelEditor.html", null, function()
                    {
                        function IDreplaceHelper(tag, Id, parent, radio = false) {
                            const elm = parent.find("#" + tag)[0];
                            elm.id = Id + tag;
                            elm.data = Id;

                            if(radio)
                            {
                                elm.name += Id;
                            }
                        }

                        {
                            IDreplaceHelper("buttonPaint", ID, panel);
                            IDreplaceHelper("buttonErase", ID, panel);
                            IDreplaceHelper("buttonMesh", ID, panel);
                            IDreplaceHelper("buttonSettings", ID, panel);
                            IDreplaceHelper("brushInfoDiv", ID, panel);
                            IDreplaceHelper("brushInfoPlacementTypeDiv", ID, panel);
                            IDreplaceHelper("buttonReplace", ID, panel);
                            IDreplaceHelper("buttonFill", ID, panel);
                            IDreplaceHelper("buttonCover", ID, panel);
                            IDreplaceHelper("buttonSphere", ID, panel);
                            IDreplaceHelper("buttonBox", ID, panel);
                            IDreplaceHelper("brushSize", ID, panel);
                            IDreplaceHelper("brushSizeDiv", ID, panel);
                            IDreplaceHelper("voxelSelectDiv", ID, panel);
                            IDreplaceHelper("meshSelectDiv", ID, panel);
                            IDreplaceHelper("meshScale", ID, panel);
                            IDreplaceHelper("meshScaleDiv", ID, panel);
                            IDreplaceHelper("alignHorzL", ID, panel, true);
                            IDreplaceHelper("alignHorzC", ID, panel, true);
                            IDreplaceHelper("alignHorzR", ID, panel, true);
                            IDreplaceHelper("alignVertT", ID, panel, true);
                            IDreplaceHelper("alignVertC", ID, panel, true);
                            IDreplaceHelper("alignVertB", ID, panel, true);
                            IDreplaceHelper("txtPivotX", ID, panel);
                            IDreplaceHelper("txtPivotY", ID, panel);
                            IDreplaceHelper("txtPivotZ", ID, panel);
                            IDreplaceHelper("txtPivotRotX", ID, panel);
                            IDreplaceHelper("txtPivotRotY", ID, panel);
                            IDreplaceHelper("txtPivotRotZ", ID, panel);
                            IDreplaceHelper("chkXRotation", ID, panel);
                            IDreplaceHelper("chkYRotation", ID, panel);
                            IDreplaceHelper("chkZRotation", ID, panel);
                            IDreplaceHelper("meshListDiv", ID, panel);
                            IDreplaceHelper("settingsDiv", ID, panel);
                            IDreplaceHelper("buttonNew", ID, panel);
                            IDreplaceHelper("buttonLoad", ID, panel);
                            IDreplaceHelper("buttonSave", ID, panel);
                        }

                        if(Script_Status["VoxelEditor"])
                        {
                            ProcessJS("CreateVoxelEditorInstance", ID);
                            return;
                        }

                        Script_Status["VoxelEditor"] = true;

                        $.getScript("./../Components/voxelEditor.js", function(data, textStatus, jqxhr) 
                        {
                            ProcessJS("CreateVoxelEditorInstance", ID);
                        });
                    });
                }
            }
        ]
    }

    window.InvokeNative("Editor", `CreateEditorTab ${fName} ${ID} ${file} VgVoxelEnvironment`);
    UI_Layouts[fName] = CreateUILayout(config, document.getElementById(ID));
    ResizeTabContainer(ID, fName, GetTabContainerFromEditorStack(ID));
}

function CreateMaterialEditorTab(file, name) {

    const Tab = CreateTabContainer(name, "MaterialEditor");
    const fName = Tab.fname;
    const ID = Tab.Id;

    const headerConfig = {
        Id: ID,
        MenuGroup: [
            {
                name: "File",
                items: [
                    { name: "New" },
                    { name: "Load" },
                    { name: "Save" },
                ]
            },
        ],
        Menu: [
            { name: "Compile" },
        ]
    };

    UI_Headers[fName] = CreateHeaderMenu(headerConfig, document.getElementById(ID + "-Header"));

    let graphLayout = null;
    let panelLayout = null;

    const config = {
        content: [{
            type: 'row',
            content:
            [
                {
                    type: 'column',
                    width: 25,
                    content: [
                        {
                            type: 'component',
                            componentName: 'Viewer',
                            isClosable: false,
                            height: 40,
                        },
                        {
                            type: 'component',
                            componentName: 'ControlPanel',
                            isClosable: false,
                        },
                    ]
                },
                {
                    type: 'component',
                    componentName: 'Graph',
                    isClosable: false
                },
            ]
        }],
        componentCtor: [
            {
                name: "ControlPanel",
                func: function(container, componentState) {
                    panelLayout = container;

                    container.getElement().html('<div id="' + ID + '-ControlPanel"> </div>');
                    container.getElement().css("background", "#233036");

                    container.on("resize", function()
                    {
                        ProcessJS("OnResizeMaterialPanel", ID, container.width, container.height);
                    });
                }
            },
            {
                name: "Viewer",
                func: function(container, componentState) {
                    const Id = ID + "-Viewer";

                    container.getElement().html('<div id="' + Id + '" style="width: 100%; height: 100%;"> </div>');

                    container.on("resize", function (){

                        const element = $("#" + Id)[0];

                        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
                        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
                        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
                        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

                        window.InvokeNative("Client", `GameViewCoords@${leftPos}@${rightPos}@${topPos}@${bottomPos}`);
                    });   
                }
            },
            {
                name: "Graph",
                func: function(container, componentState) {
                    graphLayout = container;

                    container.getElement().html('<div id="' + ID + '-Graph"> </div>');
                    container.getElement().css("background", "#293036");

                    container.on("resize", function()
                    {
                        ProcessJS("OnResizeMaterialGraph", ID, container.width, container.height);
                    });
                }
            }
        ],
        callbacks: [
            {
                name: "initialised",
                func: function() {

                    $("#" + ID + "-ControlPanel").load("./../Components/materialPanel.html", null, function()
                    {
                        $("#" + ID + "-ControlPanel").find("#MP_Root")[0].id = ID + "MP_Root";
                        
                        if(Script_Status["MaterialEditorPanel"])
                        {
                            ProcessJS("CreateMaterialPanelInstance", ID, fName, panelLayout.width, panelLayout.height);
                            return;
                        }

                        Script_Status["MaterialEditorPanel"] = true;

                        $.getScript("./../Components/materialPanel.js", function(data, textStatus, jqxhr) 
                        {
                            ProcessJS("CreateMaterialPanelInstance", ID, fName, panelLayout.width, panelLayout.height);
                        });
                    })
                    
                    const graph = $("#" + ID + "-Graph");
                    graph.load("./../Components/materialGraph.html", null, function()
                    {
                        graph.find("#GraphCanvas")[0].id = ID + "GraphCanvas";

                        const headerBtns = {
                            new: document.getElementById(ID + "-New"),
                            load: document.getElementById(ID + "-Load"),
                            save: document.getElementById(ID + "-Save"),
                            compile: document.getElementById(ID + "-Compile"),
                        };

                        if(Script_Status["MaterialEditorGraph"])
                        {
                            ProcessJS("CreateMaterialGraphInstance", ID, fName, headerBtns, graphLayout.width, graphLayout.height);
                            return;
                        }

                        Script_Status["MaterialEditorGraph"] = true;

                        $.getScript("./../Components/materialGraph.js", function(data, textStatus, jqxhr)
                        {   
                            ProcessJS("CreateMaterialGraphInstance", ID, fName, headerBtns, graphLayout.width, graphLayout.height);
                        })
                    });
                }
            }
        ]
    }

    window.InvokeNative("Editor", `CreateEditorTab ${fName} ${ID} ${file} VgMaterialEnvironment`);
    UI_Layouts[fName] = CreateUILayout(config, document.getElementById(ID));
    ResizeTabContainer(ID, fName, GetTabContainerFromEditorStack(ID));
}

function CreateTabContainer(name, type) 
{
    const index = name.lastIndexOf(".");
    const fName = name.slice(0, index);

    let ID = fName + "-" + type;
    if (CB_Tabs[name]) {
        const item = editorStack.root.getItemsById(ID)[0];
        editorStack.root.contentItems[0].setActiveContentItem(item);
        return {Id: ID, fname: fName };
    }

    CB_Tabs[name] = true;

    var newItemConfig = {
        type:'component',
        componentName: name,
        componentState: {
            id: ID,
            fname: fName
        },
        id: ID
    };

    if (!editorStack._components[name]) {
        editorStack.registerComponent(name, function (container, componentState) {
            container.getElement().html('\
            <div class="Tab-Header" id="' + componentState.id + '-Header" style="width: 100%;"></div>\
            <div id="' + componentState.id + '" style="width: 100%; height: 100%;"></div>'
            );

            container.on("destroy", function()
            {
                window.InvokeNative("Editor", `RemoveEditorTab ${componentState.fname}`);
            });

            container.on("resize", function()
            {
                ResizeTabContainer(componentState.id, componentState.fname, container);
            });
        });
    }

    editorStack.root.contentItems[0].addChild(newItemConfig);
    return {Id: ID, fname: fName };
}

function ResizeTabContainer(Id, fName, container) {
    const header = document.getElementById(Id + "-Header");

    const width = container.width;
    const height = container.height - header.clientHeight + 0.4;

    if(UI_Layouts[fName])
    {
        console.log("Name: ", fName," Width: ", width, " Height: ", height, " Header: ", header.clientHeight);
        UI_Layouts[fName].updateSize(width, height);
    }   
}

function GetTabContainerFromEditorStack(Id) 
{
    return editorStack.root.contentItems[0].getItemsById(Id)[0].container;
}

function CreateUILayout(config, parent, reorder = true) 
{
    const layoutConfig = {
        settings: {
            reorderEnabled: false,
            selectionEnabled: false,
            hasHeaders: true,
            closePopoutsOnUnload: true,
            constrainDragToContainer: false,
            popoutWholeStack: false,
            blockedPopoutsThrowError: false,
            showPopoutIcon: false,
            showMaximiseIcon: false,
            showCloseIcon: false
        },
        labels: {
            close: 'close',
            maximise: 'maximise',
            minimise: 'minimise',
            popout: 'open in new window'
        },
        content: config.content
    };

    const layout = new GoldenLayout(layoutConfig, parent);

    for(const key in config.componentCtor)
    {
        const value = config.componentCtor[key];
        layout.registerComponent(value.name, value.func);
    }

    for(const key in config.callbacks)
    {
        const value = config.callbacks[key];
        layout.on(value.name, value.func);
    }

    layout.init();
    return layout;
}

const UnknownTabInfo = {
    scene: 0,
    particle: 0,
    voxel: 0,
    material: 0
};

let camera = false;

function CreateHeader()
{
    const headerDiv = document.getElementById("EDITOR_HEADER");

    const config = {
        MenuGroup: [{
            name: "Window",
            items: [
                {
                    name: "Scene Editor",
                    func: function() {
                        const name = "Scene" + (UnknownTabInfo.scene++) + ".spj";
                        CreateSceneEditorTab("", name);
                    }
                },
                {
                    name: "Particle Editor",
                    func: function() {
                        const name = "Particle" + (UnknownTabInfo.scene++) + ".pcs";
                        CreateParticleEditorTab("", name);
                    }
                },
                {
                    name: "Voxel Editor",
                    func: function() {
                        const name = "Voxel" + (UnknownTabInfo.scene++) + ".vxs";
                        CreateVoxelEditorTab("", name);
                    }
                },
                {
                    name: "Material Editor",
                    func: function() {
                        const name = "Material" + (UnknownTabInfo.material++) + ".mtj";
                        CreateMaterialEditorTab("", name);
                    }
                }
            ]
        }],
        Menu:[
            {
                name: "SwitchCamera",
                func: function() {
                    camera = !camera;
                    window.InvokeNative("ConsoleCommand", `SwitchCamera ${camera}`);
                }
            }
        ] 
    };

    return CreateHeaderMenu(config, headerDiv);
}

function CreateFooter() 
{
    const footerDiv = document.getElementById("EDITOR_FOOTER_CONTAINERS");

    const cb = document.createElement("div");
    cb.classList.add("Footer-ContentBrowser");
    cb.height = 345;
    cb.id = "CONTENT_BROWSER";
    footerDiv.appendChild(cb);
    
    $("#CONTENT_BROWSER").load("./../Components/contentBrowser.html", null, function(){

        $.getScript("./../Components/contentBrowser.js");
        
        document.getElementById("CB_Directories").style.height  = cb.height + "px";
        //document.getElementById("CB_Files").style.height = cb.height + "px";
        document.getElementById("CB_Content").style.height = (cb.height - 65) + "px";

        window.InvokeNative("Editor", "RefreshContentBrowser");
    });
}

function ToggleContentBrowser() 
{
    CB_Open = !CB_Open;
    document.getElementById("CONTENT_BROWSER").classList.toggle("show");
}

const CB_SupportedExtensions = {};
CB_SupportedExtensions["pcs"] = function(Path, File) { CreateParticleEditorTab(Path, File); };
CB_SupportedExtensions["spj"] = function(Path, File) { CreateSceneEditorTab(Path, File); };
CB_SupportedExtensions["vxs"] = function(Path, File) { CreateVoxelEditorTab(Path, File); };
CB_SupportedExtensions["mtj"] = function(Path, File) { CreateMaterialEditorTab(Path, File); };

function OnContentBrowserFileOpen(File) {
    if(CB_Open) ToggleContentBrowser();

    const Index = File.lastIndexOf(".");
    const extension = File.slice(Index + 1).toLowerCase();

    if(!CB_SupportedExtensions[extension])
    {
        console.log("Unsupported File: ", File);
        return;
    }

    const nIndex = File.lastIndexOf("/");
    const Name = File.slice(nIndex+1);

    const fnc = CB_SupportedExtensions[extension];
    fnc(File, Name);
}
window["CB_OPEN_FILE_EVENT"] = OnContentBrowserFileOpen;

window.InvokeNative = function (InFuncName, ...theArgs) 
{
    if (window.CallNativeWithJSON) {
        //console.log("Native Invoke: | " + JSON.stringify({ func: InFuncName, args: theArgs }))
        window.CallNativeWithJSON(JSON.stringify({ func: InFuncName, args: theArgs }));
    }
    else {
        console.log("No Native Invoke: | " + JSON.stringify({ func: InFuncName, args: theArgs }))
    }
}

function ProcessJS(FuncName, ...Args) 
{
    console.log("ProcessJS: " + FuncName + " : " + Args.length);
    // find object
    var fn = window[FuncName];
    // is object a function?
    if (typeof fn === "function") {
        fn.apply(null, Args);
    }
}

if (window.RegisterJS) 
{
    window.RegisterJS(ProcessJS);
}

document.addEventListener("keydown", function(event){
    if(event.ctrlKey && event.code == "Space") {
        event.preventDefault();
        ToggleContentBrowser();
    }
})