window.InvokeNative = function (InFuncName, ...theArgs) 
{
    if (window.CallNativeWithJSON) 
    {
        console.log("Native Invoke: | " + JSON.stringify({ func: InFuncName, args: theArgs }));
        window.CallNativeWithJSON(JSON.stringify({ func: InFuncName, args: theArgs }));
    }
    else 
    {
        console.log("No Native Invoke: | " + JSON.stringify({ func: InFuncName, args: theArgs }));
    }
}

export function ProcessJS(FuncName, ...Args) 
{
    console.log("ProcessJS: " + FuncName + " : " + Args.length);
    var fn = window[FuncName]; // find object
    if (typeof fn === "function") // is object a function?
    { 
        fn.apply(null, Args);
    }
}

window.ProcessJS = ProcessJS;

if (window.RegisterJS) 
{
    window.RegisterJS(ProcessJS);
}