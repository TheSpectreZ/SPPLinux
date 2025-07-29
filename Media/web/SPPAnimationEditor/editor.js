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
    }]
};

const layout = new GoldenLayout(layoutConfig);

let graphLayout = null;
let panelLayout = null;

layout.registerComponent("Graph", function(container, componentState){
    graphLayout = container;
    
    container.getElement().html(`<div id="GRAPH"> </div>`);
    container.getElement().css("background", "#293036");

    container.on("resize", function()
    {
        ProcessJS("OnResizeMaterialGraph", container.width, container.height - headerDiv.clientHeight);
    });
});

layout.registerComponent("ControlPanel", function(container, componentState){
    panelLayout = container;

    container.getElement().html(`<div id="CONTROL_PANEL"> </div>`);
    container.getElement().css("background", "#233036");
    
    container.on("resize", function()
    {
        ProcessJS("OnResizeMaterialPanel", container.width, container.height - headerDiv.clientHeight);
    });
});

layout.registerComponent("Viewer", function(container, componentState){
    container.getElement().html(`<div id="VIEWER" style="width: 100%; height: 100%;"> </div>`);
    
    container.on("resize", function () {
        const element = $("#VIEWER")[0];

        let boundingRect = element.getBoundingClientRect();
        
        var topPos      = Math.floor(boundingRect.top + $(window)['scrollTop']());
        var leftPos     = Math.floor(boundingRect.left + $(window)['scrollLeft']());
        var rightPos    = Math.floor(boundingRect.right + $(window)['scrollLeft']());
        var bottomPos   = Math.floor(boundingRect.bottom + $(window)['scrollTop']());

        window.InvokeNative("EDITOR", `GameViewCoords ${leftPos} ${rightPos} ${topPos} ${bottomPos}`);
    });   
});

layout.on("initialised", function() {

    $("#CONTROL_PANEL").load("./../Components/materialPanel.html", null, function()
    {
        $.getScript("./../Components/materialPanel.js", function(data, textStatus, jqxhr)
        {
            ProcessJS("InitializeMaterialPanel", panelLayout.width, panelLayout.height - headerDiv.clientHeight);
        })
    });
    
    $("#GRAPH").load("./../Components/animationGraph.html", null, function()
    {
        $.getScript("./../Components/animationGraph.js", function(data, textStatus, jqxhr)
        {
            const buttons = {
                new: document.getElementById("New"),
                load: document.getElementById("Load"),
                save: document.getElementById("Save"),
                compile: document.getElementById("Compile")
            };

            ProcessJS("InitializeMaterialGraph", graphLayout.width, graphLayout.height - headerDiv.clientHeight, buttons);
        })
    });
    
});

layout.init();