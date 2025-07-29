window.ActivePopUp = null;

class PopUp
{
    constructor() {
        this.divElement = null;
    }

    Open(FromElement, MenuList) {

        let divElement = document.createElement("div");
        let rect = FromElement.getBoundingClientRect();

        //rect.right, rect.bottom
        divElement.style.position = "absolute";
        divElement.style.top = rect.bottom.toString() + "px";
        divElement.style.left = rect.left.toString() + "px";
       // divElement.style.border = "1px solid darkgrey";
        divElement.style.backgroundColor = "black";
        divElement.style.padding = "5px 0px 5px 0px";
        divElement.style.borderRadius = "5px";
        divElement.style.zIndex = 100;
        
        //divElement.style.width = "100px";
        //divElement.style.width = "100px";
        //div.absolute {
        //    position: absolute;
        //    top: 80px;
        //    right: 0;
        //    width: 200px;
        //    height: 100px;
        //    border: 3px solid #73AD21;
        //}

        for (var i = 0; i < MenuList.length; i++) {
            const curItem = MenuList[i];
            //curItem.Name
            //curItem.Selected
            let newItem = document.createElement("div");
            newItem.innerHTML = curItem.Name;
            newItem.style.padding = "0px 10px 0px 10px";
            newItem.style.margin = "7px 0px 7px 0px";
            newItem.className = "PopUp-Item";

            let _i = i;
            newItem.onclick = function () {
                if (curItem.Selected) {
                    curItem.Selected(_i);
                }
                ClosePopups();
            };

            divElement.appendChild(newItem);
        }

        document.body.appendChild(divElement);

        this.divElement = divElement;
    }

    Close() {
        this.divElement.remove();
    }
}

function ClosePopups() {
    if (window.ActivePopUp) {
        window.ActivePopUp.Close();
        window.ActivePopUp = null;
    }
}

function OpenPop(FromElement, MenuList) {
    ClosePopups();

    window.ActivePopUp = new PopUp();
    window.ActivePopUp.Open(FromElement, MenuList)    
}

document.body.addEventListener("click", function (evt) {
    //console.dir(this);
    //note evt.target can be a nested element, not the body element, resulting in misfires
    //console.log(evt.target);
});

window.OpenPop = OpenPop;
