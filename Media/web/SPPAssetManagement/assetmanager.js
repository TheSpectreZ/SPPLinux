let CB_Open = false;
const CB_Tabs = {};
const Script_Status = {}; 

const UI_Layouts = {};
const UI_Headers = {};

CreateContentBrowserDiv();

//MOVE TO UTILS!!!!
window.InvokeNative = function (InFuncName, ...theArgs) {
    if (window.CallNativeWithJSON) {
        console.log("Native Invoke: | " + JSON.stringify({ func: InFuncName, args: theArgs }))
        window.CallNativeWithJSON(JSON.stringify({ func: InFuncName, args: theArgs }));
    }
    else {
        console.log("No Native Invoke: | " + JSON.stringify({ func: InFuncName, args: theArgs }))
    }
}

function ProcessJS(FuncName, ...Args) {
    console.log("ProcessJS: " + FuncName + " : " + Args.length);
    // find object
    var fn = window[FuncName];
    // is object a function?
    if (typeof fn === "function") {
        fn.apply(null, Args);
    }
}

window.ProcessJS = ProcessJS;

if (window.RegisterJS) {
    window.RegisterJS(ProcessJS);
}

//window.ENGINE().GetAssetList()
function CreateContentBrowserDiv() 
{    
    $("#CONTENT_BROWSER").load("./../Components/contentBrowser.html", null, function(){

        {
            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = "./../Components/propertyPanel.js";
            document.head.appendChild(scriptElement);
        }

        {
            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = "./../Components/contentBrowser.js";
            document.head.appendChild(scriptElement);
        }

        //$.getScript("./../Components/contentBrowser.js");
        
        //document.getElementById("CB_Directories").style.height  = cb.height + "px";
        //document.getElementById("CB_Files").style.height = cb.height + "px";
        //document.getElementById("CB_Content").style.height = (cb.height - 65) + "px";

        //window.InvokeNative("Editor", "RefreshContentBrowser");
    });
}
