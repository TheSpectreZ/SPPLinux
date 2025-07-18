export class UIManager 
{  
    constructor(InManager) 
    {
        this.Manager = InManager;
        this.Layers = [];
        this.CurrentLayer = null;
    }

    AddUI(InUI) 
    {
        this.Layers.push(InUI);
        this.SendMouseLockOut();
    }

    RemoveUI(InUI) 
    {
        const index = this.Layers.indexOf(InUI);
        if(index > -1)
        {
            this.Layers.splice(index, 1);
            this.SendMouseLockOut();
        }
    }

    RequiresMouseLock() 
    {
        if(this.Layers.length > 0)
            return this.Layers[this.Layers.length - 1].RequireMouseLock();
        return false;
    }

    SendMouseLockOut()
    {
        window.InvokeNative("MouseLock", this.RequiresMouseLock() ? 1 : 0);
    }
}

export class UILayer
{
    constructor(InManager, InMouseLock = false)
    {
        this.Manager = InManager;
        this.PreviousLayer = null;
        this.bMouseLock = InMouseLock;
    }

    RequireMouseLock() 
    {
        return this.bMouseLock;
    }
}

export class ToggleableUILayer extends UILayer
{
    constructor(InManager, InMouseLock = false) 
    {
        super(InManager, InMouseLock);
        this.bIsShown = false;
    }

    Toggle() 
    {
        if(!this.bIsShown) 
            this.Show();
        else
            this.Hide();
    }

    Show() 
    {
        if(!this.bIsShown) 
        {
            this.Manager.AddUI(this);
            this.bIsShown = true;
        }
    }

    Hide() 
    {
        if(this.bIsShown) 
        {
            this.Manager.RemoveUI(this);
            this.bIsShown = false;
        }    
    }

    Visible()
    {
        return this.bIsShown;
    }
}

export class BlockingUILayer extends ToggleableUILayer
{
    constructor(InManager, InMouseLock = false)
    {
        super(InManager, InMouseLock);
        this.bActive = false;
        this.bPrevState = false;
    }

    Show()
    {
        super.Show();
        this.Activate();
    }

    Hide()
    {
        super.Hide();
        this.Deactivate();
    }

    Activate()
    {
        this.bActive = true;
        
        this.Manager.Layers.forEach(layer => 
        {
            if(layer != this) 
            {
                layer.bPrevState = layer.bActive;
                layer.bActive = false;

                if(layer.OnDeactivate)
                    layer.OnDeactivate();
            }
        });

        if(this.OnActivate)
            this.OnActivate();
    }

    Deactivate()
    {
        this.bActive = false;
        
        if(this.OnDeactivate)
            this.OnDeactivate();

        this.Manager.Layers.forEach(layer => 
        {
            if(layer != this)
            {
                layer.bActive = layer.bPrevState;
                layer.bPrevState = false;

                if(layer.OnActivate)
                    layer.OnActivate();
            }
        });
    }
}