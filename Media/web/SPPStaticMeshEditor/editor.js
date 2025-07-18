window.InvokeNative = function (InFuncName, ...theArgs)
{
    if (window.CallNativeWithJSON) {
        console.log("Native Invoke: | " + JSON.stringify({ func: InFuncName, args: theArgs }))
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

// Header

const headerDiv = document.getElementById("EDITOR_HEADER");
const headerConfig = {
    MenuGroup: [
        {
            name: "File",
            items: [                
                { name: "Reimport" },
                { name: "Save" },
            ]
        },
        {
            name: "View",
            items: [
                { name: "Collisions" },
            ]
        },
    ]
};
CreateHeaderMenu(headerConfig, headerDiv);

// Content

const layoutConfig = {
    settings: {
        reorderEnabled: true,
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
    content: [{
        type: 'row',
        content:
        [
            {
                type: 'component',
                componentName: 'Properties',
                width: 25,
                isClosable: false
            },
            {
                type: 'component',
                componentName: 'Viewer',
                isClosable: false
            },
        ]
    }]
};

const layout = new GoldenLayout(layoutConfig);

let graphLayout = null;
let panelLayout = null;


layout.registerComponent("Properties", function(container, componentState){
    panelLayout = container;

    container.getElement().html(`<div id="PROP_PANEL"> </div>`);
    container.getElement().css("background", "#233036");
    
    container.on("resize", function()
    {
        
    });
});

layout.registerComponent("Viewer", function(container, componentState){
    container.getElement().html(`<div id="VIEWER" style="width: 100%; height: 100%;"> </div>`);
    
    container.on("resize", function () {
        const element = $("#VIEWER")[0];
        
        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

        window.InvokeNative("GameViewCoords", leftPos.toString(), rightPos.toString(), topPos.toString(), bottomPos.toString());
    });   
});

let ActivePanel = null;


let MaterialFakeList = [
    "Mesh.Materias.Basic",
    "Mesh.Materias.Basic2",
    "Mesh.Materias.Basic3",
    "Mesh.Materias.BasicAhh",
    "Mesh.Basic",
    "Mesh.SuperMaterias.Basic",
];

function GetGlobalObjectRefsByType(InType) 
{
    if (InType === "OMaterial") {
        return MaterialFakeList;
    }

    return null;
}

let EnumTestEnum = new Enum("ETestEnum", "big", "small", "ahh");


const JSONTestData =
 `
{
    "properties" : [
        {
	        "name" : "Materials",
	        "access" : "",
            "description" : "",
	        "data" : {
                "type" : "DynamicArray",
                "value" : {
                    "type" : "ObjectReference",
                    "metaInfo" : "OMaterial",
                    "value" : [ "Mesh.Materias.Basic", "Mesh.Materias.Basic2" ]
                }                
	        }
        },
        {
	        "name" : "bCollidable",
	        "access" : "",
            "description" : "",
	        "data" : {
                "type" : "bool",
                "value" : "true"
	        }
        },
        {
	        "name" : "enumTest",
	        "access" : "",
            "description" : "",
	        "data" : {
                "type" : "enum",
                "metaInfo" : "ETestEnum",
                "value" : "small"
	        }
        }
    ]
}
`;

layout.on("initialised", function() {

    window.InvokeNative("EditorReady");

    let propPanel = document.getElementById("PROP_PANEL");

    ActivePanel = new PropertyPanel(propPanel);

    ActivePanel.SetJSONProperties(JSONTestData);
    //$("#PROP_PANEL").load("./../Components/materialPanel.html", null, function()
    //{
    //    $.getScript("./../Components/materialPanel.js", function(data, textStatus, jqxhr)
    //    {
    //        ProcessJS("InitializeMaterialPanel", panelLayout.width, panelLayout.height - headerDiv.clientHeight);
    //    })
    //});
    
    //$("#GRAPH").load("./../Components/materialGraph.html", null, function()
    //{
    //    $.getScript("./../Components/materialGraph.js", function(data, textStatus, jqxhr)
    //    {
    //        const buttons = {
    //            new: document.getElementById("New"),
    //            load: document.getElementById("Load"),
    //            save: document.getElementById("Save"),
    //            compile: document.getElementById("Compile")
    //        };

    //        ProcessJS("InitializeMaterialGraph", graphLayout.width, graphLayout.height - headerDiv.clientHeight, buttons);
    //    })
    //});
    
});

layout.init();