//const { extend } = require("jquery");


let ParticleLayerPanelInstance = {};
let ParticleLayerDetailsInstance = {};


let prevSelectNodes = LGraphCanvas.prototype.selectNodes
LGraphCanvas.prototype.selectNodes = function (nodes, add_to_current_selection) {

    prevSelectNodes.call(this, nodes, add_to_current_selection);
    ParticleLayerPanelInstance.detailsDiv.innerHTML = "";

    if (nodes && nodes.length == 1) {
        if (nodes[0].hasOwnProperty("base_properties")) {
            ParticleLayerDetailsInstance.SetProperties(nodes[0].base_properties);
        }
    }
}








function InitializeParticleLayerPanel(IDTag, DetailsTag) {
    let Inst = {
        root: document.getElementById(IDTag),
        detailsDiv: document.getElementById(DetailsTag)
    };

    console.log("InitializeParticleLayerPanel");

    Inst.graphCanvas = document.createElement("canvas");
    Inst.root.appendChild(Inst.graphCanvas);

    let width = Inst.root.clientWidth;
    let height = Inst.root.clientHeight;

    Inst.lGraph = new LGraph();
    Inst.lGraphCanvas = new LGraphCanvas(Inst.graphCanvas, Inst.lGraph);
    Inst.lGraphCanvas.resize(width, height);

    { 
        let newNode = LiteGraph.createNode("ParticleSystem/ParticleType");
        Inst.lGraph.add(newNode);
    
        let newNodeEB = LiteGraph.createNode("ParticleSystem/EmitBegin");
        Inst.lGraph.add(newNodeEB);

        newNode.connect(0, newNodeEB, 0);
   
   
        let newNodeFW = LiteGraph.createNode("widget/FloatWidget");
        Inst.lGraph.add(newNodeFW);
        newNodeFW.base_properties[0].value = 1.0;
    
        let newNodeDT = LiteGraph.createNode("ParticleSystem/DeltaTime");
        Inst.lGraph.add(newNodeDT);
    
    
        let newNodeMult = LiteGraph.createNode("Math/Mul");
        Inst.lGraph.add(newNodeMult);

        newNodeFW.connect(0, newNodeMult, 0);
        newNodeDT.connect(0, newNodeMult, 1);
        newNodeMult.connect(0, newNodeEB, "Accumulator");

        let newNodeFWSize = LiteGraph.createNode("widget/FloatWidget");
        Inst.lGraph.add(newNodeFWSize);
        newNodeFWSize.base_properties[0].value = 1.0;

        let newNodeF2V3 = LiteGraph.createNode("ParticleSystem/FloatToVector3");
        Inst.lGraph.add(newNodeF2V3);

        newNodeFWSize.connect(0, newNodeF2V3, 0);
        newNodeF2V3.connect(0, newNodeEB, "size");


        let newNodeGraphPoints = LiteGraph.createNode("widget/GraphPoints");
        Inst.lGraph.add(newNodeGraphPoints);

        let newNodeEE = LiteGraph.createNode("ParticleSystem/EmitEnd");
        Inst.lGraph.add(newNodeEE);

        let newColorMult = LiteGraph.createNode("Math/Mul");
        Inst.lGraph.add(newColorMult);
       
        
        newNodeEB.connect(0, newNodeEE, 0);
        newNodeEB.connect(2, newColorMult, 0);
        newNodeEB.connect(5, newNodeGraphPoints, 0);

        newNodeGraphPoints.connect(0, newColorMult, 1);

        newColorMult.connect(0, newNodeEE, 2);
    }
        
    ParticleLayerPanelInstance = Inst;
    Inst.lGraph.arrange();

    ParticleLayerDetailsInstance = new PropertyPanel(Inst.detailsDiv)    
}

window["InitializeParticleLayerPanel"] = InitializeParticleLayerPanel;

function OnResizeParticleLayerPanel() {
    if (ParticleLayerPanelInstance.root) {
        let width = ParticleLayerPanelInstance.root.clientWidth;
        let height = ParticleLayerPanelInstance.root.clientHeight;

        if (ParticleLayerPanelInstance.current) {
            Inst.lGraphCanvas.resize(width, height);
        }
    }
}
window["OnResizeParticleLayerPanel"] = OnResizeParticleLayerPanel;


//////////////////////////////////////

class Node_FloatToVector3 {
    constructor() {
        this.addInput("Value", "float");
        this.addOutput("Value", "Vector3");
    }
    static get title() {
        return "Float To Vector3";
    }
}
LiteGraph.registerNodeType("ParticleSystem/FloatToVector3", Node_FloatToVector3);

/////////////////////////////

