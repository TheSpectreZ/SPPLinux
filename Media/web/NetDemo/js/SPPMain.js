import { VERSION } from './SPPCore.js';

export * from './SPPBase.js';
export * from './UIManager.js'
export * from './PGLayers.js'
 
if(typeof window !== 'undefined') 
{
    if(window.__SPP__) 
        console.warn("WARNING: Multiple instances of SPP being Imported");
    else
        window.__SPP__ = VERSION;
}