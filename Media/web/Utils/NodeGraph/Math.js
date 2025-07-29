let ALL_DATA_TYPES = "Float,Vector2,Vector3,Vector4";


class FloatNode
{
    constructor()
    {
        this.addOutput("Value", "Float");
        
        this.properties = {
            panel: [
                {
                    value: 0.0,
                    disabled: false,
                }
            ],
            outputType: "Float",
            output: {}
        };
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].value = Number(data.Value);
    }

    onExecute()
    {
        this.properties.output = {
            "Value": String(this.properties.panel[0].value)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Float";
    }
}
LiteGraph.registerNodeType("Input/Float", FloatNode);

class Vector2Node
{
    constructor()
    {
        this.addOutput("Value", "Vector2");

        this.addInput("X", "Float");
        this.addInput("Y", "Float");
        
        this.properties = {
            panel: [
                { x: 0.0, disabled: false },
                { y: 0.0, disabled: false }
            ],
            outputType: "Vector2",
            output: {}
        };

        this.defaults = [
            { name: "x", value: 0.0 },
            { name: "y", value: 0.0 }
        ];
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].x = Number(data.Value.X);
        this.properties.panel[0].y = Number(data.Value.Y);
    }

    onExecute()
    {
        this.properties.output = {
            "Value": {
                "X": String(this.properties.panel[0].x),
                "Y": String(this.properties.panel[0].y)
            }
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        if(connection == LiteGraph.OUTPUT || !link_info)
            return;

        this.properties.panel[slot].disabled = connected;

        if(this.onSelected)
            this.onSelected();
    }

    static get title()
    {
        return "Vector2";
    }
}
LiteGraph.registerNodeType("Input/Vector2", Vector2Node);

class Vector3Node
{
    constructor()
    {
        this.addOutput("Value", "Vector3");

        this.addInput("X", "Float");
        this.addInput("Y", "Float");
        this.addInput("Z", "Float");
        
        this.properties = {
            panel: [
                { x: 0.0, disabled: false },
                { y: 0.0, disabled: false },
                { z: 0.0, disabled: false }
            ],
            outputType: "Vector3",
            output: {}
        };

        this.defaults = [
            { name: "x", value: 0.0 },
            { name: "y", value: 0.0 },
            { name: "z", value: 0.0 }
        ];
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].x = Number(data.Value.X);
        this.properties.panel[1].y = Number(data.Value.Y);
        this.properties.panel[2].z = Number(data.Value.Z);
    }

    onExecute()
    {
        this.properties.output = {
            "Value": {
                "X": String(this.properties.panel[0].x),
                "Y": String(this.properties.panel[1].y),
                "Z": String(this.properties.panel[2].z)
            }
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        if(connection == LiteGraph.OUTPUT || !link_info)
            return;

        this.properties.panel[slot].disabled = connected;

        if(this.onSelected)
            this.onSelected();
    }

    static get title()
    {
        return "Vector3";
    }
}
LiteGraph.registerNodeType("Input/Vector3", Vector3Node);

class Vector4Node
{
    constructor()
    {
        this.addOutput("Value", "Vector4");

        this.addInput("X", "Float");
        this.addInput("Y", "Float");
        this.addInput("Z", "Float");
        this.addInput("W", "Float");
        
        this.properties = {
            panel: [
                { x: 0.0, disabled: false },
                { y: 0.0, disabled: false },
                { z: 0.0, disabled: false },
                { w: 0.0, disabled: false }
            ],
            outputType: "Vector4",
            output: {}
        };

        this.defaults = [
            { name: "x", value: 0.0 },
            { name: "y", value: 0.0 },
            { name: "z", value: 0.0 },
            { name: "w", value: 0.0 }
        ];
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].x = Number(data.Value.X);
        this.properties.panel[1].y = Number(data.Value.Y);
        this.properties.panel[2].z = Number(data.Value.Z);
        this.properties.panel[3].w = Number(data.Value.W);
    }

    onExecute()
    {
        this.properties.output = {
            "Value": {
                "X": String(this.properties.panel[0].x),
                "Y": String(this.properties.panel[1].y),
                "Z": String(this.properties.panel[2].z),
                "W": String(this.properties.panel[3].w)
            }
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        if(connection == LiteGraph.OUTPUT || !link_info)
            return;

        this.properties.panel[slot].disabled = connected;

        if(this.onSelected)
            this.onSelected();
    }

    static get title()
    {
        return "Vector4";
    }
}
LiteGraph.registerNodeType("Input/Vector4", Vector4Node);

