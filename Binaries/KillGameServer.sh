#!/bin/bash

PORT=$1
PID_FILE="/tmp/spp_server_${PORT}.pid"

if [ -z "$PORT" ]; then
    echo "Usage: $0 <port>"
    exit 1
fi

if [ ! -f "$PID_FILE" ]; then
    echo "PID file not found: $PID_FILE"
    exit 1
fi

PID=$(cat "$PID_FILE")

if ! kill -0 $PID 2>/dev/null; then
    echo "No process with PID $PID running"
    rm -f "$PID_FILE"
    exit 1
fi

echo "Killing process $PID on port $PORT"
kill -9 $PID
rm -f "$PID_FILE"
