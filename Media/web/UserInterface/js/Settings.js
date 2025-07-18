import { GameUILayer } from "./UILayer.js";

document.head.innerHTML += `<link rel="stylesheet" type="text/css" href="css/Settings.css">`;

export class OptionsMenuScreen extends GameUILayer 
{
    constructor(InManager) {
        super(InManager);
        this.bIsShown = false;
        
        this.htmlBlock = document.createElement("div");
        this.htmlBlock.style.display = "none";
        this.htmlBlock.id = "OptionsMenuScreen";
        
        {
            this.TabContainer = document.createElement("div");
            this.TabContainer.classList = "settings-tab-container";
            
            this.htmlBlock.appendChild(this.TabContainer);
        }

        {
            this.ContentContainer = document.createElement("div");
            this.ContentContainer.classList = "settings-content-container";
            
            this.htmlBlock.appendChild(this.ContentContainer);
        }

        document.body.appendChild(this.htmlBlock);

        this.TabIdMap = [];

        this.TabButtons = {};
        this.TabContent = {};
    }

    Initialize(InJson) {
        var JsonObj = JSON.parse(InJson);
        
        this.TabContainer.innerHTML = "";
        this.ContentContainer.innerHTML = "";

        var that = this;

        JsonObj.Tabs.forEach(function(JsonEle)
			{
				var listItem = document.createElement("div");
				listItem.className = "settings-tab-title";
				listItem.innerHTML = JsonEle;
				listItem.id = JsonEle;
				listItem.onclick = function() { that.ToggleTab(JsonEle); };
                
                that.TabIdMap.push(JsonEle);
                that.TabButtons[JsonEle] = listItem;
				that.TabContainer.appendChild(listItem);
			});
            
        JsonObj.Content.forEach(function(JsonEle)
        {
            var listItem = document.createElement("div");
            listItem.className = "settings-content";
            listItem.id = JsonEle.name;
            listItem.style.display = "none";

            if(JsonEle.Group != null)
            {
                JsonEle.Group.forEach(function(Group)
                {
                    var group = document.createElement("div");
                    group.className = "settings-item-section-title";
                    group.innerHTML = Group.name;
                
                    listItem.appendChild(group);
                
                    Group.Items.forEach(function(Item)
                    {
                        var item = document.createElement("div");
                        item.className = "settings-tab-item";
                        item.innerHTML = Item.name;
                    
                        listItem.appendChild(item);
                    });
                });
            }
        
            if(JsonEle.Items != null)
            {
                JsonEle.Items.forEach(function(Item)
                {
                    var item = document.createElement("div");
                    item.className = "settings-tab-item";
                    item.innerHTML = Item.name;
                
                    listItem.appendChild(item);
                });
            }

            that.TabContent[JsonEle.name] = listItem;
            that.ContentContainer.appendChild(listItem);
        });

        {
            var listItem = document.createElement("div");
            listItem.className = "settings-tab-title";
            listItem.innerHTML = "Reset";
            listItem.id = "Reset";
            listItem.onclick = function() { that.ToggleTab("Reset"); };
            
            this.TabButtons["Reset"] = listItem;
            this.TabContainer.appendChild(listItem);

            var contentItem = document.createElement("div");
            contentItem.classList = "settings-content";
            contentItem.style.display = "none";
            contentItem.style.justifyContent = "center";
            contentItem.style.alignItems = "center";
            
            var ResetText = document.createElement("div");
            ResetText.className = "settings-item-section-title";
            ResetText.innerHTML = "Are you sure you want to reset all settings?";
            ResetText.style.fontSize = "2.2em";
            ResetText.style.textShadow = "3px 3px 3px black";
            contentItem.appendChild(ResetText);

            var BtnContainer = document.createElement("div");
            BtnContainer.style.display = "flex";
            BtnContainer.style.justifyContent = "center";
            
            var YesBtn = document.createElement("div");
            YesBtn.className = "settings-tab-item";
            YesBtn.innerHTML = "Yes";
            YesBtn.style.fontSize = "3em";
            YesBtn.style.margin = "10px";
            YesBtn.onclick = function() { 
                that.ResetSettings();
            };

            var NoBtn = document.createElement("div");
            NoBtn.className = "settings-tab-item";
            NoBtn.innerHTML = "No";
            NoBtn.style.fontSize = "3em";
            NoBtn.style.margin = "10px";
            NoBtn.onclick = function() {
                that.ToggleTab(that.TabIdMap[0]);
            }

            BtnContainer.appendChild(YesBtn);
            BtnContainer.appendChild(NoBtn);

            contentItem.appendChild(BtnContainer);

            this.TabContent["Reset"] = contentItem;
            this.ContentContainer.appendChild(contentItem);
        }

        this.ToggleTab(this.TabIdMap[0]);
    }

    ToggleTab(InTabName) {
        for(var key in this.TabContent)
        {
            var tab     = this.TabButtons[key];
            var content = this.TabContent[key];

            if(key == InTabName)
            {
                tab.classList.add("selected");
                content.style.display = "flex";
            }
            else
            {
                tab.classList.remove("selected");
                content.style.display = "none";
            }   
        }
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

    ResetSettings() {
        this.ToggleTab(this.TabIdMap[0]);
    }
}