class BreakVector2Node
{
    constructor()
    {
        this.addInput("Value", "Vector2");

        this.addOutput("X", "Float");
        this.addOutput("Y", "Float");
        
        this.properties = {
            panel: [],
            outputType: "BreakVector2",
            output: {}
        };
    }

    loadFromCPP(data) 
    {

    }

    onExecute()
    {

    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Break Vector2";
    }
}
LiteGraph.registerNodeType("Vector/BreakVector2", BreakVector2Node);

class BreakVector3Node
{
    constructor()
    {
        this.addInput("Value", "Vector3");

        this.addOutput("X", "Float");
        this.addOutput("Y", "Float");
        this.addOutput("Z", "Float");
        
        this.properties = {
            panel: [],
            outputType: "BreakVector3",
            output: {}
        };
    }

    loadFromCPP(data) 
    {

    }

    onExecute()
    {

    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Break Vector3";
    }
}
LiteGraph.registerNodeType("Vector/BreakVector3", BreakVector3Node);

class BreakVector4Node
{
    constructor()
    {
        this.addInput("Value", "Vector4");

        this.addOutput("X", "Float");
        this.addOutput("Y", "Float");
        this.addOutput("Z", "Float");
        this.addOutput("W", "Float");
        
        this.properties = {
            panel: [],
            outputType: "BreakVector4",
            output: {}
        };
    }

    loadFromCPP(data) 
    {

    }

    onExecute()
    {

    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Break Vector4";
    }
}
LiteGraph.registerNodeType("Vector/BreakVector4", BreakVector4Node);


function MathOnConnectInput(InNode, inputSlot, outputType, output, outputNode, outputSlot) {
    if(InNode.properties.excludeSlots[inputSlot])
        return true;

    return !(InNode.properties.bslotHasType && outputType != InNode.properties.panel[0].type);
}

function MathOnConnectionsChange(InNode, connection, slot, connected, link_info) {
    if(connection == LiteGraph.OUTPUT)
    {
        InNode.properties.bConnectedOutput = connected;   
        return;
    }

    if(!InNode.properties.excludeSlots[slot])
    {
        InNode.properties.bConnected[slot] = connected;

        if(!connected)
        {
            let disconnected = true;

            for(const i in InNode.properties.bConnected)
            {
                disconnected &&= !InNode.properties.bConnected[i];
            }

            if(disconnected)
            {
                InNode.properties.bslotHasType = false;
                const defType = InNode.properties.defaultType;

                if(!InNode.properties.bFixedOutput)
                {
                    InNode.disconnectOutput(0);
                    InNode.setOutputDataType(0, defType);
                }

                InNode.properties.panel[0].type = defType;
            }
        }
        else if(!InNode.properties.bslotHasType)
        {
            InNode.properties.bslotHasType = true;

            const origin = InNode.graph.getNodeById(link_info.origin_id);
            const oType = origin.getOutputInfo(link_info.origin_slot).type;

            if(!InNode.properties.bFixedOutput)
            {
                if(InNode.properties.bConnectedOutput && oType != InNode.getOutputInfo(0).type)
                    InNode.disconnectOutput(0);
                
                InNode.setOutputDataType(0, oType);
            }

            InNode.properties.panel[0].type = oType;
        }    
    }
    
    if(InNode.onSelected)
        InNode.onSelected();
}

function MathPanelTypeChangeCallback(node, event) {
    if(node.properties.bFixedOutput)
        return;

    node.properties.bslotHasType = true;
    node.setOutputDataType(0, event.value);

    if(event.value != node.properties.prevType) {
        for(const i in node.properties.bConnected) {
            if(node.properties.bConnected[i] && !node.properties.excludeSlots[i]) {
                node.disconnectInput(Number(i)); 
            }
        }

        node.disconnectOutput(0);
        node.properties.prevType = event.value;
    }

    node.onSelected();
    return "PANEL_TERMINATE";
}


