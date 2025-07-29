
export class UILayer {
    
    constructor(InManager, InMouseLock = false) {
        this.bMouseLock = InMouseLock;
        this.Manager = InManager;
    }

    RequiresMouseLock() {
        return this.bMouseLock;
    }
}