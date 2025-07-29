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
                { 
                    name: "New",
                    func: function() { window.InvokeNative("EDITOR", "MenuOptionNew"); }
                },
                {
                    name: "Load",
                    func: function() { window.InvokeNative("EDITOR", "MenuOptionLoad"); }
                },
                { 
                    name: "Save",
                    func: function() { window.InvokeNative("EDITOR", "MenuOptionSave"); }
                },
            ]
        },
    ],
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
        content: [{
            type: 'column',
            width: 35,
            content: [{
                type: 'component',
                componentName: 'Outline',
                isCloseable: false,
                height: 50,
            },
            {
                type: 'component',
                componentName: 'Properties',
                isCloseable: false,
            }]
        },
        {
            type: 'column',
            content: [{
                type: 'component',
                componentName: 'Viewer',
                isCloseable: false,
            }]
        }]
    }]
};

let outlineContainer = null;
let propertiesContainer = null;

const layout = new GoldenLayout(layoutConfig);

layout.registerComponent('Outline', function (container, state) {
    outlineContainer = container;

    container.getElement().html('<div id="OUTLINE"></div>');
    container.getElement().css("background", "#293036");

    container.on("resize", function()
    {
        ProcessJS("ResizeSceneOutline", container.width, container.height);
    });
});

layout.registerComponent('Properties', function (container, state) {
    propertiesContainer = container;

    container.getElement().html('<div id="PROPERTIES"></div>');
    container.getElement().css("background", "#293036");

    container.on("resize", function()
    {
        ProcessJS("ResizeSceneProperties", container.width, container.height);
    });
});

layout.registerComponent('Viewer', function (container, state) {
    container.getElement().html('<div id="VIEWER" style="width: 100%; height: 100%;"></div>');

    container.on("resize", function () {
        
        const element = $("#VIEWER")[0];
        
        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

        window.InvokeNative("EDITOR", `GameViewCoords ${leftPos} ${rightPos} ${topPos} ${bottomPos}`);
    });
});

layout.on("initialised", function () {
    
    $("#OUTLINE").load("./../Components/sceneOutline.html", null, function() 
    {
        $.getScript("./../Components/sceneOutline.js", function(data,textStatus, jqxhr)
        {
            ProcessJS("InitializeSceneOutline", outlineContainer.width, outlineContainer.height);
        });
    });

    $("#PROPERTIES").load("./../Components/sceneProperties.html", null, function() 
    {
        $.getScript("./../Components/sceneProperties.js", function(data,textStatus, jqxhr)
        {
            ProcessJS("InitializeSceneProperties", propertiesContainer.width, propertiesContainer.height);
        });
    });
});

layout.init();