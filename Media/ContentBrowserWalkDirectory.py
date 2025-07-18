import os
import sys
from pathlib import Path

print("const Directories = [");

pathIDMap = dict()

counter = 1;
path = "."
pathIDMap["."] = 0

for root, d_names, f_names in os.walk(path):
	AsPath = Path(root)
	if len(AsPath.name) == 0:
		continue

	ParentPath = str(AsPath.parent)
	OurPath = str(AsPath)
	#print("OurPath:" + OurPath)
	#print("ParentPath:" + ParentPath)
	parentID = pathIDMap.get(ParentPath)
	print("    {" + ' parentID: {0}, ID: {1}, name: "{2}", typeID: {3} '.format( parentID, counter, AsPath.name, 1 ) + "}," );
	#print("add root:" + root)
	pathIDMap[OurPath] = counter
	counter = counter + 1;



print("];");