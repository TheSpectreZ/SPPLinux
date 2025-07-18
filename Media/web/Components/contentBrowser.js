/*
            document.getElementById("file").addEventListener("click", async function(){
            	
                const folderHandle = await window.showDirectoryPicker();
            	
                    for await (const entry of folderHandle.values()) {
                    console.log(entry.kind, entry.name);
                    }
            });
            */



const DIV = {};
DIV["Root"] = document.getElementById("CB_Root");
DIV["Files"] = document.getElementById("CB_Files");
DIV["Navbar"] = document.getElementById("CB_Navbar");
DIV["Content"] = document.getElementById("CB_Content");

DIV["Content"].addEventListener('dragover', function (e) {
    e.preventDefault();
});

DIV["Content"].addEventListener('drop', function (e) {
    e.preventDefault();

    console.log("DROP DETECTED");
    /*
    var file = e.dataTransfer.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
        // only allow image files
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    var mime_type = file.type;

    if (
        mime_type != 'image/png' &&
        mime_type != 'image/jpeg' &&
        mime_type != 'image/jpg'
    ) {
        alert('Only PNG, JPEG, and JPG files are allowed.');
        return;
    }

    img.onload = function () {
        scaleFactor = 1.0;
        canvas.style.width = img.width * scaleFactor + 'px';
        canvas.style.height = img.height * scaleFactor + 'px';
        canvas.width = img.width;
        canvas.height = img.height;
        //canvas.style.borderRadius = '10px';
        ctx.drawImage(img, 0, 0);
    };
    // show coords
    document.getElementById('coords').style.display = 'inline-block';
    */
});

DIV["Content-Context"] = document.getElementById("CB_Content_Context");
DIV["Tile-Context"] = document.getElementById("CB_Tile_Context");

let CURRENT_DIRECTORY = null;
var DIRECTORY_TREE = {};

let CallNative = {
    ContentBrowserReady: null,
    DoImport: null,
    SetActiveContainer: null,
    LoadAsset: null,
    AssetSelected: null,
    ContextMenu_NewFolder: null,
    ContextMenu_Delete: null,
};

function MakeIntoNativeCaller(InObj) {
    for (const [key, value] of Object.entries(InObj)) {
        InObj[key] = function (...theArgs) {
            window.InvokeNative(key, ...theArgs);
        }
    }
}

MakeIntoNativeCaller(CallNative);

// TODO: Find more Icons
const ICON = {};
ICON["FOLDER"] = "./../Icons/folder-solid.svg";
ICON["FILE"]   = "./../Icons/file-solid.svg";
ICON["skj"]    = "./../Icons/cube-solid.svg";
ICON["spj"]    = "./../Icons/mountain-sun-solid.svg";
ICON["wav"]    = "./../Icons/volume-high-solid.svg";
ICON["pcs"]    = "./../Icons/cloud-meatball-solid.svg";
ICON["vxs"]    = "./../Icons/voxel-solid.svg";
ICON["py"]     = "./../Icons/python.svg";

// TODO: Configure this ..
const COLOR = {};
COLOR["FOLDER"] = "rgb(255, 150, 0)"
COLOR["FILE"]   = "rgb(213 125 255)"
COLOR["skj"]    = "rgb(255, 255, 255)"
COLOR["spj"]    = "rgb(255, 255, 255)"
COLOR["wav"]    = "rgb(255, 0, 0)"
COLOR["pcs"]    = "rgb(125, 105, 105)"
COLOR["vxs"]    = "rgb(255, 255, 255)"
COLOR["py"]     = "rgb(25, 255, 55)"
COLOR["blend"]  = "rgb(0, 100, 255)"

COLOR["png"] = "rgb(50, 250, 0)"
COLOR["jpg"] = "rgb(50, 250, 0)"
COLOR["ktx2"] = "rgb(50, 250, 0)"
COLOR["dds"] = "rgb(50, 250, 0)"

//function ToggleContentDiv(CurrentID) {
//    CURRENT_DIRECTORY = DIRECTORY_TREE[CurrentID];

//    for (var key in FILE_DIV) {
//        FILE_DIV[key].style.display = "none";
//    }

//    FILE_DIV[FileMapID].style.display = "flex";
//}

