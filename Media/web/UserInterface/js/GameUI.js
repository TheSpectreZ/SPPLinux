import * as SPP from "./SPP.js";

function ProcessJS(FuncName, ...Args) {	  
    //console.log("ProcessJS: " + FuncName + " : " + Args.length);
    // find object
    var fn = window[FuncName];

    // is object a function?
    if (typeof fn === "function") 
    {
        fn.apply(null, Args);
    }
}	
    
window.InvokeNative = function(InFuncName, ...theArgs) {				
    if(window.CallNativeWithJSON)
    {
        window.CallNativeWithJSON(JSON.stringify({ func: InFuncName, args: theArgs }));
    }	
    else
    {
        console.log("No Native Invoke: " + JSON.stringify({ func: InFuncName, args: theArgs }))
    }
}

if(window.RegisterJS)
{	
    window.RegisterJS(ProcessJS);		
}

////////////////////////////////////////////////////

class GameUILayer extends SPP.GameUILayer
{
    constructor(InManager, InMouseLock)
    {
        super(InManager, InMouseLock);
    }

    Show()
    {
        super.Show();
    }

    Hide()
    {
        super.Hide();
    }
}

class PauseMenuLayer extends SPP.GameUILayer
{
    constructor(InManager)
    {
        super(InManager);

        this.btns = [
            {
                name: "Resume",
                func: () => PauseMenuLayer.prototype.ResumeBtn()
            },
            {
                name: "Settings",
                func: () => PauseMenuLayer.prototype.SettingsBtn()
            },
            {
                name: "Exit",
                func: () => PauseMenuLayer.prototype.ExitBtn()
            }
        ];
        
        this.htmlBlock = document.createElement("div");
        this.htmlBlock.id = "PAUSE_SCREEN";
        this.htmlBlock.style.display = "none";
        document.body.appendChild(this.htmlBlock);

        var that = this;

        this.btns.forEach(ele => {
            const btn = document.createElement("div");
            btn.classList = "menu-item selectable";
            btn.style.fontSize = "1.5em";
            btn.innerHTML = ele.name;
            btn.onclick = (e) => ele.func();

            that.htmlBlock.appendChild(btn);
        });
    }

    Show()
    {
        super.Show();
        this.htmlBlock.style.display = "flex";
    }

    Hide()
    {
        super.Hide();
        this.htmlBlock.style.display = "none";
    }
}

////////////////////////////////////////////////////

let activeUIManager = new SPP.UIManager();

let gameUIlayer = new GameUILayer(activeUIManager, true);
let pauseMenuLayer = new PauseMenuLayer(activeUIManager);
let activeConsole = new SPP.GameConsole(activeUIManager);

gameUIlayer.Show();

////////////////////////////////////////////////////

PauseMenuLayer.prototype.ResumeBtn = function() { 
    pauseMenuLayer.ToggleLayer(); 
}

PauseMenuLayer.prototype.SettingsBtn = function() {
    
}

PauseMenuLayer.prototype.ExitBtn = function() {
   window.InvokeNative("MULTIPLAYER", "ExitGame");
   
   if(window.CallNativeWithJSON == null)
   {
        OnExitGame();
   }
}

////////////////////////////////////////////////////

function OnExitGame()
{
    window.location.href = "MainMenu.html";
}

// Execute a function when the user presses a key on the keyboard
document.onkeyup = function(evt) {
    evt = evt || window.event;
    
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    
    if(isEscape) {
        pauseMenuLayer.ToggleLayer();
    }
};