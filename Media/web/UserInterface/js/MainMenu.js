import * as SPP from "./SPP.js";

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
        console.log("Found: " + FuncName);
        fn.apply(null, Args);
    }
    else
    {
        console.log("NotFound: " + FuncName);
    }
}

window.ProcessJS = ProcessJS;

if (window.RegisterJS) {
    window.RegisterJS(ProcessJS);
}

class BackgroundLayer extends SPP.GameUILayer
{
    constructor(InManager) {
        super(InManager);

        this.backgroundImage = "img/Background.jpg";
        this.logoImage = "img/logo.png";

        this.htmlBlock = document.createElement("div");
        document.body.appendChild(this.htmlBlock);

        this.background = document.createElement("img");
        this.background.src = this.backgroundImage;
        this.background.style.backgroundSize = "cover";
        this.background.style.backgroundPosition = "center";
        this.background.style.position = "absolute";
        this.background.style.width = "100%";
        this.background.style.height = "100%";
        this.background.style.zIndex = "-1";

        this.htmlBlock.appendChild(this.background);
        
        this.logo = document.createElement("img");
        this.logo.src = this.logoImage;
        this.logo.style.position = "absolute";
        this.logo.style.width = "5%";
        this.logo.style.right = "20px";
        this.logo.style.bottom = "20px";
        this.logo.style.zIndex = "1";
        
        this.htmlBlock.appendChild(this.logo);
    }

    Show() {
        super.Show();
        this.htmlBlock.style.display = "block";
    }

    Hide() {
        super.Hide();
        this.htmlBlock.style.backgroundImage = "none";
    }

    Activate(bBlockInput = false) {
        super.Activate(bBlockInput);
        this.background.classList.remove("deactivated-background");
    }

    Deactivate(bBlockInput = false) {
        this.background.classList.add("deactivated-background");
        super.Deactivate(bBlockInput);
    }
}

class FooterLayer extends SPP.GameUILayer
{
    constructor(InManager) { 
        super(InManager);

        this.footerContainer = document.createElement("div");
        this.footerContainer.id = "FOOTER";
        this.footerContainer.style.display = "none";

        {
            this.backbtn = document.createElement("div");
            this.backbtn.classList = "menu-item selectable";
            this.backbtn.innerHTML = "Back";
            this.backbtn.onclick = (e) => { 
                this.Manager.Back();    
            };

            this.footerContainer.appendChild(this.backbtn);
        }

        document.body.appendChild(this.footerContainer);
    }

    Show() {
        super.Show();
        this.footerContainer.style.display = "flex";
    }

    Hide() {
        super.Hide();
        this.footerContainer.style.display = "none";
    }
}

class TitleLayer extends SPP.GameUILayer
{
    constructor(InManager) {
        super(InManager);

        this.htmlBlock = document.createElement("div");
        this.htmlBlock.id = "MAIN_TITLE";
        this.htmlBlock.innerHTML = "Joy Squad";
        this.htmlBlock.style.display = "none";
            
        document.body.appendChild(this.htmlBlock);
    }

    Show() {
        super.Show();
        this.htmlBlock.style.display = "flex";
    }

    Hide() {
        super.Hide();
        this.htmlBlock.style.display = "none";
    }

    Activate(bBlockInput = false) {
        super.Activate(bBlockInput);
        this.htmlBlock.classList.remove("deactivated-ui");
    }

    Deactivate(bBlockInput = false) {
        this.htmlBlock.classList.add("deactivated-ui");
        super.Deactivate(bBlockInput);
    }
}

class MainMenuLayer extends SPP.GameUILayer
{
    constructor(InManager) 
    {
        super(InManager);
        this.bIsShown = false;
        
        this.container = document.createElement("div");
        this.container.classList = "menu-container";
        this.container.style.display = "none";

        this.buttons = [];

        this.buttons[0] = document.createElement("div");
        this.buttons[0].innerHTML = "Play";
        this.buttons[0].classList = "menu-item selectable";
        this.buttons[0].onclick = (e) => { if(this.bActive) MainMenuLayer.prototype.Play(); };
        
        this.buttons[1] = document.createElement("div");
        this.buttons[1].innerHTML = "Options";
        this.buttons[1].classList = "menu-item selectable";
        this.buttons[1].onclick = (e) => { if(this.bActive) MainMenuLayer.prototype.Options(); };
        
        this.buttons[2] = document.createElement("div");
        this.buttons[2].innerHTML = "Quit";
        this.buttons[2].classList = "menu-item selectable";
        this.buttons[2].onclick = (e) => { if(this.bActive) MainMenuLayer.prototype.Quit(); };
        
        this.container.appendChild(this.buttons[0]); 
        this.container.appendChild(this.buttons[1]);
        this.container.appendChild(this.buttons[2]);
        
        document.body.appendChild(this.container);
    }

