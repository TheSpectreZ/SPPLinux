class RandomFloatNode
{
    constructor()
    {
        this.addOutput("Value", "Float");

        this.properties = {
            panel: [],
            outputType: "SH_RandomFloat",
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
        return "Random Float";
    }
}
LiteGraph.registerNodeType("Input/RandomFloat", RandomFloatNode);

class RandomFloatRangeNode
{
    constructor()
    {
        this.addOutput("Value", "Float");

        this.addInput("Min", "Float");
        this.addInput("Max", "Float");

        this.properties = {
            panel: [
                {
                    min: 0.0,
                    disabled: false,
                },
                {
                    max: 1.0,
                    disabled: false,
                }
            ],
            outputType: "SH_RandomFloatRange",
            output: {}
        };

        this.size[0] = 200;
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].min = Number(data._min);
        this.properties.panel[1].max = Number(data._max);
    }

    onExecute()
    {        
        this.properties.output = {
            "_min": String(this.properties.panel[0].min),
            "_max": String(this.properties.panel[1].max)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Random Float Range";
    }
}
LiteGraph.registerNodeType("Input/RandomFloatRange", RandomFloatRangeNode);

class RandomVector2Node
{
    constructor()
    {
        this.addOutput("Value", "Vector2");

        this.properties = {
            panel: [
                {
                    PerComponentRandom: false,
                    disabled: false,
                }    
            ],
            outputType: "SH_RandomVector2",
            output: {}
        };
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].PerComponentRandom = Boolean(data._perComponentRandom);
    }

    onExecute()
    {
        this.properties.output = {
            "_perComponentRandom": String(this.properties.panel[0].PerComponentRandom)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Random Vector2";
    }
}
LiteGraph.registerNodeType("Input/RandomVector2", RandomVector2Node);

class RandomVector2RangeNode
{
    constructor()
    {
        this.addOutput("Value", "Vector2");

        this.addInput("Min", "Vector2");
        this.addInput("Max", "Vector2");

        this.properties = {
            panel: [
                {
                    min: {
                        x: 0.0,
                        y: 0.0
                    },
                    disabled: false,
                },
                {
                    max: {
                        x: 1.0,
                        y: 1.0
                    },
                    disabled: false,
                },
                {
                    PerComponentRandom: false,
                    disabled: false,
                }    
            ],
            outputType: "SH_RandomVector2Range",
            output: {}
        };

        this.size[0] = 200;
    }

    loadFromCPP(data)
    {   
        this.properties.panel[0].min.x = Number(data._min.X);
        this.properties.panel[0].min.y = Number(data._min.Y);
        
        this.properties.panel[1].max.x = Number(data._max.X);
        this.properties.panel[1].max.y = Number(data._max.Y);

        this.properties.panel[2].PerComponentRandom = Boolean(data._perComponentRandom);
    }

    onExecute()
    {
        this.properties.output = {
            "_min": {
                "X": String(this.properties.panel[0].min.x),
                "Y": String(this.properties.panel[0].min.y)
            },
            "_max":{
                "X": String(this.properties.panel[1].max.x),
                "Y": String(this.properties.panel[1].max.y)
            },
            "_perComponentRandom": String(this.properties.panel[2].PerComponentRandom)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Random Vector2 Range";
    }
}
LiteGraph.registerNodeType("Input/RandomVector2Range", RandomVector2RangeNode);

class RandomVector3Node
{
    constructor()
    {
        this.addOutput("Value", "Vector3");

        this.properties = {
            panel: [
                {
                    PerComponentRandom: false,
                    disabled: false,
                }   
            ],
            outputType: "SH_RandomVector3",
            output: {}
        };
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].PerComponentRandom = Boolean(data._perComponentRandom);
    }

    onExecute()
    {
        this.properties.output = {
            "_perComponentRandom": String(this.properties.panel[0].PerComponentRandom)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Random Vector3";
    }
}
LiteGraph.registerNodeType("Input/RandomVector3", RandomVector3Node);

class RandomVector3RangeNode
{
    constructor()
    {
        this.addOutput("Value", "Vector3"); 

        this.addInput("Min", "Vector3");
        this.addInput("Max", "Vector3");

        this.properties = {
            panel: [
                {
                    min: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0
                    },
                    disabled: false,
                },
                {
                    max: {
                        x: 1.0,
                        y: 1.0,
                        z: 1.0
                    },
                    disabled: false,
                },
                {
                    PerComponentRandom: false,
                    disabled: false,
                }    
            ],
            outputType: "SH_RandomVector3Range",
            output: {}
        };

        this.size[0] = 200;
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].min.x = Number(data._min.X);
        this.properties.panel[0].min.y = Number(data._min.Y);
        this.properties.panel[0].min.z = Number(data._min.Z);

        this.properties.panel[1].max.x = Number(data._max.X);
        this.properties.panel[1].max.y = Number(data._max.Y);
        this.properties.panel[1].max.z = Number(data._max.Z);

        this.properties.panel[2].PerComponentRandom = Boolean(data._perComponentRandom);
    }

    onExecute()
    {
        this.properties.output = {
            "_min": {
                "X": String(this.properties.panel[0].min.x),
                "Y": String(this.properties.panel[0].min.y),
                "Z": String(this.properties.panel[0].min.z)
            },
            "_max":{
                "X": String(this.properties.panel[1].max.x),
                "Y": String(this.properties.panel[1].max.y),
                "Z": String(this.properties.panel[1].max.z)
            },
            "_perComponentRandom": String(this.properties.panel[2].PerComponentRandom)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Random Vector3 Range";
    }
}
LiteGraph.registerNodeType("Input/RandomVector3Range", RandomVector3RangeNode);

class RandomVector4Node
{
    constructor()
    {
        this.addOutput("Value", "Vector4");

        this.properties = {
            panel: [
                {
                    PerComponentRandom: false,
                    disabled: false,
                }    
            ],
            outputType: "SH_RandomVector4",
            output: {}
        };
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].PerComponentRandom = Boolean(data._perComponentRandom);
    }

    onExecute()
    {
        this.properties.output = {
            "_perComponentRandom": String(this.properties.panel[0].PerComponentRandom)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Random Vector4";
    }
}
LiteGraph.registerNodeType("Input/RandomVector4", RandomVector4Node);

class RandomVector4RangeNode
{
    constructor()
    {
        this.addOutput("Value", "Vector4");

        this.addInput("Min", "Vector4");
        this.addInput("Max", "Vector4");

        this.properties = {
            panel: [
                {
                    min: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0,
                        w: 0.0
                    },
                    disabled: false,
                },
                {
                    max: {
                        x: 1.0,
                        y: 1.0,
                        z: 1.0,
                        w: 1.0
                    },
                    disabled: false,
                },
                {
                    PerComponentRandom: false,
                    disabled: false,
                }    
            ],
            outputType: "SH_RandomVector4Range",
            output: {}
        };

        this.size[0] = 200;
    }

    loadFromCPP(data)
    {
        this.properties.panel[0].min.x = Number(data._min.X);
        this.properties.panel[0].min.y = Number(data._min.Y);
        this.properties.panel[0].min.z = Number(data._min.Z);
        this.properties.panel[0].min.w = Number(data._min.W);

        this.properties.panel[1].max.x = Number(data._max.X);
        this.properties.panel[1].max.y = Number(data._max.Y);
        this.properties.panel[1].max.z = Number(data._max.Z);
        this.properties.panel[1].max.w = Number(data._max.W);

        this.properties.panel[2].PerComponentRandom = Boolean(data._perComponentRandom);
    }

    onExecute()
    {
        this.properties.output = {
            "_min": {
                "X": String(this.properties.panel[0].min.x),
                "Y": String(this.properties.panel[0].min.y),
                "Z": String(this.properties.panel[0].min.z),
                "W": String(this.properties.panel[0].min.w)
            },
            "_max":{
                "X": String(this.properties.panel[1].max.x),
                "Y": String(this.properties.panel[1].max.y),
                "Z": String(this.properties.panel[1].max.z),
                "W": String(this.properties.panel[1].max.w)
            },
            "_perComponentRandom": String(this.properties.panel[2].PerComponentRandom)
        };
    }

    onSelected()
    {
        ProcessJS("RequestNodeDetailPanel", this);
    }

    static get title()
    {
        return "Random Vector4 Range";
    }
}
LiteGraph.registerNodeType("Input/RandomVector4Range", RandomVector4RangeNode);

class WorldPosition
{
    constructor()
    {
        this.addOutput("", "Vector3");

        this.properties = {
            panel: [],
            outputType: "SH_WorldPosition",
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
        return "World Position";
    }
}
LiteGraph.registerNodeType("Input/WorldPosition", WorldPosition);