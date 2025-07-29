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
                }
            ]
        }
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
                        componentName: 'ControlPanel',
                        width: 30,
                        isClosable: false,
                    },
                    {
                        type: 'component',
                        componentName: 'Viewer',
                        isClosable: false,
                    }
                ]
            }]
};

const layout = new GoldenLayout(layoutConfig);

layout.registerComponent("ControlPanel", function(container, componentState){
    container.getElement().html('<div id="CONTROL_PANEL"> </div>');
    container.getElement().css("background", "#293036");            
});

layout.registerComponent("Viewer", function(container, componentState){
    container.getElement().html('<div id="VIEWER" style="width: 100%; height: 100%;"></div>');

    container.on("resize", function(){
        const element = $("#VIEWER")[0];

        var topPos = Math.floor(element.getBoundingClientRect().top + $(window)['scrollTop']());
        var leftPos = Math.floor(element.getBoundingClientRect().left + $(window)['scrollLeft']());
        var rightPos = Math.floor(element.getBoundingClientRect().right + $(window)['scrollLeft']());
        var bottomPos = Math.floor(element.getBoundingClientRect().bottom + $(window)['scrollTop']());

        window.InvokeNative("EDITOR", `GameViewCoords ${leftPos} ${rightPos} ${topPos} ${bottomPos}`);
    });   
});

layout.on("initialised", function() {

    $("#CONTROL_PANEL").load("./../Components/voxelEditor.html", null, function() 
    {        
        $.getScript("./../Components/voxelEditor.js", function(data,textStatus, jqxhr)
        {
            ProcessJS("InitializeVoxelEditor");
        });
    });

});

layout.init();