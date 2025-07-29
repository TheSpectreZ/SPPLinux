
export class UIManager {    
    constructor() {
        this.Layers = [];
        this.CurrentLayer = null;
    }

    AddUI(InUI) {
        this.Layers.push(InUI);
        this.SendMouseLockOut();
    }
    
    RemoveUI(InUI) {
        const index = this.Layers.indexOf(InUI);
        if (index > -1) { // only splice array when item is found
            this.Layers.splice(index, 1); // 2nd parameter means remove one item only
            this.SendMouseLockOut();
        }
    }
    
    RequiresMouseLock() {
        if( this.Layers.length > 0 )
            return this.Layers[this.Layers.length - 1].RequiresMouseLock();
        return false;
    }
    
    SendMouseLockOut() {
        window.InvokeNative("MouseLock", this.RequiresMouseLock() ? 1 : 0 );
    }

    Navigate(From, To) {

        if(this.CurrentLayer == null || To != this.CurrentLayer.previousLayer)
        {
            To.previousLayer = From;
        }

        this.CurrentLayer = To;
    }

    Back() {
        if(this.CurrentLayer == null)
            return;

        this.CurrentLayer.NavigateTo(this.CurrentLayer.previousLayer);
    }
}