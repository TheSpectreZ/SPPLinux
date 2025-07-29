import { VERSION } from './Core.js';

export { UIManager } from './UIManager.js';
export { UILayer, GameUILayer } from './UILayer.js';
export { GameConsole } from './ConsoleCommands.js'
export { OptionsMenuScreen } from './Settings.js';

if ( typeof window !== 'undefined' ) {
	if ( window.__SPP__ ) {
		console.warn( 'WARNING: Multiple instances of SPP being imported.' );
	} else {
		window.__SPP__ = VERSION;
	}
}