//document.getElementById("CB_BackButton").addEventListener("click", function() {

//    if (!CURRENT_DIRECTORY)
//        return;

//    const Index = CURRENT_DIRECTORY.lastIndexOf("/");
//    if (Index == -1)
//        return;

//    const DIR = CURRENT_DIRECTORY.slice(0, Index);

//    ToggleContentDiv(DIR);
//});

let currentSelectedFolder = 0;

function GetEntryPath(InEntry) {
    let outPath = InEntry.name;
    while (InEntry.parentID >= 0) {        
        InEntry = DIRECTORY_TREE[InEntry.parentID];
        outPath = InEntry.name + "/" + outPath;
    }
    return outPath;
}

function CreateFileTile(InEntry)
{
    const div = document.createElement("div");
    div.classList.add("Content-Tile");

    {
        const thumbnail = document.createElement("div");
        thumbnail.classList.add("Tile-Thumbnail");

        const loadedDiv = document.createElement("div");
        loadedDiv.classList.add("Tile-Loaded");
        thumbnail.appendChild(loadedDiv);

        const dirtyDiv = document.createElement("div");
        dirtyDiv.classList.add("Tile-Dirty");
        thumbnail.appendChild(dirtyDiv);

        const image = document.createElement("img");
        image.classList.add("Tile-Icon");
        image.src = ICON["FILE"];
        thumbnail.appendChild(image);
        
        thumbnail.style.borderColor = COLOR["FILE"];

        div.appendChild(thumbnail);
    }

    const meta = document.createElement("div");
    meta.classList.add("Tile-Meta");
    meta.innerHTML = InEntry.name;
   
    div.appendChild(meta);

    let entryPath = GetEntryPath(InEntry);

    div.addEventListener("click", function (event) 
    {
        const divs = document.querySelectorAll(".Tile-Selected");
        divs.forEach(function (div) 
        {
            div.classList.toggle("Tile-Selected");
        });
        this.classList.toggle("Tile-Selected");

        CallNative.AssetSelected(entryPath);
    });

    div.addEventListener("contextmenu", function (event) 
    {
        console.log("contextmenu eventttttt");
        event.preventDefault();
    });

    div.addEventListener("dblclick", function (event) 
    {
        CallNative.LoadAsset(entryPath);
    });

    return div;
}

function CreateFolderTile(InEntry)
{
    const div = document.createElement("div");
    div.classList.add("Content-Tile");

    {
        const thumbnail = document.createElement("div");
        thumbnail.classList.add("Tile-Thumbnail");

        const image = document.createElement("img");
        image.classList.add("Tile-Icon");
        image.src = ICON["FOLDER"];
        thumbnail.appendChild(image);
        
        thumbnail.style.borderColor = COLOR["FOLDER"];

        div.appendChild(thumbnail);
    }


    const meta = document.createElement("div");
    meta.classList.add("Tile-Meta");
    meta.innerHTML = InEntry.name;

    div.appendChild(meta);

    let entryPath = GetEntryPath(InEntry);

    div.addEventListener("click", function (event)
    {
        const divs = document.querySelectorAll(".Tile-Selected");
        divs.forEach(function (div)
        {
            div.classList.toggle("Tile-Selected");
        });
        this.classList.toggle("Tile-Selected");
    });

    div.addEventListener("contextmenu", function (event)
    {
        console.log("contextmenu eventttttt");
        event.preventDefault();
    });

    div.addEventListener("dblclick", function (event)
    {
        $('#CB_DirTreView').jstree().select_node(InEntry.ID); 
    });

    return div;
}

function UpdateActiveFolder() {
    let curDirectory = DIRECTORY_TREE[currentSelectedFolder];
    DIV["Content"].innerHTML = "";

    curDirectory.children.forEach((curElement) => {
        
        if(curElement.typeID == 1)
        {
            DIV["Content"].appendChild(CreateFolderTile(curElement));
        }
    });
    
    curDirectory.children.forEach((curElement) => {
        
        if(curElement.typeID != 1)
        {
            DIV["Content"].appendChild(CreateFileTile(curElement));
        }
    });
}