class Widget_ColorPicker {

    constructor() {
        this.addOutput("Color", "Vector4");
        this.size = [128+32+32, 128+32];
        this.clicked = false;

        this.base_properties = [ PropertyWithMeta.BuildFromValue("r", 1.0, this),
            PropertyWithMeta.BuildFromValue("g", 1.0, this),
            PropertyWithMeta.BuildFromValue("b", 1.0, this),
            PropertyWithMeta.BuildFromValue("a", 1.0, this)];

        //this.alphaColor = 255.0;
        //this.selectedColor = 'rgba(255,255,255,1)';
        //this.selectedColorVec4 = new THREE.Vector4(1.0,1.0,1.0,1.0);
        this.rgbaColor = 'rgba(0,0,0,1)';
        

        this.colorBarWidth = 32;
        this.colorBarHeight = 128;
        this.alphaBarWidth = 32;
        this.alphaBarHeight = 128;
        this.gradientWidth = 128;
        this.gradientHeight = 128;

        this.resizable = false;
    }

    onPropertyChanged(InPropName, InValue) {

        if (InPropName === "r") {

        } else if (InPropName === "g") {

        } else if (InPropName === "b") {

        } else if (InPropName === "a") {

        }

        this.selectedColor = "rgba({0},{1},{2}, 1)".formatUnicorn(
            Math.ceil(this.base_properties[0].value * 255.0),
            Math.ceil(this.base_properties[1].value * 255.0),
            Math.ceil(this.base_properties[2].value * 255.0));
        this.color = this.selectedColor;

        this.setDirtyCanvas(true);
    }

    static get title() {
        return "Color Picker";
    }

    onDrawBackground(ctx) {
        if (this.flags.collapsed) {
            return;
        }

        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.fillRect(0, 0, this.size[0], this.size[1]);

        //COLOR STRIP       
        {
            let grid = ctx.createLinearGradient(0, 32, 0, this.colorBarHeight + 32);
            grid.addColorStop(0,    'rgba(255,  0,      0,      1)');
            grid.addColorStop(0.17, 'rgba(255,  255,    0,      1)');
            grid.addColorStop(0.34, 'rgba(0,    255,    0,      1)');
            grid.addColorStop(0.51, 'rgba(0,    255,    255,    1)');
            grid.addColorStop(0.68, 'rgba(0,    0,      255,    1)');
            grid.addColorStop(0.85, 'rgba(255,  0,      255,    1)');
            grid.addColorStop(1,    'rgba(255,  0,      0,      1)');
            ctx.fillStyle = grid;
            ctx.fillRect(this.gradientWidth, 32, this.colorBarWidth, this.colorBarHeight);
        }

        //ALPHA STRIP       
        {
            let grid = ctx.createLinearGradient(0, 32, 0, this.alphaBarHeight + 32);
            grid.addColorStop(0, 'rgba(255,255,255,1)');
            grid.addColorStop(1, 'rgba(0,0,0,1)');            
            ctx.fillStyle = grid;
            ctx.fillRect(this.gradientWidth + this.colorBarWidth, 32, this.alphaBarWidth, this.alphaBarHeight);
        }

        //COLOR GRADIENT
        ctx.fillStyle = this.rgbaColor;
        ctx.fillRect(0, 32, this.gradientWidth, this.gradientHeight);

        var grdWhite = ctx.createLinearGradient(0, 32, this.gradientWidth, 32);
        grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
        grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grdWhite;
        ctx.fillRect(0, 32, this.gradientWidth, this.gradientHeight);

        var grdBlack = ctx.createLinearGradient(0, 32, 0, this.gradientHeight+32);
        grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
        grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = grdBlack;
        ctx.fillRect(0, 32, this.gradientWidth, this.gradientHeight);

        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.font = "12px serif";
        ctx.fillText("R({0}) G({1}) B({2}) A({3})".formatUnicorn(
            this.base_properties[0].value.toFixed(2),
            this.base_properties[1].value.toFixed(2),
            this.base_properties[2].value.toFixed(2),
            this.base_properties[3].value.toFixed(2)), 0, 16);
    }

    onMouseDown(e, local_pos, graph) {
        if (
            local_pos[0] > 1 &&
            local_pos[1] > 32 &&
            local_pos[0] < this.size[0] - 2 &&
            local_pos[1] < this.size[1] - 2
        ) {

            let ctx = e.target.data.ctx;
            let x = e.layerX;
            let y = e.layerY;
                       
            var imageData = ctx.getImageData(x, y, 1, 1).data;

            if (local_pos[0] > this.gradientWidth + this.colorBarWidth) {
                this.base_properties[3].value = imageData[0] / 255.0;
            }
            else if (local_pos[0] > this.gradientWidth) {
                this.rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
            }
            else {
                this.base_properties[0].value = imageData[0] / 255.0;
                this.base_properties[1].value = imageData[1] / 255.0;
                this.base_properties[2].value = imageData[2] / 255.0;               
            }   

            this.clicked = true;
            return true;
        }
    };    

