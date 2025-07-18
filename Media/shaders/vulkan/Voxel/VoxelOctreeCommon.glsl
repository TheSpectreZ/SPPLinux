struct NodeToWalk
{
    uint64_t nodeID;
    int levelID;
    int startAtLevelID;
};

void Constr(GLSL_PARAM_INOUT(NodeToWalk, ioNode))
{
    ioNode.nodeID = 0;
    ioNode.levelID = -1;
    ioNode.startAtLevelID = -1;
}

void Constr(GLSL_PARAM_INOUT(NodeToWalk, ioNode), 
    uint64_t VoxelID, 
    int CheckLevel, 
    int StopLevel)
{
    ioNode.nodeID = VoxelID;
    ioNode.levelID = CheckLevel;
    ioNode.startAtLevelID = StopLevel;
}
