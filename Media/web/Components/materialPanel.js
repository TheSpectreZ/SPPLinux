if(!window.InvokeNative) {
    window.InvokeNative = function(InFuncName, ...theArgs) {
        console.log("No Native Invoke: " + JSON.stringify({func: InFuncName, args: theArgs }));
    }
}

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

let MaterialPanelInstance = {};

function InitializeMaterialPanel(width, height) {
    
    const Inst = {
        root: document.getElementById("MP_Root"),
        width: width,
        height: height,
        current: null,
    };
    
    MaterialPanelInstance = Inst;
}
window["InitializeMaterialPanel"] = InitializeMaterialPanel;

function OnResizeMaterialPanel(width, height) {
    
    MaterialPanelInstance.width = width;
    MaterialPanelInstance.height = height;

    if(MaterialPanelInstance.current == null)
        return;
    
    MaterialPanelInstance.current.style.width = width + "px";
    MaterialPanelInstance.current.style.height = height + "px";
}
window["OnResizeMaterialPanel"] = OnResizeMaterialPanel;

const NodeFuncs = {};

function RequestNodeDetailPanel(node) {
    
    if(!node.properties.panel)
    {
        console.error("Selected Node doesn't have panel properties");
        return;
    }

    if(MaterialPanelInstance.current) {
        MaterialPanelInstance.root.removeChild(MaterialPanelInstance.current.parentNode);
        MaterialPanelInstance.current = null;
    }

    const div = document.createElement("div");
    MaterialPanelInstance.root.appendChild(div);

    const pane = new Tweakpane.Pane({
        container: div, 
        title: node.title 
    });
    
    if(NodeFuncs[node.type])
    {
        NodeFuncs[node.type](node, pane);
    }
    else 
    {
        for(const i in node.properties.panel) {
            const v = node.properties.panel[i];

            const name = Object.keys(v)[0];
            const options = v.options ? v.options : {}
            
            const input = pane.addInput(node.properties.panel[i], name, options);

            input.on('change', function(event){
                const prop = node.properties.panel[i];
                if(prop.callback)
                {
                    if(prop.callback(event) == "PANEL_TERMINATE")
                        return;
                }
            });

            input.disabled = v.disabled ? v.disabled : false;
        }

        for(const i in node.properties.buttons) {
            const b = node.properties.buttons[i];

            const button = pane.addButton({
                title: b.title,
                label: b.label
            });

            for(const j in b.callback) {

                button.on(b.callback[j].type, function(event) {
                    b.callback[j].func();
                });
            }
        }
    }

    pane.element.style.width = MaterialPanelInstance.width + "px";
    pane.element.style.height = MaterialPanelInstance.height + "px";

    MaterialPanelInstance.current = pane.element;
}
window["RequestNodeDetailPanel"] = RequestNodeDetailPanel;