import importlib.util
import numpy as np
from scipy.stats import qmc
import imageio.v3 as iio
import os

imageDir = os.path.abspath( os.path.dirname(__file__) + "/../textures/techdemo/" )
print(imageDir)

nativeFunctions = importlib.util.find_spec("NativeFunctions")
bFoundNative = nativeFunctions is not None

imageColor = iio.imread(imageDir + "/TechDemoFirstLevelColor.png")
imageDepth = iio.imread(imageDir + "/TechDemoFirstLevelDepth.png")
imageMasks = iio.imread(imageDir + "/TechDemoFirstLevelMasks.png")


if bFoundNative:
    import NativeFunctions as nf

rng = np.random.default_rng()
radius = 0.01
engine = qmc.PoissonDisk(d=2, radius=radius, seed=rng)
samples = engine.fill_space()
print("total pnts: ", len(samples))

for _, curSample in enumerate(samples):
        
    texturePnt = [ int( curSample[0] * 4096 ), int( curSample[1] * 4096 ) ]    
    maskPnt = imageMasks[  texturePnt[0], texturePnt[1] ]
    
    finalPnt = [texturePnt[0], imageDepth[ texturePnt[0], texturePnt[1] ], texturePnt[1] ]
    placeType = ""
    
    if maskPnt[3] > 127:        
        if maskPnt[0] > 127:
            placeType = "tree"
        if maskPnt[1] > 127:
            placeType = "deadtree"
        
    if len(placeType) > 0:
        #print(finalPnt, placeType)
        if bFoundNative:
            nf.invoke("place {0} {1} {2} {3}".format(placeType, finalPnt[0], finalPnt[1], finalPnt[2]))
            
            
rng = np.random.default_rng()
radius = 0.02
engine = qmc.PoissonDisk(d=2, radius=radius, seed=rng)
samples = engine.fill_space()
print("total pnts: ", len(samples))

for _, curSample in enumerate(samples):
        
    texturePnt = [ int( curSample[0] * 4096 ), int( curSample[1] * 4096 ) ]    
    maskPnt = imageMasks[  texturePnt[0], texturePnt[1] ]
    
    finalPnt = [texturePnt[0], imageDepth[ texturePnt[0], texturePnt[1] ], texturePnt[1] ]
    placeType = "rock"
    
    if maskPnt[3] < 127:   
        placeType = "littlerock"
    
    if bFoundNative:
        nf.invoke("place {0} {1} {2} {3}".format(placeType, finalPnt[0], finalPnt[1], finalPnt[2]))