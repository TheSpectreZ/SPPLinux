import json

NodeTemplate = '''

function LGraph_ShaderConstant()
{
    this.addOutput("","float");

    this.properties = {
        type: "float",
        value: 0
    };

    this.addWidget("combo","type","float",null, { values: GLSL_types_const, property: "type" } );
    this.updateWidgets();
}

LGraphShaderConstant.title = "const";

LGraphShaderConstant.prototype.getTitle = function()
{
    if(this.flags.collapsed)
        return valueToGLSL( this.properties.value, this.properties.type, 2 );
    return "Const";
}

'''

def OutputNode(InNode):
    print(curNode)

# Open and read the JSON file
with open('nodejson.txt', 'r') as file:
    data = json.load(file)
    
    for curNode in data['Nodes']:
        OutputNode(curNode)
        

# Pretty Printing JSON string back
#print(json.dumps(data, indent = 4, sort_keys=True))

#with open(self.filename, 'wb') as f:
#    f.write(res)

# function LGraphShaderConstant()
# {
    # this.addOutput("","float");

    # this.properties = {
        # type: "float",
        # value: 0
    # };

    # this.addWidget("combo","type","float",null, { values: GLSL_types_const, property: "type" } );
    # this.updateWidgets();
# }

# LGraphShaderConstant.title = "const";

# LGraphShaderConstant.prototype.getTitle = function()
# {
    # if(this.flags.collapsed)
        # return valueToGLSL( this.properties.value, this.properties.type, 2 );
    # return "Const";
# }

# class RandomFloatNode
# {
    # constructor()
    # {
        # this.addOutput("Value", "Float");

        # this.properties = {
            # panel: [],
            # outputType: "SH_RandomFloat",
            # output: {}
        # };
    # }

    # loadFromCPP(data)
    # {

    # }

    # onExecute()
    # {

    # }

    # onSelected()
    # {
        # ProcessJS("RequestNodeDetailPanel", this);
    # }

    # static get title()
    # {
        # return "Random Float";
    # }
# }
# LiteGraph.registerNodeType("Input/RandomFloat", RandomFloatNode);