function SelectFolder(nodeId)
{
    var currentSelected = Number(nodeId);
    console.log("Selected Folder: " + currentSelected);

    currentSelectedFolder = currentSelected;
    CallNative.SetActiveContainer(nodeId);

    UpdateActiveFolder();
}

function AddEntry(InParentID, InID, InName, InTypeID) {

    let curElement = { parentID: InParentID, ID: InID, name: InName, typeID: InTypeID, children: [] };

    if (InParentID >= 0) {
        DIRECTORY_TREE[InParentID].children.push(curElement);
    }

    DIRECTORY_TREE[InID] = curElement;

    UpdateActiveFolder();
}

function JsTreeContextMenu(node) {
   
    var items = {
        "NewFolder": {
            "label": "New Folder",
            "icon": "fas fa-folder-plus",
            "action": function (obj) {
                console.log("New Folder");
            }
        },
        "Rename": {
            "label": "Rename",
            "icon": "fas fa-pencil-alt",
            "action": function (obj) {
                console.log("Rename");
            }
        },
        "Copy": {
            "label": "Copy",
            "icon": "fas fa-copy",
            "action": function (obj) {
                console.log("Copy");
            }
        },
        "Cut": {
            "label": "Cut",
            "icon": "fas fa-cut",
            "action": function (obj) {
                console.log("Cut");
            }
        },
        "OpenInExplorer": {
            "label": "Open Folder in File Explorer",
            "icon": "fas fa-folder-open",
            "action": function (obj) {
                console.log("Open in File Explorer");
            }
        },
        "Delete": {
            "label": "Delete",
            "icon": "fas fa-trash",
            "action": function (obj) {
                console.log("Delete");
            }
        },
    };

    return items;
};

function GenerateDirectoryTree(InJSONData) {

    let FlatArray = JSON.parse(InJSONData);

    DIRECTORY_TREE = {};
    DIRECTORY_TREE[0] = { parentID: -1, ID: 0, name: "ROOT", typeID: 1, children: [] };

    var jsTreeDataArray = [];
    //jsTreeDataArray.push({
    //    "id": 0, // required
    //    "parent": "#", // required
    //    "text": "ASSETS", // node text
    //    // icon: iconStr // string for custom                
    //});

    FlatArray.forEach((curElement) => {

        var IDStr = String(curElement.ID);
        var parentIDStr = (curElement.parentID) >= 0 ? String(curElement.parentID) : "#";
        var iconStr = "F";
        // setup a folder
        if (curElement.typeID == 1) {
            iconStr = "D";
        }

        curElement.children = [];

        if (curElement.parentID >= 0) {
            DIRECTORY_TREE[curElement.parentID].children.push(curElement);
        }
        
        DIRECTORY_TREE[curElement.ID] = curElement;
        
        // Alternative format of the node (id & parent are required)
        if (curElement.typeID == 1) {
            jsTreeDataArray.push({
                "id": IDStr, // required
                "parent": parentIDStr, // required
                "text": curElement.name, // node text
                // icon: iconStr // string for custom          
            });
        }
    });

    if(DIV["Directories"])
    {
        DIV["Directories"].remove();
    }

    DIV["Directories"] = document.createElement("div");
    DIV["Directories"].id = "CB_DirTreView";

    document.getElementById("CB_Directories").appendChild(DIV["Directories"]);
    
    $('#CB_DirTreView').jstree({
        'core': {
            "multiple": false,
            "animation": 0,
            'data': jsTreeDataArray
        },
        'plugins': ["contextmenu"],
        'contextmenu': {
            "items": JsTreeContextMenu
        }
    });

    $('#CB_DirTreView').jstree().set_theme("default-dark", "./../Dependencies/jstree/themes/default-dark/styleSPP.css")
    $('#CB_DirTreView').jstree().hide_dots()
    
    function OnJSTreeChanged(event, data) {
        SelectFolder(data.node.id);
    }

    $('#CB_DirTreView').on("changed.jstree", OnJSTreeChanged);
}

function PopulateEngineEnumData(jsonEnumData) {
    const enumData = JSON.parse(jsonEnumData);
    for (const element of enumData) {
        //window.enumMap[element.name] = element.values;
        let newEnum = new Enum(element.name, ...element.values);
    }
}

