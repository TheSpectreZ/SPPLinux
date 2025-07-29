if (!window.InvokeNative) {
    window.InvokeNative = function (InFuncName, ...theArgs) {
        console.log("No Native Invoke: " + JSON.stringify({ func: InFuncName, args: theArgs }))
    }
}

let SceneOutlineInstance = {};

function InitializeSceneOutline(width, height)
{
    const Inst = {
        root: document.getElementById("SO_Root"),
        content: null,
        scene: null,
        contextMenu: null
    };

    Inst.root.style.width = width + "px";
    Inst.root.style.height = height + "px";

    const outlineDiv = document.createElement("div");
    Inst.root.appendChild(outlineDiv);
    Inst.content = outlineDiv;

    const Types = [ 
        {name: "VgSVVO", index: 0}, 
        {name: "VgSkinnedMeshElement", index: 0}, 
        {name: "VgSoundElement", index: 0},
        {name: "VgSoundListener", index: 0}
    ];

    const contextConfig = [
        {
            name: "Add",
            children: Types.map(value => ({
                name: value.name,
                fnc: function(event, args) {
                    const name = value.name + value.index
                    window.InvokeNative("EDITOR", `RequestAddElement ${value.name} ${name} ${args.parentName}`);
                }})
            ) 
        },
        {
            name: "Remove",
            fnc: function(event, args) {
                window.InvokeNative("EDITOR", `RequestRemoveElement ${args.parentName}`);
            }
        }
    ];

    Inst.contextMenu = CreateContextMenu(contextConfig, Inst.root);
    
    SceneOutlineInstance = Inst;
    window.InvokeNative(`RequestSceneOutline`);    
    
    // debug
    //PopulateSceneOutline(scene);
}
window["InitializeSceneOutline"] = InitializeSceneOutline;

function PopulateSceneOutline(InValue) {
    const root = SceneOutlineInstance.content;
    root.innerHTML = "";

    let JsonValue = typeof InValue == 'string' ? JSON.parse(InValue) : InValue;
    SceneOutlineInstance.scene = JsonValue;

    CreateSearchBar(root);
    let { label, type } = CreateHeaderBar(root);
    CreateOutlineUI(SceneOutlineInstance.scene, label, type);
}
window["PopulateSceneOutline"] = PopulateSceneOutline;

function ResizeSceneOutline(width, height) {
    SceneOutlineInstance.root.style.width = width + "px";
    SceneOutlineInstance.root.style.height = height + "px";
}
window["ResizeSceneOutline"] = ResizeSceneOutline;

function CreateSearchBar(parent) {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.padding = "4px";
    parent.appendChild(div);

    const Input = document.createElement("input");
    Input.style.width = "100%";
    Input.type = "text";
    Input.placeholder = "Search...";
    div.append(Input);

    const sbtn = document.createElement("button");
    sbtn.style.width = "30px";
    div.appendChild(sbtn);
    
    const sicon = document.createElement("i");
    sicon.classList.add("fa-solid");
    sicon.classList.add("fa-magnifying-glass");
    sbtn.appendChild(sicon);

    const cbtn = document.createElement("button");
    cbtn.style.width = "30px";
    div.appendChild(cbtn);

    const cicon = document.createElement("i");
    cicon.classList.add("fa-solid");
    cicon.classList.add("fa-x");
    cbtn.appendChild(cicon);

    sbtn.addEventListener("click", function(event) {
        if(Input.value.length <= 0)
            return;
        
        RemoveQuery();
        MakeQuery(Input.value);
    });

    cbtn.addEventListener("click", function(event){
        Input.value = "";
        RemoveQuery();
    });
}

function CreateHeaderBar(parent) {
    const container = document.createElement("div");
    container.style.display = "flex";
    parent.appendChild(container);

    let label = document.createElement("div");
    label.classList.add("SO-Col-Label");
    container.appendChild(label);

    let type = document.createElement("div");
    type.classList.add("SO-Col-Type");
    container.appendChild(type);

    CreateLabelTypeRow("Label", "Type", label, type, false, 0, true);

    return { label, type };
}

function CreateOutlineUI(Tree, label, type, Index = 0) {
    
    const Children = Tree["children"];

    const bMakeToggle = Children && Children.length > 0;
    
    const result = CreateLabelTypeRow(Tree["name"], Tree["type"], label, type, bMakeToggle, Index * 15);
    Tree["handler"] = { name: result.name, type: result.type };
    
    for(var i in Children)
    {
        var value = Children[i];
        CreateOutlineUI(value, result.nameContent, result.typeContent, Index + 1);
    }
}