    onMouseUp(e) {
        this.clicked = false;
    };
};

LiteGraph.registerNodeType("widget/ColorPicker", Widget_ColorPicker);
////////////////////


/////////////////////////////
class Widget_GraphPoints {

    constructor() {

        this.addInput("X", "float");
        this.addOutput("Y", "float");

        this.size = [128, 128];

        this.points = [ [0, 1], [1, 0] ];

        this.selected = -1;
        this.nearest = -1;
        
        this.must_update = true;
        this.margin = 5;
    }

    static get title() {
        return "Graph Points";
    }

    sampleCurve(f) {
        if (!this.points)
            return;
        for (var i = 0; i < this.points.length - 1; ++i) {
            var p = this.points[i];
            var pn = this.points[i + 1];
            if (pn[0] < f)
                continue;
            var r = (pn[0] - p[0]);
            if (Math.abs(r) < 0.00001)
                return p[1];
            var local_f = (f - p[0]) / r;
            return p[1] * (1.0 - local_f) + pn[1] * local_f;
        }
        return 0;
    }

    onDrawBackground(ctx, graphcanvas) {
        if (this.flags.collapsed) {
            return;
        }

        //graphcanvas
        let background_color = "#000";
        let line_color = "#666";

        let inactive = false;

        var points = this.points;
        if (!points)
            return;
        //this.size = size;
        var w = this.size[0] - this.margin * 2;
        var h = this.size[1] - this.margin * 2;

        line_color = line_color || "#666";

        ctx.save();
        ctx.translate(this.margin, this.margin);

        if (background_color) {
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#222";
            ctx.fillRect(w * 0.5, 0, 1, h);
            ctx.strokeStyle = "#333";
            ctx.strokeRect(0, 0, w, h);
        }
        ctx.strokeStyle = line_color;
        if (inactive)
            ctx.globalAlpha = 0.5;
        ctx.beginPath();
        for (var i = 0; i < points.length; ++i) {
            var p = points[i];
            ctx.lineTo(p[0] * w, (1.0 - p[1]) * h);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (!inactive)
            for (var i = 0; i < points.length; ++i) {
                var p = points[i];
                ctx.fillStyle = this.selected == i ? "#FFF" : (this.nearest == i ? "#DDD" : "#AAA");
                ctx.beginPath();
                ctx.arc(p[0] * w, (1.0 - p[1]) * h, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        ctx.restore();
    }

    getCloserPoint(pos, max_dist) {
        var points = this.points;
        if (!points)
            return -1;
        max_dist = max_dist || 30;
        var w = (this.size[0] - this.margin * 2);
        var h = (this.size[1] - this.margin * 2);
        var num = points.length;
        var p2 = [0, 0];
        var min_dist = 1000000;
        var closest = -1;
        var last_valid = -1;
        for (var i = 0; i < num; ++i) {
            var p = points[i];
            p2[0] = p[0] * w;
            p2[1] = (1.0 - p[1]) * h;
            if (p2[0] < pos[0])
                last_valid = i;
            var dist = //vec2.distance(pos, p2);
                Math.sqrt(Math.pow((p2[0] - pos[0]), 2.0) + Math.pow((p2[1] - pos[1]), 2.0));

            if (dist > min_dist || dist > max_dist)
                continue;
            closest = i;
            min_dist = dist;
        }
        return closest;
    }

    onMouseDown(e, localpos, graphcanvas) {
        var points = this.points;
        if (!points)
            return;
        if (localpos[1] < 0)
            return;

        //this.captureInput(true);
        var w = this.size[0] - this.margin * 2;
        var h = this.size[1] - this.margin * 2;
        var x = localpos[0] - this.margin;
        var y = localpos[1] - this.margin;
        var pos = [x, y];
        var max_dist = 30 / graphcanvas.ds.scale;
        //search closer one
        this.selected = this.getCloserPoint(pos, max_dist);
        //create one
        if (this.selected == -1) {
            var point = [x / w, 1 - y / h];
            points.push(point);
            points.sort(function (a, b) { return a[0] - b[0]; });
            this.selected = points.indexOf(point);
            this.must_update = true;
        }
        if (this.selected != -1)
            return true;
    };

    onMouseUp(e) {
        this.selected = -1;
    };

    onMouseMove(e, localpos, graphcanvas) {
        var points = this.points;
        if (!points)
            return;
        var s = this.selected;
        if (s < 0)
            return;
        var x = (localpos[0] - this.margin) / (this.size[0] - this.margin * 2);
        var y = (localpos[1] - this.margin) / (this.size[1] - this.margin * 2);
        var curvepos = [(localpos[0] - this.margin), (localpos[1] - this.margin)];
        var max_dist = 30 / graphcanvas.ds.scale;
        this._nearest = this.getCloserPoint(curvepos, max_dist);
        var point = points[s];
        if (point) {
            var is_edge_point = s == 0 || s == points.length - 1;
            if (!is_edge_point && (localpos[0] < -10 || localpos[0] > this.size[0] + 10 || localpos[1] < -10 || localpos[1] > this.size[1] + 10)) {
                points.splice(s, 1);
                this.selected = -1;
                return;
            }
            if (!is_edge_point) //not edges
                point[0] = clamp(x, 0, 1);
            else
                point[0] = s == 0 ? 0 : 1;
            point[1] = 1.0 - clamp(y, 0, 1);
            points.sort(function (a, b) { return a[0] - b[0]; });
            this.selected = points.indexOf(point);
            this.must_update = true;
        }
    }
};

LiteGraph.registerNodeType("widget/GraphPoints", Widget_GraphPoints);
////////////////////

class Node_FloatWidget {
    constructor() {
        this.addOutput("Value", "float");

        const _that = this;
        this.base_properties = [ PropertyWithMeta.BuildFromValue("Value", 0.0, this)];

        this.number = this.addWidget("number", "Number", 0.0,
            function (v) {
                _that.base_properties[0].value = v;
                ParticleLayerDetailsInstance.SetProperties(_that.base_properties);
            },
            { });
    }

    onPropertyChanged(InPropName, InValue) {

        if (this.number.value !== InValue) {
            this.number.value = InValue;
        }

        this.setDirtyCanvas(true);
    }

    static get title() {
        return "Float Widget";
    }
}

LiteGraph.registerNodeType("widget/FloatWidget", Node_FloatWidget);
////////////////////


class Widget_RandomFloat {
    constructor() {
        this.addOutput("Value", "float");

        const _that = this;
        this.base_properties = [ PropertyWithMeta.BuildFromValue("min", 0.0, this),
            PropertyWithMeta.BuildFromValue("max", 1.0, this)];

        this.minNum = this.addWidget("number", "min", 0.0,
            function (v) {
                _that.base_properties[0].value = v;
                ParticleLayerDetailsInstance.SetProperties(_that.base_properties);
            },
            {});
        this.maxNum = this.addWidget("number", "max", 1.0,
            function (v) {
                _that.base_properties[1].value = v;
                ParticleLayerDetailsInstance.SetProperties(_that.base_properties);
            },
            {});
    }

    onPropertyChanged(InPropName, InValue) {

        if (InPropName === "min" && this.minNum.value !== InValue) {
            this.minNum.value = InValue;
        }
        else if (InPropName === "max" && this.maxNum.value !== InValue) {
            this.maxNum.value = InValue;
        }

        this.setDirtyCanvas(true);
    }

    static get title() {
        return "Widget Random Float";
    }
}
LiteGraph.registerNodeType("widget/Widget_RandomFloat", Widget_RandomFloat);

////////////////////

class Widget_Vector3 {
    constructor() {
        this.addOutput("Value", "Vector3");

        this.addInput("X", "Float");
        this.addInput("Y", "Float");
        this.addInput("Z", "Float");

        const _that = this;
        this.base_properties = [ PropertyWithMeta.BuildFromValue("x", 0.0, this),
            PropertyWithMeta.BuildFromValue("y", 0.0, this),
            PropertyWithMeta.BuildFromValue("z", 0.0, this)];
    }

    static get title() {
        return "Widget Vector3";
    }
}
LiteGraph.registerNodeType("Input/Widget_Vector3", Widget_Vector3);

////////////////////

class Widget_Vector4 {
    constructor() {
        this.addOutput("Value", "Vector4");

        this.addInput("X", "Float");
        this.addInput("Y", "Float");
        this.addInput("Z", "Float");
        this.addInput("W", "Float");

        const _that = this;
        this.base_properties = [ PropertyWithMeta.BuildFromValue("x", 0.0, this),
            PropertyWithMeta.BuildFromValue("y", 0.0, this),
            PropertyWithMeta.BuildFromValue("z", 0.0, this),
            PropertyWithMeta.BuildFromValue("w", 0.0, this)];
    }

    static get title() {
        return "Widget Vector4";
    }
}
LiteGraph.registerNodeType("Input/Widget_Vector4", Widget_Vector4);

////////////////////





function InitializeInstance(InBeginNode) {
    let newDataStore = {};    

    for (const curNode of ParticleLayerPanelInstance.lGraph._nodes) {        
        if (curNode.properties["datastore"] !== undefined) {
            newDataStore[curNode.id] = JSON.parse(JSON.stringify( curNode.properties["datastore"] ));
        }
    }

    let newInstance = new EmitterInstance();

    newInstance.datastore = newDataStore;
    newInstance.node = InBeginNode;

    return newInstance;
}

function _FindNodeParentByClass(InNode, InNodeClass) {
    if (!InNode || !InNode.inputs || InNode.bHit) return null;

    InNode.bHit = true;
    for (let i = 0; i < InNode.inputs.length; i++) {
        var iterNode = InNode.getInputNode(i);

        let foundNode = _FindNodeParentByClass(iterNode, InNodeClass);
        if (foundNode && foundNode.constructor === InNodeClass) {
            return foundNode;
        }
    }

    return null;
}


function FindNodeParentByClass(InNode, InNodeClass) {
    for (const curNode of ParticleLayerPanelInstance.lGraph._nodes) {
        curNode.bHit = false;
    }

    return _FindNodeParentByClass(InNode, InNodeClass);
}

function _FindNodesChildByClass(InNode, InNodeClass, oNodes) {
    if (!InNode || InNode.bHit) return;

    if (InNode && InNode.constructor === InNodeClass) {
        oNodes.push(InNode);
    }

    InNode.bHit = true;

    if ( !InNode.outputs) return;

    for (let i = 0; i < InNode.outputs.length; i++) {
        var iterNodes = InNode.getOutputNodes(i);

        if (iterNodes) {
            for (const curIterNode of iterNodes) {                
                _FindNodesChildByClass(curIterNode, InNodeClass, oNodes);
            }
        }        
    }
}


function FindNodesChildByClass(InNode, InNodeClass) {
    for (const curNode of ParticleLayerPanelInstance.lGraph._nodes) {
        curNode.bHit = false;
    }

    let oNodes = [];
    _FindNodesChildByClass(InNode, InNodeClass, oNodes);
    return oNodes;
}

function InitializeParticleSystem() {

    SystemTiming.totalTime = 0.0;

    ParticleSystemGlobal.Clear();

    let emitterBegins = ParticleLayerPanelInstance.lGraph.findNodesByClass(Node_EmitBegin);
    for (const curEmitter of emitterBegins) {
        let newEmitterInstance = InitializeInstance(curEmitter);
        
        let foundNodes = FindNodesChildByClass(curEmitter, Node_EmitEnd);
        if (foundNodes.length == 1) {
            newEmitterInstance.updateNode = foundNodes[0];
        }

        ParticleSystemGlobal.AddEmitter(newEmitterInstance);
    }
}

function UpdateParticleSystem(InDeltaTime) {

    SystemTiming.deltaTime = InDeltaTime;
    SystemTiming.totalTime += InDeltaTime;

    for (const curEmitter of ParticleSystemGlobal.emitters) {
        // creation node
        let particles = ResolverTable["Node_EmitBegin"].ResolveValue(curEmitter, curEmitter.node, 0);

        if (curEmitter.updateNode) {            
            for (var i = particles.length - 1; i >= 0; i--) {
                curEmitter.activeParticleUpdate = i;

                let particleUpdateValue = ResolverTable["Node_EmitEnd"].ResolveValue(curEmitter, curEmitter.updateNode, 0);

                if (particleUpdateValue.position) {
                    particles[i].position.copy(particleUpdateValue.position);
                }
                if (particleUpdateValue.color) {
                    particles[i].color.copy(particleUpdateValue.color);
                }
                if (particleUpdateValue.size) {
                    particles[i].size.copy(particleUpdateValue.size);
                }
                if (particleUpdateValue.velocity) {
                    particles[i].velocity.copy(particleUpdateValue.velocity);
                }
            }            
        }
        
    }

    ParticleSystemGlobal.Update(InDeltaTime);
}

{
    let getCompileButton = document.getElementById("Compile")
    getCompileButton.addEventListener("click", restartPS);
}
{
    let getCompileButton = document.getElementById("Save")
    getCompileButton.addEventListener("click", saveGraph);
}

function restartPS() {
    InitializeParticleSystem()
}

function saveGraph() {

   
    console.log(JSON.stringify(ParticleLayerPanelInstance.lGraph.serialize(), null, 2));
}


