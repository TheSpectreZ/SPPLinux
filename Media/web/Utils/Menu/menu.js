const ALL_ITEM_CONTAINERS = [];

function CreateHeaderMenu(config, parent) {   
    const root = document.createElement("div");
    root.classList.add("Header-Root");
    
    const Id = config.Id ? config.Id + "-" : "";

    for(const i in config.classList) {
        root.classList.add( config.classList[i] );
    }

    parent.appendChild(root);

    for(const i in config.MenuGroup) {
        const name = config.MenuGroup[i].name;
        const items = config.MenuGroup[i].items;

        const menuContainer = document.createElement("div");

        const itemContainer = document.createElement("div");
        itemContainer.classList.add("Header-Menu-ItemContainer");

        ALL_ITEM_CONTAINERS.push(itemContainer);
        
        for(const j in items) {
            const iName = items[j].name;
            const func = items[j].func;

            const itemName = document.createElement("div");
            itemName.classList.add("Header-Menu-Item");
            itemName.id = Id + iName;
            itemName.innerHTML = iName;

            if(func)
            {
                itemName.onclick = func;
            }

            itemContainer.appendChild(itemName);
        }
        
        const menuName = document.createElement("div");
        menuName.classList.add("Header-Menu-Name");
        menuName.innerHTML = name;
        
        menuName.onclick = function(e) {
            ALL_ITEM_CONTAINERS.forEach(function(e) {
                e.classList.remove("active");
            });

            itemContainer.classList.toggle("active");
        }

        menuContainer.appendChild(menuName);
        menuContainer.appendChild(itemContainer);

        root.appendChild(menuContainer);
    }

    for(const i in config.Menu) {
        const name = config.Menu[i].name;
        const func = config.Menu[i].func;

        const itemName = document.createElement("div");
        itemName.classList.add("Header-Menu-Name");
        itemName.innerHTML = name;
        itemName.id = Id + name;

        if(func)
        {
            itemName.onclick = func;
        }

        itemName.onmouseenter = function() {
            ALL_ITEM_CONTAINERS.forEach(function(e) {
                e.classList.remove("active");
            });
        }

        root.appendChild(itemName);
    }

    return root;
}

document.addEventListener("click", function(e) {
    if(e.target.classList.contains("Header-Menu-Name"))
            return;
        
    ALL_ITEM_CONTAINERS.forEach(function(e) {
        e.classList.remove("active");
    });
})