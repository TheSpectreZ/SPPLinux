/**
 * Creates a tree node element based on the provided configuration.
 *
 * @param {Object} config - Configuration for the tree node.
 * @param {string} config.name - Text to display for the tree node.
 * @param {Function} [config.toggleClickCallback] 
 * @param {Function} [config.titleClickCallback] 
 * @param {Function} [config.titleContextCallback] 
 * @param {Function} [config.titleDblClickCallback] 
 * @param {Function} [config.dropCallback]
 * @param {Object} config.userdata;
 * @returns {HTMLElement} The created tree node element.
 */
function createTreeNode(config, bRoot = false) {

    const node = document.createElement("div");
    node.classList.add(!bRoot ? "TreeView-Node" : "TreeView-Root");
    node.draggable = true;
    node.userdata = config.userdata;
    node.dropCallback = config.dropCallback;

    node.addEventListener("dragstart", function(event){
        event.target.classList.add("dragging");
    });

    node.addEventListener("dragend", function(event){
        event.target.classList.remove("dragging");
    });

    const header = document.createElement("div");
    header.classList.add("TreeView-NodeHeader");
    node.appendChild(header);
    
    const content = document.createElement("div");
    content.classList.add("TreeView-NodeContent");
    node.appendChild(content);

    if(!bRoot || config.enableToggle)
    {
        const toggle = document.createElement("div");
        toggle.classList.add("TreeView-NodeToggle");
        toggle.textContent = "▶";
        toggle.toggleClickCallback = config.toggleClickCallback;
        header.appendChild(toggle);

        toggle.addEventListener("click", function(event) {
            event.target.classList.toggle("activated");

            if (event.target.toggleClickCallback)
                event.target.toggleClickCallback(event, node, node.userdata);

            content.classList.toggle("activated");
        });
    }
    else
    {
        content.classList.toggle("activated");
    }
    
    const title = document.createElement("div");
    title.classList.add("TreeView-NodeTitle");
    title.textContent = config.name;
    title.titleClickCallback = config.titleClickCallback;
    title.titleContextCallback = config.titleContextCallback;
    title.titleDblClickCallback = config.titleDblClickCallback;
    header.appendChild(title);

    title.addEventListener("click", function(event){
        if (event.target.titleClickCallback)
            event.target.titleClickCallback(event, node, node.userdata);
    });
    
    title.addEventListener("dblclick", function(event){
        if (event.target.titleDblClickCallback)
            event.target.titleDblClickCallback(event, node, node.userdata);
    });
    
    title.addEventListener("contextmenu", function(event){
        if (event.target.titleContextCallback)
            event.target.titleContextCallback(event, node, node.userdata);
    });

    return node;
}

function getTreeNodeChildContainer(parent) {
    return parent.children[1];
}

function ToggleTreeNode(node) {
    node.children[0].children[0].classList.toggle("activated");
    node.children[1].classList.toggle("activated");
}

document.addEventListener("dragover", function(event){
    event.preventDefault();
});

document.addEventListener("drop", function(event){
    event.preventDefault();

    const node = document.querySelector(".dragging");
    const target = event.target.closest(".TreeView-Node");

    if(target && node && target != node) {
        node.remove();
        
        
        if(node.dropCallback)
        {
            node.dropCallback(node, target);
        }

        const container = getTreeNodeChildContainer(target)
        container.appendChild(node);
    }

    event.stopImmediatePropagation();
})