class MathAdd
{
    constructor()
    {
        this.addInput("A", ALL_DATA_TYPES);
        this.addInput("B", ALL_DATA_TYPES);

        this.addOutput("", 0);
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Float",
                    disabled: false,
                    options: {
                        options: {

                            "Float": "Float",
                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathAdd",
            output: {},

            bslotHasType: false,
            bConnected: [false, false],
            bConnectedOutput: false,
            bFixedOutput: false,
            defaultType: "Float",
            prevType: "Float",
            excludeSlots: [false, false]
        };
    }
	
    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }
    
    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Add";
    }
}
LiteGraph.registerNodeType("Math/Add", MathAdd);

class MathSubtract
{
    constructor()
    {
        this.addInput("A", ALL_DATA_TYPES);
        this.addInput("B", ALL_DATA_TYPES);

        this.addOutput("", 0);
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Float",
                    disabled: false,
                    options: {
                        options: {

                            "Float": "Float",
                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathSub",
            output: {},

            bslotHasType: false,
            bConnected: [false, false],
            bConnectedOutput: false,
            bFixedOutput: false,
            defaultType: "Float",
            prevType: "Float",
            excludeSlots: [false, false]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }
    
    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Subtract";
    }
}
LiteGraph.registerNodeType("Math/Sub", MathSubtract);

class MathMultiply
{
    constructor()
    {
        this.addInput("A", "Float,Vector3,Vector4");
        this.addInput("B", "Float");

        this.addOutput("", "Float,Vector3,Vector4");
        
        this.properties = {
            panel: [],
            outputType: "MathMul",
            output: {},
        };
    }

    loadFromCPP(data) 
    {
    }

    onExecute()
    {
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Multiply";
    }
}
LiteGraph.registerNodeType("Math/Mul", MathMultiply);

class MathDivide
{
    constructor()
    {
        this.addInput("A", "Float");
        this.addInput("B", "Float");

        this.addOutput("", "Float");
        
        this.properties = {
            panel: [],
            outputType: "MathDiv",
            output: {},
        };
    }

    loadFromCPP(data) 
    {
    }

    onExecute()
    {
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Divide";
    }
}
LiteGraph.registerNodeType("Math/Div", MathDivide);

class MathMinimum
{
    constructor()
    {
        this.addInput("A", "Float");
        this.addInput("B", "Float");

        this.addOutput("", "Float");
        
        this.properties = {
            panel: [],
            outputType: "MathMin",
            output: {},
        };
    }

    loadFromCPP(data) 
    {
    }

    onExecute()
    {
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Min";
    }
}
LiteGraph.registerNodeType("Math/Min", MathMinimum);

class MathMaximum
{
    constructor()
    {
        this.addInput("A", "Float");
        this.addInput("B", "Float");

        this.addOutput("", "Float");
        
        this.properties = {
            panel: [],
            outputType: "MathMax",
            output: {},
        };
    }

    loadFromCPP(data) 
    {
    }

    onExecute()
    {
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Max";
    }
}
LiteGraph.registerNodeType("Math/Max", MathMaximum);

class MathPower
{
    constructor()
    {
        this.addInput("Value", "Float");
        this.addInput("Power", "Float");

        this.addOutput("", "Float");
        
        this.properties = {
            panel: [],
            outputType: "MathPow",
            output: {},
        };
    }

    loadFromCPP(data) 
    {
    }

