import { UILayer } from "./UILayer.js"

export class GameConsole extends UILayer {
    
    constructor(InManager) {
        super(InManager);
        
        this.bIsShown = false;
        this.commandHistory = [];
        this.commandIdx = -1;
		this.alphaNumericRegex = new RegExp("^[a-zA-Z0-9 .-]");
        
        this.divHTML = `<div style="display:flex; flex-direction: row" >&#62;
                        <input id="consoleText" style="margin-left: 5px; flex: 2; font-family: SANS-SERIF;" />
                        </div>
                        <div id="consoleHistory" style="margin-left: 10px; margin-top: 10px; font-family: SANS-SERIF;">
                        </div>`;
						
						
		var that = this;    
        
        this.consoleBlock = document.createElement("div");            
        this.consoleBlock.innerHTML = this.divHTML;
        this.consoleBlock.className = "consoleInput";
        document.body.appendChild(this.consoleBlock);
		
		
		document.addEventListener('keyup', (event) => {
			// tilde key
            if( event.keyCode == 192 )
            {
				that.ToggleConsole();
            }    
		});
        
        var ccInput = document.getElementById("consoleText");              
        ccInput.addEventListener("keyup", (event) => {
                       
            //console.log(event.key);
            //console.log(event.keyCode);			                
			
            // up arrow
            if( event.keyCode == 38 )
            {

            }                    
        });
                    
        // Execute a function when the user presses a key on the keyboard
        ccInput.addEventListener("keypress", function(event) {            											
            //console.log(event.key);
            // If the user presses the "Enter" key on the keyboard
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();
            
                that.AddToHistory(ccInput.value);
             
                window.InvokeNative("ConsoleCommand", ccInput.value);
                //send event
                ccInput.value = "";                  
            }
			
			var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
			if (!that.alphaNumericRegex.test(key)) {
			   event.preventDefault();
			}
        });
		
		// start hidden
		this.consoleBlock.style.display = "none";
    }

    AddCommand(InCommand, InFormat, InDescription) {
        
    }
    
    IsShown() { 
        return this.bIsShown;
    }
    
    AddToHistory(InValue) {        
        this.commandHistory.unshift(InValue);
        
        if( this.commandHistory.length > 50 )
        {
            this.commandHistory.pop();
        }
        
        var consoleHistoryDiv = document.getElementById("consoleHistory");
        consoleHistoryDiv.innerText = "";
        
        for (let i = 0; i <  this.commandHistory.length && i < 5; i++) {
            consoleHistoryDiv.innerText += this.commandHistory[i] + "\r\n";
        }
    }
    
    CreateDivIfNeeded() {
                
		
       
    }
	
	ToggleConsole() { 
		if( !this.bIsShown ) {
			this.Show();
		} else {
			this.Hide();			
		}
			
	
	}
    
    RequiresMouseLock() {
        return false;
    }
    
    Show() {
        if( !this.bIsShown ) {
            this.Manager.AddUI( this );
            // Get the input field            
			this.consoleBlock.style.display = "";			
			var ccInput = document.getElementById("consoleText");        
			ccInput.focus();					
            this.bIsShown = true;
        }
    }
	
	Hide() {
		if( this.bIsShown ) {
            this.Manager.RemoveUI( this );
            
            // Get the input field
            var ccInput = document.getElementById("consoleText");
            ccInput.focus();		
			this.consoleBlock.style.display = "none";
            this.bIsShown = false;
        }	
	}
}