    Show() {
        super.Show();
        this.container.style.display = "flex";
    }

    Hide() {
        super.Hide();
        this.container.style.display = "none";
    }

    Activate(bBlockInput = false) {
        super.Activate(bBlockInput);
        
        this.buttons.forEach(button => {
            button.classList.add("selectable");
        });

        this.container.classList.remove("deactivated-ui");
    }

    Deactivate(bBlockInput = false) {
        
        this.container.classList.add("deactivated-ui");

        this.buttons.forEach(button => {
            button.classList.remove("selectable");
        });
        
        super.Deactivate(bBlockInput);
    }
    
    RequireTitle() {
        return true;
    }
}

class QuitMenuLayer extends SPP.GameUILayer
{
    constructor(InManager, bActive = true) {
        super(InManager);
        this.bIsShown = false;

        this.htmlBlock = document.createElement("div");
        this.htmlBlock.id = "QUIT_SCREEN";
        this.htmlBlock.style.display = "none";

        {
            const div = document.createElement("div");
            div.classList = "menu-item";
            div.innerHTML = "Are you sure you want to quit?";
            this.htmlBlock.appendChild(div);
        }

        {
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.flexDirection = "row";
            div.style.marginTop = "20px";
            this.htmlBlock.appendChild(div);

            const yesButton = document.createElement("div");
            yesButton.classList = "menu-item selectable";
            yesButton.style.marginRight = "75px";
            yesButton.innerHTML = "Yes";
            yesButton.onclick = (e) => QuitMenuLayer.prototype.QuitGame();
            div.appendChild(yesButton);
            
            const noButton = document.createElement("div");
            noButton.classList = "menu-item selectable";
            noButton.style.marginLeft = "75px";
            noButton.innerHTML = "No";
            noButton.onclick = (e) => { this.Deactivate(true); this.Hide(); };
            div.appendChild(noButton);
        }
        
        document.body.appendChild(this.htmlBlock);
    }

    Show() {
        super.Show();
        this.htmlBlock.style.display = "flex";
    }

    Hide() {
        super.Hide();
        this.htmlBlock.style.display = "none";
    }

    Activate(bBlockInput = false) {
        super.Activate(bBlockInput);
    }

    Deactivate(bBlockInput = false) {
        super.Deactivate(bBlockInput);
    }
}

class PlayMenuLayer extends SPP.GameUILayer
{
    constructor(InManager) {
        super(InManager);
        this.bIsShown = false;

        this.htmlBlock = document.createElement("div");
        this.htmlBlock.id = "PLAY_MENU";
        this.htmlBlock.style.display = "none";
        
        const title = document.createElement("div");
        title.id = "PLAY_MENU_TITLE";
        title.innerHTML = "Multiplayer";
        title.classList = "menu-item";
        title.style.textDecoration = "underline";

        this.htmlBlock.appendChild(title);
        
        this.content = document.createElement("div");
        {
            this.buttons = [];
        
            this.buttons[0] = document.createElement("div");
            this.buttons[0].classList = "menu-item selectable";
            this.buttons[0].innerHTML = "Join Game";
            this.buttons[0].style.fontSize = "2em";
            this.buttons[0].onclick = function(e) { PlayMenuLayer.prototype.JoinGame(); }
            
            this.buttons[1] = document.createElement("div");
            this.buttons[1].classList = "menu-item selectable";
            this.buttons[1].innerHTML = "Available Servers";
            this.buttons[1].style.fontSize = "2em";
            this.buttons[1].onclick = function(e) { PlayMenuLayer.prototype.FetchServerList(); };
            
            this.content.appendChild(this.buttons[0]);
            this.content.appendChild(this.buttons[1]);
        }
        this.htmlBlock.appendChild(this.content);
        
        document.body.appendChild(this.htmlBlock);
    }

    Show() {
        super.Show();
        this.htmlBlock.style.display = "flex";
    }

    Hide() {
        super.Hide();
        this.htmlBlock.style.display = "none";
    }

    RequireFooter() {
        return true;
    }

    RequireTitle() {
        return true;
    }
}

class ServerListMenuLayer extends SPP.GameUILayer
{
    constructor(InManager) {
        super(InManager);

        this.htmlBlock = document.createElement("div");
        this.htmlBlock.id = "CUSTOM_GAME_MENU";
        this.htmlBlock.style.display = "none";
        
        const title = document.createElement("div");
        title.id = "CUSTOM_GAME_MENU_TITLE";
        title.innerHTML = "Servers";
        title.classList = "menu-item";
        title.style.textDecoration = "underline";
        this.htmlBlock.appendChild(title);
        
        this.content = document.createElement("div");
        this.content.id = "CUSTOM_GAME_MENU_CONTENT";
        this.htmlBlock.appendChild(this.content);
        
        document.body.appendChild(this.htmlBlock);
    }

