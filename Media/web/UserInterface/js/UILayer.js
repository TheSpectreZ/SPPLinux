export class UILayer {
    
    constructor(InManager, InMouseLock = false) {
        this.bMouseLock = InMouseLock;
        this.Manager = InManager;
        this.previousLayer = null;
    }

    RequiresMouseLock() {
        return this.bMouseLock;
    }

    NavigateTo(InLayer) {
        this.Manager.Navigate(this, InLayer);
    }
}

export class GameUILayer extends UILayer
{
    constructor(InManager, InMouseLock = false) {
        super(InManager, InMouseLock);
        this.bActive = true;
        this.bIsShown = false;
    }

    ToggleLayer() {
        if(!this.bIsShown) {
            this.Show();
        } else {
            this.Hide();
        }
    }

    Show() {
        if(!this.bIsShown) {
            this.Manager.AddUI(this);
            this.bIsShown = true;
        }
    }

    Hide() {
        if(this.bIsShown) {
            this.Manager.RemoveUI(this);
            this.bIsShown = false;
        }
    }

    Activate(bBlockInput = false) {
        this.bActive = true;

        if(bBlockInput) {
            this.Manager.Layers.forEach(layer => {
                if(layer != this) {
                    layer.Deactivate();
                }
            });
        }
    }

    Deactivate(bBlockInput = false) {
        this.bActive = false;

        if(bBlockInput) {
            this.Manager.Layers.forEach(layer => {
                if(layer != this) {
                    layer.Activate();
                }
            });
        }
    }

    NavigateTo(InLayer) { 
        super.NavigateTo(InLayer);

        this.Hide();
        InLayer.Show();

        if(InLayer.RequireFooter())
            GameUILayer.prototype.GetFooter().Show();
        else
            GameUILayer.prototype.GetFooter().Hide();

        if(InLayer.RequireTitle())
            GameUILayer.prototype.GetTitle().Show();            
        else
            GameUILayer.prototype.GetTitle().Hide();
    }

    RequireFooter() {
        return false;
    }

    RequireTitle() {
        return false;
    }
}