    onExecute()
    {
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Power";
    }
}
LiteGraph.registerNodeType("Math/Pow", MathPower);

class MathLerp
{
    constructor()
    {
        this.addInput("A", "Float");
        this.addInput("B", "Float");
        this.addInput("Alpha", "Float");

        this.addOutput("", "Float");
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Float",
                    disabled: false,
                    options: {
                        options: {

                            "Float": "Float",
                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathLerp",
            output: {},

            bslotHasType: false,
            bConnected: [false, false, false],
            bConnectedOutput: false,
            bFixedOutput: false,
            defaultType: "Float",
            prevType: "Float",
            excludeSlots: [false, false, true]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Lerp";
    }
}
LiteGraph.registerNodeType("Math/Lerp", MathLerp);

class MathClamp
{
    constructor()
    {
        this.addInput("Value", "Float");
        this.addInput("Min", "Float");
        this.addInput("Max", "Float");

        this.addOutput("", "Float");
        
        this.properties = {
            panel: [],
            outputType: "MathClamp",
            output: {},
        };
    }

    loadFromCPP(data) 
    {
    }

    onExecute()
    {
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Clamp";
    }
}
LiteGraph.registerNodeType("Math/Clamp", MathClamp);

function RegisterSingleInputNode(name, cppName, inputName = "Value", inputType = "Float", outputType = "Float")
{
    class NodeReg
    {
        constructor()
        {
            this.addInput(inputName, inputType);

            this.addOutput("", outputType);

            this.properties = {
                panel: [],
                outputType: cppName,
                output: {},
            };
        }

        loadFromCPP(data) 
        {
        }

        onExecute()
        {
        }

        onSelected()
        {
            ProcessJS("RequestNodeDetailPanel", this);
        }

        static get title()
        {
            return name;
        }
    }
    LiteGraph.registerNodeType("Math/" + name, NodeReg);
}

RegisterSingleInputNode("ToDegrees", "MathToDegrees", "Radians");
RegisterSingleInputNode("ToRadians", "MathToRadians", "Degrees");
RegisterSingleInputNode("Exponent", "MathExponent");
RegisterSingleInputNode("LogE", "MathLogE");
RegisterSingleInputNode("Sqrt", "MathSqrt");
RegisterSingleInputNode("Absolute", "MathAbs");
RegisterSingleInputNode("Floor", "MathFloor");
RegisterSingleInputNode("Ceil", "MathCeil");
RegisterSingleInputNode("Round", "MathRound");
RegisterSingleInputNode("Mod", "MathMod");
RegisterSingleInputNode("Truncate", "MathTruncate");

class MathVectorLength
{
    constructor()
    {
        this.addInput("Value", "Vector2");

        this.addOutput("", "Float");
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Vector2",
                    disabled: false,
                    options: {
                        options: {

                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathVecLength",
            output: {},

            bslotHasType: false,
            bConnected: [false],
            bConnectedOutput: false,
            bFixedOutput: true,
            defaultType: "Vector2",
            prevType: "Vector2",
            excludeSlots: [false]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Vector Length";
    }
}
LiteGraph.registerNodeType("Vector/Length", MathVectorLength);

class MathVectorNormalize
{
    constructor()
    {
        this.addInput("Value", "Vector2");

        this.addOutput("", "Vector2");
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Vector2",
                    disabled: false,
                    options: {
                        options: {

                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathVecNormalize",
            output: {},

            bslotHasType: false,
            bConnected: [false],
            bConnectedOutput: false,
            bFixedOutput: true,
            defaultType: "Vector2",
            prevType: "Vector2",
            excludeSlots: [false]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Vector Normalize";
    }
}
LiteGraph.registerNodeType("Vector/Normalize", MathVectorNormalize);

class MathVectorDistance
{
    constructor()
    {
        this.addInput("A", "Vector2");
        this.addInput("B", "Vector2");

        this.addOutput("", "Float");
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Vector2",
                    disabled: false,
                    options: {
                        options: {

                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathVecDistance",
            output: {},

            bslotHasType: false,
            bConnected: [false],
            bConnectedOutput: false,
            bFixedOutput: true,
            defaultType: "Vector2",
            prevType: "Vector2",
            excludeSlots: [false]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }
    
    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Vector Distance";
    }
}
LiteGraph.registerNodeType("Vector/Distance", MathVectorDistance);

class MathVectorDot
{
    constructor()
    {
        this.addInput("A", "Vector2");
        this.addInput("B", "Vector2");

        this.addOutput("", "Float");
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Vector2",
                    disabled: false,
                    options: {
                        options: {

                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathVecDot",
            output: {},

            bslotHasType: false,
            bConnected: [false, false],
            bConnectedOutput: false,
            bFixedOutput: true,
            defaultType: "Vector2",
            prevType: "Vector2",
            excludeSlots: [false, false]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }
    
    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Vector Dot";
    }
}
LiteGraph.registerNodeType("Vector/Dot", MathVectorDot);

class MathVectorCross
{
    constructor()
    {
        this.addInput("A", "Vector3");
        this.addInput("B", "Vector3");

        this.addOutput("", "Vector3");
        
        this.properties = {
            panel: [],
            outputType: "MathVecCross",
            output: {},
        };
    }

    loadFromCPP(data) 
    {
    }

    onExecute()
    {
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }
    
    static get title()
    {
        return "Vector Cross";
    }
}
LiteGraph.registerNodeType("Vector/Cross", MathVectorCross);

class MathVectorReflect
{
    constructor()
    {
        this.addInput("Incident", "Vector2");
        this.addInput("Normal", "Vector2");

        this.addOutput("", "Vector3");
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Vector2",
                    disabled: false,
                    options: {
                        options: {

                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathVecReflect",
            output: {},

            bslotHasType: false,
            bConnected: [false, false],
            bConnectedOutput: false,
            bFixedOutput: true,
            defaultType: "Vector2",
            prevType: "Vector2",
            excludeSlots: [false, false]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }
    
    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Vector Reflect";
    }   
}
LiteGraph.registerNodeType("Vector/Reflect", MathVectorReflect);

class MathVectorRefract
{
    constructor()
    {
        this.addInput("Incident", "Vector2");
        this.addInput("Normal", "Vector2");
        this.addInput("Eta", "Float");

        this.addOutput("", "Vector2");
        
        const that = this;

        this.properties = {
            panel: [
                {
                    type: "Vector2",
                    disabled: false,
                    options: {
                        options: {

                            "Vector2": "Vector2",
                            "Vector3": "Vector3",
                            "Vector4": "Vector4"
                        }
                    },
                    callback: function(event) {
                        return MathPanelTypeChangeCallback(that, event);
                    }
                }
            ],
            outputType: "MathVecRefract",
            output: {},

            bslotHasType: false,
            bConnected: [false, false, false],
            bConnectedOutput: false,
            bFixedOutput: true,
            defaultType: "Vector2",
            prevType: "Vector2",
            excludeSlots: [false, false, false]
        };
    }

    loadFromCPP(data) 
    {
        this.properties.panel[0].type = data.type;
        this.onSelected();
    }

    onExecute()
    {
        this.properties.output = {
            "type": String(this.properties.panel[0].type),
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }
    
    onConnectInput(inputSlot, outputType, output, outputNode, outputSlot)
    {
        return MathOnConnectInput(this, inputSlot, outputType, output, outputNode, outputSlot);
    }

    onConnectionsChange(connection, slot, connected, link_info)
    {
        MathOnConnectionsChange(this, connection, slot, connected, link_info);
    }

    static get title()
    {
        return "Vector Refract";
    }   
}
LiteGraph.registerNodeType("Vector/Refract", MathVectorRefract);

function RegisterTrignometricNode(name, cppName, bArc = false)
{
    class TrigNode
    {
        constructor()
        {
            this.addInput(bArc ? "Value" : "Angle", "Float");
            this.addOutput(bArc ? "Angle" : "Value", "Float");
            
            this.properties = {
                panel: [],
                outputType: cppName,
                output: {},
            };
        }

        loadFromCPP(data) 
        {
        }

        onExecute()
        {
        }

        onSelected()
        {
            ProcessJS("RequestNodeDetailPanel", this);
        }

        static get title()
        {
            return name;
        }
    }
    LiteGraph.registerNodeType("Trigonometry/" + name, TrigNode);
}

RegisterTrignometricNode("Sin"      , "MathTrigSin");
RegisterTrignometricNode("Cos"      , "MathTrigCos");
RegisterTrignometricNode("Tan"      , "MathTrigTan");
RegisterTrignometricNode("ArcSin"   , "MathTrigASin", true);
RegisterTrignometricNode("ArcCos"   , "MathTrigACos", true);
RegisterTrignometricNode("ArcTan"   , "MathTrigATan", true);
RegisterTrignometricNode("Sinh"     , "MathTrigSinh");
RegisterTrignometricNode("Cosh"     , "MathTrigCosh");
RegisterTrignometricNode("Tanh"     , "MathTrigTanh");
RegisterTrignometricNode("ArcSinh"  , "MathTrigASinh", true);
RegisterTrignometricNode("ArcCosh"  , "MathTrigACosh", true);
RegisterTrignometricNode("ArcTanh"  , "MathTrigATanh", true);