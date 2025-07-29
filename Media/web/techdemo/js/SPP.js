

import { VERSION } from './Core.js';
export { GameConsole } from './ConsoleCommands.js';
export { UILayer } from './UILayer.js';
export { UIManager } from './UIManager.js';

if ( typeof window !== 'undefined' ) {
	if ( window.__SPP__ ) {
		console.warn( 'WARNING: Multiple instances of SPP being imported.' );
	} else {
		window.__SPP__ = VERSION;
	}
}
