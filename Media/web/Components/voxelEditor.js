if (!window.InvokeNative) {
    window.InvokeNative = function (InFuncName, ...theArgs) {
        console.log("No Native Invoke: " + JSON.stringify({ func: InFuncName, args: theArgs }))
    }
}

let VoxelEditorInstance = {};

let voxel_types = [
    "bedrock",
    "stone",
    "metal",
    "wood",
    "ice",
    "vine",
    "dirt",
    "grass",
    "sand"
];

let voxelTypeHTML = `<button class="voxelTypeButton" id="{0}";" > 
				<div class="flex-container">
					<div class="colorSquare" style="background-color: var(--{1});"> </div>
					<div class="voxelName" >{2}</div>
				</div>  
			</button><br>`;

function InitializeVoxelEditor()
{
    const Inst = {
        meshScaleDiv: document.getElementById(`meshScaleDiv`),
        brushSizeDiv: document.getElementById(`brushSizeDiv`),
        meshListDiv: document.getElementById(`meshListDiv`),
        editorButtons: [],
        placementButtons: [],
        shapeButtons: [],
        allDivs: [],
        divVisibility: [],
        voxelTypeButtons: [],
        meshButtons: []
    };

    Inst.brushSizeDiv.addEventListener('change', function(event){
        var sliderValue = event.target.value;
        Inst.brushSizeDiv.innerHTML = sliderValue;
        window.InvokeNative("EDITOR", `brushSize ${sliderValue}`);
    });

    Inst.editorButtons.push(document.getElementById(`buttonPaint`));
    Inst.editorButtons.push(document.getElementById(`buttonErase`));
    Inst.editorButtons.push(document.getElementById(`buttonMesh`));
    Inst.editorButtons.push(document.getElementById(`buttonSettings`));
    
    Inst.placementButtons.push(document.getElementById(`buttonReplace`));
    Inst.placementButtons.push(document.getElementById(`buttonFill`));
    Inst.placementButtons.push(document.getElementById(`buttonCover`));
    
    Inst.shapeButtons.push(document.getElementById(`buttonSphere`));
    Inst.shapeButtons.push(document.getElementById(`buttonBox`));

    let voxelSelectDiv = document.getElementById(`voxelSelectDiv`);
    let brushInfoDiv = document.getElementById(`brushInfoDiv`);
    let meshSelectDiv = document.getElementById(`meshSelectDiv`);
    let settingsDiv = document.getElementById(`settingsDiv`);

    Inst.allDivs = [voxelSelectDiv, brushInfoDiv, meshSelectDiv, settingsDiv];
    Inst.divVisibility = [ [voxelSelectDiv, brushInfoDiv], [brushInfoDiv], [meshSelectDiv], [settingsDiv] ];

    Inst.allDivs.forEach(function(element){
        element.style.display = "none";
    })

    let curCount = 0;
    voxel_types.forEach(function(e){
        let formattedText = voxelTypeHTML.format("button" + e, "vc" + e, e);
        voxelSelectDiv.innerHTML += formattedText;
        curCount++;
    });

    curCount = 0;
    voxel_types.forEach(function(e){
            
        let button = document.getElementById("button" + e);
        button.index = curCount;
        button.addEventListener("click", function(){
            voxelTypeSelection(this.index);
        })
        Inst.voxelTypeButtons.push(button);
        curCount++;
    })
    
    VoxelEditorInstance = Inst;

    editorSelection(0);
    voxelTypeSelection(0);
    placementMode(0);
    shapeMode(0);

    window.InvokeNative("EDITOR", "RequestVoxelMeshes");   
}
window["InitializeVoxelEditor"] = InitializeVoxelEditor;

function meshOffset(InAxis, InValue) {
    window.InvokeNative("EDITOR", `meshOffset ${InAxis} ${InValue}`);
}

function meshRot(InAxis, InValue) {
    window.InvokeNative("EDITOR", `meshRot ${InAxis} ${InValue}`);
}

function setRandRot(InAxis, InValue) {
    window.InvokeNative("EDITOR", `setRandRot ${InAxis} ${InValue}`);
}

function meshScaleChange(InValue) {
    VoxelEditorInstance.meshScaleDiv.innerHTML = InValue + "%";
    window.InvokeNative("EDITOR", `meshScaleChange ${InValue}`);
}

function horzAlignClick(InValue) {
    window.InvokeNative("EDITOR", `horzAlignClick ${InValue}`);
}

function vertAlignClick(InValue) {
    window.InvokeNative("EDITOR", `vertAlignClick ${InValue}`);
}

let selectionColor = "#619c37";

function placementMode(InValue) {
    
    VoxelEditorInstance.placementButtons.forEach(function(element){
        element.style.backgroundColor = null;
    });

    VoxelEditorInstance.placementButtons[InValue].style.backgroundColor = selectionColor;
    window.InvokeNative("EDITOR", `placementMode ${InValue}`);
}

function shapeMode(InValue) {
    
    VoxelEditorInstance.shapeButtons.forEach(function(e){
        e.style.backgroundColor = null;
    });

    VoxelEditorInstance.shapeButtons[InValue].style.backgroundColor = selectionColor;
    window.InvokeNative("EDITOR", `shapeMode ${InValue}`);
}

function editorSelection(InValue) {
    
    VoxelEditorInstance.editorButtons.forEach(function(e){
        e.style.backgroundColor = null;
    });

    const b = VoxelEditorInstance.editorButtons[InValue];

    b.style.backgroundColor = selectionColor;
    
    VoxelEditorInstance.allDivs.forEach(function(e){
        e.style.display = "none";
    });

    VoxelEditorInstance.divVisibility[InValue].forEach(function(e){
        e.style.display = null;
    })
    
    window.InvokeNative("EDITOR", `editorSelection ${InValue}`);
}

function voxelTypeSelection(InValue) {
    
    VoxelEditorInstance.voxelTypeButtons.forEach(function(e){
        e.style.backgroundColor = null;
    });

    VoxelEditorInstance.voxelTypeButtons[InValue].style.backgroundColor = selectionColor;
    window.InvokeNative("EDITOR", `voxelTypeSelection ${InValue}`);
}

function meshSelected(InValue) {
    console.log("meshSelected: " + InValue);

    VoxelEditorInstance.meshButtons.forEach(function(e){
        e.style.backgroundColor = null;
    });
    VoxelEditorInstance.meshButtons[InValue].style.backgroundColor = selectionColor;
    window.InvokeNative("EDITOR", `meshSelected ${InValue}`);
}

let meshDataHTML = `<button id="{0}"> 
            <img src="./texturegrid.png" alt="default" width="64" height="64">
            <div>{1}</div>
            </button>`;

function populateMeshes(InMeshJSON) {

    console.log("populateMeshes: " + InMeshJSON);
    
    VoxelEditorInstance.meshListDiv.innerHTML = "";
    const jsonObj = JSON.parse(InMeshJSON);
   
    let curCount = 0;
    jsonObj.MeshNames.forEach(function(e){
        let formattedText = meshDataHTML.format("meshBtn" + curCount, e);
        VoxelEditorInstance.meshListDiv.innerHTML += formattedText;
        curCount++;
    });

    VoxelEditorInstance.meshButtons = [];

    jsonObj.MeshNames.forEach(function(e, index) {
        const btn = document.getElementById("meshBtn" + index);
        btn.addEventListener("click", function(){
            meshSelected(index);
        })

        VoxelEditorInstance.meshButtons.push(btn);
    });

    if(curCount > 0)
        meshSelected(0);
}
window["populateMeshes"] = populateMeshes;

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}