//jstree format
// Alternative format of the node (id & parent are required)
//{
//    id: "string" // required
//    parent: "string" // required
//    text: "string" // node text
//    icon: "string" // string for custom
//    state: {
//        opened: boolean  // is the node open
//        disabled: boolean  // is the node disabled
//        selected: boolean  // is the node selected
//    },
//    li_attr: { }  // attributes for the generated LI node
//    a_attr: { }  // attributes for the generated A node
//}

let ActivePanel = null;

function DoImportPopUp(InJSONData) {

    console.log("func" + InJSONData);

    if (ActivePanel == null) {

        const newPanelFrame = document.createElement("div");
        newPanelFrame.className = 'ImporterPanel';
        newPanelFrame.id = "ImportDialog";
        ActivePanel = new PropertyPanel(newPanelFrame);
        ActivePanel.SetJSONProperties(InJSONData);

        const newOKBtn = document.createElement("button");
        const newCancelBtn = document.createElement("button");

        newOKBtn.innerHTML = "OK";
        newCancelBtn.innerHTML = "Cancel";

        newOKBtn.addEventListener("click", function () {
            window.InvokeNative("DoImport", ActivePanel.GetJSON());
            // $("#ImportDialog").dialog(); makes a new parent node for this
            document.body.removeChild(newPanelFrame.parentNode)
            ActivePanel = null;
        });

        newCancelBtn.addEventListener("click", function () {
            window.InvokeNative("DoImport", "");
            // $("#ImportDialog").dialog(); makes a new parent node for this
            document.body.removeChild(newPanelFrame.parentNode)
            ActivePanel = null;
        });

        newPanelFrame.appendChild(newOKBtn);
        newPanelFrame.appendChild(newCancelBtn);

        document.body.appendChild(newPanelFrame);

        $(function () {
            $("#ImportDialog").dialog();
        });

        /*
        $("button").each(function (element) {
            $( this ).button();
        });
        */

        //$("select").each(function (element) {
          //  $(this).selectmenu();
        //});
    }
}

window["DoImportPopUp"] = DoImportPopUp;
window["GenerateDirectoryTree"] = GenerateDirectoryTree;
window["PopulateEngineEnumData"] = PopulateEngineEnumData;
window["AddEntry"] = AddEntry;

CallNative.ContentBrowserReady();

if(false)
{
    const TestImageImport = {
        "properties" : 
        {
            "UsesMipMaps" : 
            {
                "Ctype" : "bool",
                "type" : "number",
                "value" : true
            },
            "height" : 
            {
                "Ctype" : "int",
                "type" : "number",
                "value" : 128
            },
            "name" : 
            {
                "Ctype" : "std::string",
                "type" : "string",
                "value" : "color-noise"
            },
            "sourceFormat" : 
            {
                "Ctype" : "TextureFormat",
                "type" : "string",
                "value" : "RGBA_8888"
            },
            "usageFormat" : 
            {
                "Ctype" : "TextureFormat",
                "type" : "string",
                "value" : "RGBA_8888"
            },
            "width" : 
            {
                "Ctype" : "int",
                "type" : "number",
                "value" : 128
            }
        }
    };

    DoImportPopUp(JSON.stringify(TestImageImport));
}

