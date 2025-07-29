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
                        cssClass: 'scrollable',
                    },
                    {
                        type: 'component',
                        componentName: 'Details',
                        isClosable: false,
                    },
                ]
            },
            {
                type: 'component',
                componentName: 'Layers',
                isClosable: false
            },
        ]
    }]
};

const layout = new GoldenLayout(layoutConfig);


layout.registerComponent("Layers", function(container, componentState){
    graphLayout = container;
    
    container.getElement().html(`<div id="LAYERS" style="width: 100%; height: 100%;""> </div>`);
    //container.getElement().css("background", "#293036");

    container.on("resize", function()
    {
        ProcessJS("OnResizeParticleLayerPanel");
    });
});

layout.registerComponent("Details", function(container, componentState){
    panelLayout = container;

    container.getElement().html(`<div id="DETAILS"> </div>`);
    container.getElement().css("background", "#233036");
    
    container.on("resize", function()
    {
        //ProcessJS("OnResizeMaterialPanel", container.width, container.height - headerDiv.clientHeight);
    });
});

layout.registerComponent("Viewer", function(container, componentState){
    container.getElement().html(`<div id="VIEWER" style="width: 100%; height: 100%;"> </div>`);
    
	container.on("resize", function () {
		
		onViewerResize()
		
		/*
        const element = $("#VIEWER")[0];
        
        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

        window.InvokeNative("EDITOR", `GameViewCoords ${leftPos} ${rightPos} ${topPos} ${bottomPos}`);*/
    });   
});


layout.on("initialised", function() {

    $("#LAYERS").load("./../Components/particleLayers.html", null, function () {
        //$.getScript("./../Components/particleLayers.js", function (data, textStatus, jqxhr) {
        ProcessJS("InitializeParticleLayerPanel", "LAYERS", "DETAILS");
        //})
    });

    //$("#DETAILS").load("./../Components/propertyPanel.html", null, function () {
    //    $.getScript("./../Components/propertyPanel.js", function (data, textStatus, jqxhr) {
    //        //ProcessJS("InitializeMaterialPanel", panelLayout.width, panelLayout.height - headerDiv.clientHeight);
    //    })
    //});

    RunViewer()
});

layout.init();