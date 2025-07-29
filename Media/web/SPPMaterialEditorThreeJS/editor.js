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

function generate_uuidv4() {
   var dt = new Date().getTime();
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
   function( c ) {
      var rnd = Math.random() * 16;//random number in range 0 to 16
      rnd = (dt + rnd)%16 | 0;
      dt = Math.floor(dt/16);
      return (c === 'x' ? rnd : (rnd & 0x3 | 0x8)).toString(16);
   });
}


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

// TODO MOVE THIS TO UTILS?!
var loadScript = function (path) {
  var result = $.Deferred(),
  script = document.createElement("script");
  script.async = "async";
  script.type = "text/javascript";
  script.src = path;
  script.onload = script.onreadystatechange = function (_, isAbort) {
      if (!script.readyState || /loaded|complete/.test(script.readyState)) {
         if (isAbort)
             result.reject();
         else
            result.resolve();
    }
  };
  script.onerror = function () { result.reject(); };
  $("head")[0].appendChild(script);
  return result.promise();
};

layout.on("initialised", function() {

    $("#CONTROL_PANEL").load("./../Components/materialPanel.html", null, function()
    {
        $.getScript("./../Components/materialPanel.js", function(data, textStatus, jqxhr)
        {
            ProcessJS("InitializeMaterialPanel", panelLayout.width, panelLayout.height - headerDiv.clientHeight);
        })
    });
    
    $("#GRAPH").load("./../Components/materialGraph.html", null, function()
    {
        $.when( loadScript("./../Components/materialGraph.js") ).then( function() // $.getScript("./../Components/materialGraph.js", function(data, textStatus, jqxhr)
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
	
	
    RunViewer()
});

layout.init();