if(false)
{
    const DirectoryTreeInfoOLD = [
        {
            "ID" : 0,
            "name" : "ASSETS",
            "parentID" : -1,
            "typeID" : 1
        },
        {
            "ID" : 1,
            "name" : "arena",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 2,
            "name" : "collisionarena",
            "parentID" : 1,
            "typeID" : 2
        },
        {
            "ID" : 3,
            "name" : "meshes",
            "parentID" : 1,
            "typeID" : 1
        },
        {
            "ID" : 4,
            "name" : "cube.001.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 5,
            "name" : "cube.002.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 6,
            "name" : "cube.003.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 7,
            "name" : "cylinder.001.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 8,
            "name" : "cylinder.002.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 9,
            "name" : "cylinder.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 10,
            "name" : "characters",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 11,
            "name" : "wizard",
            "parentID" : 10,
            "typeID" : 1
        },
        {
            "ID" : 12,
            "name" : "materials",
            "parentID" : 11,
            "typeID" : 1
        },
        {
            "ID" : 13,
            "name" : "mat.mat",
            "parentID" : 12,
            "typeID" : 2
        },
        {
            "ID" : 14,
            "name" : "meshes",
            "parentID" : 11,
            "typeID" : 1
        },
        {
            "ID" : 15,
            "name" : "wizardwhole.sk",
            "parentID" : 14,
            "typeID" : 2
        },
        {
            "ID" : 16,
            "name" : "mixamo_wizard_rig_base_animations",
            "parentID" : 11,
            "typeID" : 2
        },
        {
            "ID" : 17,
            "name" : "mixamo_wizard_rig_base_mesh",
            "parentID" : 11,
            "typeID" : 2
        },
        {
            "ID" : 18,
            "name" : "mixamo_wizard_rig_base_skeleton",
            "parentID" : 11,
            "typeID" : 2
        },
        {
            "ID" : 19,
            "name" : "map",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 20,
            "name" : "materials",
            "parentID" : 19,
            "typeID" : 1
        },
        {
            "ID" : 21,
            "name" : "m0material__25.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 22,
            "name" : "m10column_c.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 23,
            "name" : "m11details.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 24,
            "name" : "m12fabric_a.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 25,
            "name" : "m13fabric_c.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 26,
            "name" : "m14fabric_d.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 27,
            "name" : "m15fabric_e.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 28,
            "name" : "m16fabric_f.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 29,
            "name" : "m17fabric_g.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 30,
            "name" : "m18flagpole.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 31,
            "name" : "m19floor.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 32,
            "name" : "m1material__298.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 33,
            "name" : "m20leaf.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 34,
            "name" : "m21roof.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 35,
            "name" : "m22vase.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 36,
            "name" : "m23vase_hanging.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 37,
            "name" : "m24vase_round.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 38,
            "name" : "m2material__47.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 39,
            "name" : "m3material__57.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 40,
            "name" : "m4arch.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 41,
            "name" : "m5bricks.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 42,
            "name" : "m6ceiling.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 43,
            "name" : "m7chain.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 44,
            "name" : "m8column_a.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 45,
            "name" : "m9column_b.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 46,
            "name" : "meshes",
            "parentID" : 19,
            "typeID" : 1
        },
        {
            "ID" : 47,
            "name" : "abovedoorframe.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 48,
            "name" : "arches.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 49,
            "name" : "bluecurtains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 50,
            "name" : "bluefabric.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 51,
            "name" : "chains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 52,
            "name" : "door.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 53,
            "name" : "firstfloorpillars.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 54,
            "name" : "flagholders.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 55,
            "name" : "floor.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 56,
            "name" : "fountain.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 57,
            "name" : "greencurtains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 58,
            "name" : "greenfabric.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 59,
            "name" : "hanginglights.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 60,
            "name" : "lionhead.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 61,
            "name" : "lionheadframe.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 62,
            "name" : "redcurtains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 63,
            "name" : "redfabric.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 64,
            "name" : "roofarches.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 65,
            "name" : "rooftiling.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 66,
            "name" : "rooftop.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 67,
            "name" : "secondfloorpillars.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 68,
            "name" : "secondfloorsquarepillars.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 69,
            "name" : "smallvases.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 70,
            "name" : "vaseflowers.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 71,
            "name" : "vines.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 72,
            "name" : "sponza",
            "parentID" : 19,
            "typeID" : 2
        },
        {
            "ID" : 73,
            "name" : "textures",
            "parentID" : 19,
            "typeID" : 1
        },
        {
            "ID" : 74,
            "name" : "background.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 75,
            "name" : "chain_texture.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 76,
            "name" : "lion.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 77,
            "name" : "spnza_bricks_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 78,
            "name" : "sponza_arch_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 79,
            "name" : "sponza_ceiling_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 80,
            "name" : "sponza_column_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 81,
            "name" : "sponza_column_b_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 82,
            "name" : "sponza_column_c_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 83,
            "name" : "sponza_curtain_blue_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 84,
            "name" : "sponza_curtain_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 85,
            "name" : "sponza_curtain_green_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 86,
            "name" : "sponza_details_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 87,
            "name" : "sponza_fabric_blue_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 88,
            "name" : "sponza_fabric_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 89,
            "name" : "sponza_fabric_green_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 90,
            "name" : "sponza_flagpole_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 91,
            "name" : "sponza_floor_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 92,
            "name" : "sponza_thorn_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 93,
            "name" : "vase_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 94,
            "name" : "vase_hanging_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 95,
            "name" : "vase_plant.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 96,
            "name" : "vase_round.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 97,
            "name" : "scene",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 98,
            "name" : "Test",
            "parentID" : 97,
            "typeID" : 1
        }
    ]

    const DirectoryTreeInfoNEW = [
        {
            "ID" : 0,
            "name" : "ASSETS",
            "parentID" : -1,
            "typeID" : 1
        },
        {
            "ID" : 1,
            "name" : "arena",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 2,
            "name" : "collisionarena",
            "parentID" : 1,
            "typeID" : 2
        },
        {
            "ID" : 3,
            "name" : "meshes",
            "parentID" : 1,
            "typeID" : 1
        },
        {
            "ID" : 4,
            "name" : "cube.001.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 5,
            "name" : "cube.002.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 6,
            "name" : "cube.003.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 7,
            "name" : "cylinder.001.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 8,
            "name" : "cylinder.002.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 9,
            "name" : "cylinder.sk",
            "parentID" : 3,
            "typeID" : 2
        },
        {
            "ID" : 10,
            "name" : "characters",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 11,
            "name" : "wizard",
            "parentID" : 10,
            "typeID" : 1
        },
        {
            "ID" : 12,
            "name" : "materials",
            "parentID" : 11,
            "typeID" : 1
        },
        {
            "ID" : 13,
            "name" : "mat.mat",
            "parentID" : 12,
            "typeID" : 2
        },
        {
            "ID" : 14,
            "name" : "meshes",
            "parentID" : 11,
            "typeID" : 1
        },
        {
            "ID" : 15,
            "name" : "wizardwhole.sk",
            "parentID" : 14,
            "typeID" : 2
        },
        {
            "ID" : 16,
            "name" : "mixamo_wizard_rig_base_animations",
            "parentID" : 11,
            "typeID" : 2
        },
        {
            "ID" : 17,
            "name" : "mixamo_wizard_rig_base_mesh",
            "parentID" : 11,
            "typeID" : 2
        },
        {
            "ID" : 18,
            "name" : "mixamo_wizard_rig_base_skeleton",
            "parentID" : 11,
            "typeID" : 2
        },
        {
            "ID" : 19,
            "name" : "map",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 20,
            "name" : "materials",
            "parentID" : 19,
            "typeID" : 1
        },
        {
            "ID" : 21,
            "name" : "m0material__25.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 22,
            "name" : "m10column_c.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 23,
            "name" : "m11details.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 24,
            "name" : "m12fabric_a.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 25,
            "name" : "m13fabric_c.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 26,
            "name" : "m14fabric_d.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 27,
            "name" : "m15fabric_e.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 28,
            "name" : "m16fabric_f.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 29,
            "name" : "m17fabric_g.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 30,
            "name" : "m18flagpole.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 31,
            "name" : "m19floor.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 32,
            "name" : "m1material__298.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 33,
            "name" : "m20leaf.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 34,
            "name" : "m21roof.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 35,
            "name" : "m22vase.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 36,
            "name" : "m23vase_hanging.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 37,
            "name" : "m24vase_round.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 38,
            "name" : "m2material__47.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 39,
            "name" : "m3material__57.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 40,
            "name" : "m4arch.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 41,
            "name" : "m5bricks.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 42,
            "name" : "m6ceiling.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 43,
            "name" : "m7chain.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 44,
            "name" : "m8column_a.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 45,
            "name" : "m9column_b.mat",
            "parentID" : 20,
            "typeID" : 2
        },
        {
            "ID" : 46,
            "name" : "meshes",
            "parentID" : 19,
            "typeID" : 1
        },
        {
            "ID" : 47,
            "name" : "abovedoorframe.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 48,
            "name" : "arches.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 49,
            "name" : "bluecurtains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 50,
            "name" : "bluefabric.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 51,
            "name" : "chains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 52,
            "name" : "door.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 53,
            "name" : "firstfloorpillars.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 54,
            "name" : "flagholders.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 55,
            "name" : "floor.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 56,
            "name" : "fountain.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 57,
            "name" : "greencurtains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 58,
            "name" : "greenfabric.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 59,
            "name" : "hanginglights.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 60,
            "name" : "lionhead.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 61,
            "name" : "lionheadframe.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 62,
            "name" : "redcurtains.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 63,
            "name" : "redfabric.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 64,
            "name" : "roofarches.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 65,
            "name" : "rooftiling.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 66,
            "name" : "rooftop.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 67,
            "name" : "secondfloorpillars.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 68,
            "name" : "secondfloorsquarepillars.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 69,
            "name" : "smallvases.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 70,
            "name" : "vaseflowers.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 71,
            "name" : "vines.sk",
            "parentID" : 46,
            "typeID" : 2
        },
        {
            "ID" : 72,
            "name" : "sponza",
            "parentID" : 19,
            "typeID" : 2
        },
        {
            "ID" : 73,
            "name" : "textures",
            "parentID" : 19,
            "typeID" : 1
        },
        {
            "ID" : 74,
            "name" : "background.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 75,
            "name" : "chain_texture.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 76,
            "name" : "lion.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 77,
            "name" : "spnza_bricks_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 78,
            "name" : "sponza_arch_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 79,
            "name" : "sponza_ceiling_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 80,
            "name" : "sponza_column_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 81,
            "name" : "sponza_column_b_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 82,
            "name" : "sponza_column_c_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 83,
            "name" : "sponza_curtain_blue_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 84,
            "name" : "sponza_curtain_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 85,
            "name" : "sponza_curtain_green_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 86,
            "name" : "sponza_details_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 87,
            "name" : "sponza_fabric_blue_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 88,
            "name" : "sponza_fabric_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 89,
            "name" : "sponza_fabric_green_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 90,
            "name" : "sponza_flagpole_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 91,
            "name" : "sponza_floor_a_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 92,
            "name" : "sponza_thorn_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 93,
            "name" : "vase_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 94,
            "name" : "vase_hanging_diff.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 95,
            "name" : "vase_plant.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 96,
            "name" : "vase_round.dds.png",
            "parentID" : 73,
            "typeID" : 2
        },
        {
            "ID" : 97,
            "name" : "scene",
            "parentID" : 0,
            "typeID" : 1
        },
        {
            "ID" : 98,
            "name" : "Test",
            "parentID" : 97,
            "typeID" : 1
        },
        {
            "ID" : 99,
            "name" : "materials",
            "parentID" : 98,
            "typeID" : 1
        },
        {
            "ID" : 100,
            "name" : "m0material__25.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 101,
            "name" : "m10column_c.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 102,
            "name" : "m11details.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 103,
            "name" : "m12fabric_a.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 104,
            "name" : "m13fabric_c.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 105,
            "name" : "m14fabric_d.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 106,
            "name" : "m15fabric_e.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 107,
            "name" : "m16fabric_f.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 108,
            "name" : "m17fabric_g.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 109,
            "name" : "m18flagpole.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 110,
            "name" : "m19floor.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 111,
            "name" : "m1material__298.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 112,
            "name" : "m20leaf.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 113,
            "name" : "m21roof.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 114,
            "name" : "m22vase.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 115,
            "name" : "m23vase_hanging.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 116,
            "name" : "m24vase_round.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 117,
            "name" : "m2material__47.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 118,
            "name" : "m3material__57.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 119,
            "name" : "m4arch.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 120,
            "name" : "m5bricks.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 121,
            "name" : "m6ceiling.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 122,
            "name" : "m7chain.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 123,
            "name" : "m8column_a.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 124,
            "name" : "m9column_b.mat",
            "parentID" : 99,
            "typeID" : 2
        },
        {
            "ID" : 125,
            "name" : "meshes",
            "parentID" : 98,
            "typeID" : 1
        },
        {
            "ID" : 126,
            "name" : "abovedoorframe.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 127,
            "name" : "arches.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 128,
            "name" : "bluecurtains.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 129,
            "name" : "bluefabric.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 130,
            "name" : "chains.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 131,
            "name" : "door.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 132,
            "name" : "firstfloorpillars.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 133,
            "name" : "flagholders.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 134,
            "name" : "floor.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 135,
            "name" : "fountain.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 136,
            "name" : "greencurtains.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 137,
            "name" : "greenfabric.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 138,
            "name" : "hanginglights.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 139,
            "name" : "lionhead.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 140,
            "name" : "lionheadframe.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 141,
            "name" : "redcurtains.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 142,
            "name" : "redfabric.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 143,
            "name" : "roofarches.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 144,
            "name" : "rooftiling.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 145,
            "name" : "rooftop.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 146,
            "name" : "secondfloorpillars.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 147,
            "name" : "secondfloorsquarepillars.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 148,
            "name" : "smallvases.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 149,
            "name" : "vaseflowers.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 150,
            "name" : "vines.sk",
            "parentID" : 125,
            "typeID" : 2
        },
        {
            "ID" : 151,
            "name" : "sponza",
            "parentID" : 98,
            "typeID" : 2
        },
        {
            "ID" : 152,
            "name" : "textures",
            "parentID" : 98,
            "typeID" : 1
        },
        {
            "ID" : 153,
            "name" : "background.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 154,
            "name" : "chain_texture.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 155,
            "name" : "lion.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 156,
            "name" : "spnza_bricks_a_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 157,
            "name" : "sponza_arch_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 158,
            "name" : "sponza_ceiling_a_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 159,
            "name" : "sponza_column_a_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 160,
            "name" : "sponza_column_b_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 161,
            "name" : "sponza_column_c_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 162,
            "name" : "sponza_curtain_blue_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 163,
            "name" : "sponza_curtain_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 164,
            "name" : "sponza_curtain_green_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 165,
            "name" : "sponza_details_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 166,
            "name" : "sponza_fabric_blue_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 167,
            "name" : "sponza_fabric_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 168,
            "name" : "sponza_fabric_green_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 169,
            "name" : "sponza_flagpole_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 170,
            "name" : "sponza_floor_a_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 171,
            "name" : "sponza_thorn_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 172,
            "name" : "vase_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 173,
            "name" : "vase_hanging_diff.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 174,
            "name" : "vase_plant.dds.png",
            "parentID" : 152,
            "typeID" : 2
        },
        {
            "ID" : 175,
            "name" : "vase_round.dds.png",
            "parentID" : 152,
            "typeID" : 2
        }
    ];

    const EnumInfo = [
        {
            "name" : "TextureFormat",
            "values" : 
            [
                "UNKNOWN",
                "R8",
                "RGB_888",
                "RGBA_8888",
                "BGRA_8888",
                "RGBA_BC7",
                "DDS_UNKNOWN",
                "RG_BC5",
                "GRAY_BC4",
                "RGB_BC1",
                "D24_S8",
                "D32",
                "D32_S8",
                "S8",
                "R16G16F",
                "R16G16B16A16F",
                "R32F",
                "R32G32B32A32F",
                "R32G32B32A32"
            ]
        },
        {
            "name" : "EShaderType",
            "values" : 
            [
                "UNKNOWN",
                "Pixel",
                "Vertex",
                "Compute",
                "Hull",
                "Domain",
                "Mesh",
                "Amplification"
            ]
        },
        {
            "name" : "EMaterialOutputTypes::Value",
            "values" : 
            [
                "Diffuse",
                "Normal",
                "Specular",
                "Emissive",
                "Metallic",
                "Roughness",
                "Translucency"
            ]
        },
        {
            "name" : "EMaterialLinkType::Value",
            "values" : 
            [
                "Unknown",
                "Float",
                "Vector2",
                "Vector3",
                "Vector4",
                "Matrix3",
                "Matrix4"
            ]
        },
        {
            "name" : "EWindowedMode",
            "values" : 
            [
                "Windowed",
                "Fullscreen"
            ]
        }
    ];

    GenerateDirectoryTree(JSON.stringify(DirectoryTreeInfoOLD));
    PopulateEngineEnumData(JSON.stringify(EnumInfo));

    var BOOL = false;

    document.addEventListener('keydown', function(event) {

        const tree = BOOL ? DirectoryTreeInfoOLD : DirectoryTreeInfoNEW;
        BOOL = !BOOL;

        GenerateDirectoryTree(JSON.stringify(tree));    
    });
}