    Initialize(InJson) {
        var that = this;

        let json = JSON.parse(InJson);
        json["servers"].forEach(element => 
        {
            const div = document.createElement("div");
            div.innerHTML = element.name;
            div.classList = "menu-item selectable";
            div.style.fontSize = "1.5em";
            div.onclick = function(e) { ServerListMenuLayer.prototype.JoinServer(element); }

            that.content.appendChild(div);
        });
    }

    Show() {
        super.Show();
        this.htmlBlock.style.display = "flex";
    }

    Hide() {
        super.Hide();
        this.htmlBlock.style.display = "none";
    }

    RequireFooter() {
        return true;
    }

    RequireTitle() {
        return true;
    }
}

//////////////

let activeUIManager = new SPP.UIManager();

let backgroundLayer = new BackgroundLayer(activeUIManager);
let titleLayer      = new TitleLayer(activeUIManager);
let footerLayer     = new FooterLayer(activeUIManager);
let mainMenu        = new MainMenuLayer(activeUIManager);
let quitMenu        = new QuitMenuLayer(activeUIManager);
let playMenu        = new PlayMenuLayer(activeUIManager);
let optionsMenu     = new SPP.OptionsMenuScreen(activeUIManager);
let serverlistMenu  = new ServerListMenuLayer(activeUIManager);

backgroundLayer.Show();
titleLayer.Show();
mainMenu.Show();

//////////////

SPP.GameUILayer.prototype.GetFooter = function() { return footerLayer; }
SPP.GameUILayer.prototype.GetTitle  = function() { return titleLayer; }

QuitMenuLayer.prototype.QuitGame = function() { window.close(); }

MainMenuLayer.prototype.Play    = function() { mainMenu.NavigateTo(playMenu); }
MainMenuLayer.prototype.Options = function() { mainMenu.NavigateTo(optionsMenu); }
MainMenuLayer.prototype.Quit    = function() { quitMenu.Show(); quitMenu.Activate(true); }

PlayMenuLayer.prototype.JoinGame = function() { 
    window.InvokeNative("MULTIPLAYER", "JoinGame");

    if(window.CallNativeWithJSON == null)
    {
        OnJoinGame();
    }
}

PlayMenuLayer.prototype.FetchServerList  = function() { 
    window.InvokeNative("MULTIPLAYER", "FetchServerList");
    
    if(window.CallNativeWithJSON == null)
    {
        PopulateServerList(JSON.stringify(ServerJson));
    }
}

//////////////

function PopulateServerList(JsonString)
{
    console.log(JsonString);
    
    serverlistMenu.Initialize(JsonString);
    playMenu.NavigateTo(serverlistMenu);
}
window["PopulateServerList"] = PopulateServerList;

function OnJoinGame()
{
    window.location.href = "GameUI.html";
}

//////////////

document.addEventListener('DOMContentLoaded', (event) => {

    if(window.CallNativeWithJSON == null)
    {
        optionsMenu.Initialize(JSON.stringify(SettingsJson));
    } 
});

var SettingsJson = {
    Tabs: [ 
        "Gameplay", 
        "Controls",
        "Interface", 
        "Display",
        "Audio",
        "Language",
    ],
    Content: [
        {
            name: "Gameplay",
            Group: [
                {
                    name: "Accessibility",
                    Items: [
                        {
                            name: "Text Language"
                        },
                        {
                            name: "Enemy Highlight Color"
                        }
                    ]
                },
                {
                    name: "Mouse",
                    Items: [
                        {
                            name: "Sensitivity: Aim"
                        },
                        {
                            name: "Sensitivity: Scope"
                        },
                        {
                            name: "Invert Mouse"
                        }
                    ]
                }
            ]
        },
        {
            name: "Controls",
            Group: [
                {
                    name: "Movement",
                    Items: [
                        {
                            name: "Forward"
                        },
                        {
                            name: "Backward"
                        },
                        {
                            name: "Left"
                        },
                        {
                            name: "Right"
                        }
                    ]
                },
                {
                    name: "Combat",
                    Items: [
                        {
                            name: "Attack"
                        },
                        {
                            name: "Block"
                        },
                        {
                            name: "Magic"
                        }
                    ]
                }
            ]
        },
        {
            name: "Audio",
            Items: [
                {
                    name: "Music"
                },
                {
                    name: "SFX"
                }
            ]
        },
        {
            name: "Display",
            Items: [
                {
                    name: "Resolution"
                },
                {
                    name: "Fullscreen"
                }
            ]
        }
    ]
};

var ServerJson = {
	"servers" : 
	[
		{
			"name" : "Phantom",
            "addr" : "172.17.82.166",
            "port": "4100"
		}
	]
}