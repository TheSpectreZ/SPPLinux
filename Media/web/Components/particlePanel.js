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

let ParticlePanelInstance = {};

function InitializeParticlePanel(width, height)
{
    const Inst = {
        root: document.getElementById("PP_Root"),
        width: width,
        height: height,
        current: null,
    };

    ParticlePanelInstance = Inst;
}
window["InitializeParticlePanel"] = InitializeParticlePanel;

function OnResizeParticlePanel(width, height) {
        
    ParticlePanelInstance.width = width;
    ParticlePanelInstance.height = height;

    if(ParticlePanelInstance.current)
    {
        ParticlePanelInstance.current.style.width = width + "px";
        ParticlePanelInstance.current.style.height = height + "px";
    }
}
window["OnResizeParticlePanel"] = OnResizeParticlePanel;

const NodeFuncs = {};

function RequestNodeDetailPanel(node) {

    if(!node.properties.panel)
    {
        console.error("Selected Node doesn't have panel properties");
        return;
    }

    if(ParticlePanelInstance.current) {
        ParticlePanelInstance.root.removeChild(ParticlePanelInstance.current.parentNode);
        ParticlePanelInstance.current = null;
    }

    const div = document.createElement("div");
    ParticlePanelInstance.root.appendChild(div);

    const pane = new Tweakpane.Pane({
        container: div,
        title: node.title,
    });
    
    for(const i in node.properties.panel) {
        const v = node.properties.panel[i];

        const name = Object.keys(v)[0];
        const options = v.options ? v.options : {};

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

    for(const i in node.properties.buttons)
    {
        const b = node.properties.buttons[i];

        const button = pane.addButton({
            title: b.title,
            label: b.label
        });

        for(const j in b.callback)
        {
            button.on('click', function(event){
                b.callback[j](event);
            });
        }
    }
    

    pane.element.style.width = ParticlePanelInstance.width + "px";
    pane.element.style.height = ParticlePanelInstance.height + "px";

    ParticlePanelInstance.current = pane.element;
}
window["RequestNodeDetailPanel"] = RequestNodeDetailPanel;