function CreateLabelTypeRow(Name, Type, labelCol, typeCol, bMakeToggle = false, offset = 0, bHeader = false) {

    const nameContainer = document.createElement("div");
    nameContainer.classList.add("SO-NameContainer");
    nameContainer.style.paddingLeft = offset + "px";
    labelCol.appendChild(nameContainer);

    const nameContent = document.createElement("div");
    nameContent.classList.add("SO-Content");
    labelCol.append(nameContent);
    
    const tDiv = document.createElement("div");
    tDiv.classList.add("SO-Cell");
    tDiv.textContent = Type;
    typeCol.appendChild(tDiv);

    const typeContent = document.createElement("div");
    typeContent.classList.add("SO-Content");
    typeCol.append(typeContent);
    
    let toggle = null;

    if(bMakeToggle) 
    {
        toggle = document.createElement("div");
        toggle.classList.add("SO-Toggle");
        toggle.classList.toggle("activated");
        toggle.textContent = "▶";
        nameContainer.appendChild(toggle);

        toggle.addEventListener("click", function(event) {
            event.target.classList.toggle("activated");

            nameContent.classList.toggle("activated");
            typeContent.classList.toggle("activated");
        });

        nameContent.classList.toggle("activated");
        typeContent.classList.toggle("activated");
    }
    
    const nDiv = document.createElement("div");
    nDiv.classList.add("SO-Cell");
    nDiv.textContent = Name;
    nameContainer.appendChild(nDiv);
    
    if(bHeader)
    {
        nDiv.classList.add("SO-HeaderCell");
        tDiv.classList.add("SO-HeaderCell");
    }

    if(!bHeader)
    {
        nDiv.addEventListener("click", function(event){
            window.InvokeNative("RequestSceneProperty", `${Name}`);
        });

        nDiv.addEventListener("contextmenu", function(event){
            event.preventDefault();

            const ContextMenu = SceneOutlineInstance.contextMenu;
            ContextMenu.style.display = "block";
            ContextMenu.value.caller = Name;

            const divRect = SceneOutlineInstance.root.getBoundingClientRect();
            const menuRect = ContextMenu.getBoundingClientRect();

            let relativeX = event.clientX - divRect.left;
            let relativeY = event.clientY - divRect.top;

            if(relativeY > divRect.height - menuRect.height)
            {  
                relativeY = divRect.height - menuRect.height;
            }

            ContextMenu.style.left = relativeX + "px";
            ContextMenu.style.top = relativeY + "px";
        }); 
    }

    return { name: nameContainer, type: tDiv, nameContent: nameContent, typeContent: typeContent };
}

function MakeQuery(query) {

    function QueryTree(Tree) {
        
        const name = Tree["name"];
        if(!name.toLowerCase().startsWith(query.toLowerCase()))
        {   
            Tree["handler"].name.style.display = "none";
            Tree["handler"].type.style.display = "none";
        }

        for(const i in Tree["children"])
        {
            QueryTree(Tree["children"][i]);
        }
    }

    QueryTree(SceneOutlineInstance.scene);
}

function RemoveQuery() {
    function WalkTree(Tree) {
        Tree["handler"].name.style.display = "flex";
        Tree["handler"].type.style.display = "inline-flex";

        for(const i in Tree["children"])
        {
            WalkTree(Tree["children"][i]);
        }
    }

    WalkTree(SceneOutlineInstance.scene);
}

function CreateContextMenu(config, Root) {

    const div = document.createElement("div");
    div.value = { subMenus: [], caller: null };
    div.classList.add("SO-ContextMenuRoot");
    
    Root.appendChild(div);
    
    for(const i in config) 
    {
        const v = config[i];
        
        const opt = document.createElement("div");
        opt.classList.add("SO-ContextMenuItem");
        opt.textContent = v["name"];
        opt.value = { child: null };
        div.appendChild(opt);

        if(v["children"])
        {
            const menu = CreateContextMenu(v["children"], opt);
            opt.value.child = menu;
            div.value.subMenus.push(menu);
        }

        opt.addEventListener("click", function(event)
        {
            if(!v["fnc"])
                return;

            v["fnc"](event, { parentName: div.value.caller });
        });

        opt.addEventListener("mouseover", function(event) {

            div.value.subMenus.forEach(function(e){
                e.style.display = "none";
            })
            
            const menu = opt.value.child;
            if(!menu)
                return;
            
            menu.style.display = "block";
            menu.value.caller = div.value.caller;
            
            const optRect = opt.getBoundingClientRect();
            const relativeX = optRect.width + 2;
            let relativeY = -1.5;

            const rootRect = SceneOutlineInstance.root.getBoundingClientRect();
            const divRect = div.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();

            if(menuRect.height > rootRect.bottom - divRect.top)
            {
                relativeY = (rootRect.bottom - divRect.top) - menuRect.height - 1.5;
            }

            menu.style.left = relativeX + "px";
            menu.style.top = relativeY + "px";
        });
    }

    return div;
}

document.addEventListener("click", function(event) {
    
    function ResetMenu(menu) {
        menu.style.display = "none";
        menu.value.caller = null;

        menu.value.subMenus.forEach(function(e)
        {   
            ResetMenu(e);
        });
    }

    ResetMenu(SceneOutlineInstance.contextMenu);
});

const scene = {
	"children" : 
	[
		{
			"children" : 
			[
				{
					"children" : null,
					"name" : "NewScenePlayer",
					"type" : "VgSceneEditorClientPlayer"
				}
			],
			"name" : "Camera",
			"type" : "VgCameraElement"
		},
		{
			"children" : 
            [
                {
                    "children": [
                        {
                            "children": null,
                            "name": "Bullet",
                            "type": "VgBullet"
                        }
                    ],
                    "name": "Weapon",
                    "type": "VgWeapon"
                },
                {
                    "children": null,
                    "name": "Shied",
                    "type": "VgShield"
                }
            ],
			"name" : "SkinnedMesh",
			"type" : "VgSkinnedMeshElement"
		},
		{
			"children" : null,
			"name" : "svvo",
			"type" : "VgSVVO"
		}
	],
	"name" : "NewScene",
	"type" : "VgSceneEnvironment"
}