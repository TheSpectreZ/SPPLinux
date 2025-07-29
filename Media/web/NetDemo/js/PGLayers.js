import { ToggleableUILayer } from "../js/UIManager.js";

export class BackgroundLayer extends ToggleableUILayer
{   
    constructor(InManager)
    {
        super(InManager);

        this.htmlBlock = document.createElement("div");
        this.htmlBlock.style.display = "none";
        
        {
            this.title = document.createElement("div");
            this.title.style.position = "absolute";
            this.title.style.top = "20px";
            this.title.style.left = "60px";
            this.title.style.fontSize = "8em";
            this.title.style.textShadow = "6px 6px 6px black";
            this.title.style.color = "#c40b08";
            
            this.htmlBlock.appendChild(this.title);  
        }

        {
            this.background = document.createElement("img");
            this.background.style.backgroundSize = "cover";
            this.background.style.backgroundPosition = "center";
            this.background.style.position = "absolute";
            this.background.style.width = "100%";
            this.background.style.height = "100%";
            this.background.style.zIndex = "-1";

            this.htmlBlock.appendChild(this.background);
        }

        {
            this.logo = document.createElement("img");
            this.logo.style.position = "absolute";
            this.logo.style.width = "5%";
            this.logo.style.right = "20px";
            this.logo.style.bottom = "20px";
            this.logo.style.zIndex = "1";

            this.htmlBlock.appendChild(this.logo);
        }

        document.body.appendChild(this.htmlBlock);
    }

    SetTitle(TitleStr)
    {
        this.title.innerHTML = TitleStr;
        return this.title;
    }

    SetBackgroundImage(ImageURL)
    {
        this.background.src = ImageURL;
        return this.background;
    }

    SetLogoImage(LogoURL)
    {
        this.logo.src = LogoURL;
        return this.logo;
    }

    ToggleBackground()
    {
        if(this.background.style.display == "none")
            this.background.style.display = "block";
        else
            this.background.style.display = "none";
    }
    
    ToggleLogo()
    {
        if(this.logo.style.display == "none")
            this.logo.style.display = "block";
        else
            this.logo.style.display = "none";
    }

    Show()
    {
        super.Show();
        this.htmlBlock.style.display = "block";
    }

    Hide()
    {
        super.Hide();
        this.htmlBlock.style.display = "none";
    }
}

export class FloatingContainerLayer extends ToggleableUILayer
{
    constructor(InManager, InStyleTop, InStyleLeft, InContainerType, InMouseLock = false)
    {
        super(InManager, InMouseLock);

        this.buttons = [];

        this.htmlBlock = document.createElement("div");
        this.htmlBlock.classList = `${InContainerType}-container fs3em`;
        this.htmlBlock.style.position = "absolute";
        this.htmlBlock.style.top = InStyleTop;
        this.htmlBlock.style.left = InStyleLeft;
        this.htmlBlock.style.margin = "10px";
        this.htmlBlock.style.justifyContent = "flex-start";

        document.body.appendChild(this.htmlBlock);
    }

    AddButton(label, func)
    {
        const div = document.createElement("div");
        div.classList = "container-item selectable";
        div.innerHTML = label;
        div.onclick = (e) => func();
        
        this.htmlBlock.appendChild(div);
        this.buttons.push(div);

        return div;
    }

    Show()
    {
        super.Show();
        this.htmlBlock.classList.remove("hidden");
    }

    Hide()
    {
        super.Hide();
        this.htmlBlock.classList.add("hidden");
    }

    OnActivate()
    {
        this.buttons.forEach(btn => {
            btn.classList.add("selectable");
        });
    }

    OnDeactivate()
    {
        this.buttons.forEach(btn => {
            btn.classList.remove("selectable");
        });
    }
}

export class FooterLayer extends FloatingContainerLayer
{
    constructor(InManager)
    {
        super(InManager, null, "53px", "row");
        this.htmlBlock.style.bottom = "0px";
    }
}