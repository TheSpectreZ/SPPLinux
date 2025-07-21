#!/bin/bash

NAME=$1
PORT=$2

# Get the directory of the current script
BINARY_PATH=$(dirname "$(readlink -f "$0")")

cd "$BINARY_PATH"

# Define target directories
TARGETS=(
    "../3rdParty/ozz-animation/lib"
    "../3rdParty/jsoncpp/lib"
    "../3rdParty/easy_profiler/lib"
    "../3rdParty/Physx5/bin/linux.x86_64/release"
    "../3rdPartyPrivate/SteamWorks/redistributable_bin/linux64"
)

# Construct LD_LIBRARY_PATH
for TARGET in "${TARGETS[@]}"; do
    ABSOLUTE_PATH=$(realpath "$BINARY_PATH/$TARGET")
    LD_LIBRARY_PATH="$ABSOLUTE_PATH:$LD_LIBRARY_PATH"
done

# Export updated LD_LIBRARY_PATH
export LD_LIBRARY_PATH

./SPPGameServerd -name="$NAME" -port="$PORT"