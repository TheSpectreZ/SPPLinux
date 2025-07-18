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

export function MakeIntoNativeCaller(InObj, Tag) {
    for (const [key, value] of Object.entries(InObj)) {
        InObj[key] = function (...theArgs) {
            window.InvokeNative(Tag, key, theArgs.map(arg => String(arg)).join(' '));
        }
    }
}
window.ProcessJS = ProcessJS;

if (window.RegisterJS) 
{
    window.RegisterJS(ProcessJS);
}
