import array
import subprocess
import threading
import time

from enum import IntEnum
from flask import Flask, jsonify,request
from waitress import server

app = Flask(__name__)
application = app

class PortState(IntEnum):
    Idle        = 0
    Cooldown    = 1
    Pending     = 2
    Connected   = 3

# 4000 - 6000
port_begin = 4000

port_count = 1000 
port_state = array.array('b', [PortState.Idle] * port_count)

def GetAvailablePort():
    index = -1
    for i in range(port_count):
        val = port_state[i]
        if val == PortState.Idle:
            port_state[i] = PortState.Connected
            index = i
            break
    
    if index == -1:
        raise RuntimeError("NO AVAILABLE PORTS!!")

    return port_begin + index * 2

cooldown_ports = set()
cooldown_lock = threading.Lock()

def SetPortState(port, state: PortState):
    array_index = (port - port_begin) // 2
    port_state[array_index] = state

    if state == PortState.Cooldown:
        with cooldown_lock:
            cooldown_ports.add(array_index)
    elif state == PortState.Idle:
        with cooldown_lock:
            cooldown_ports.discard(array_index)

def GetPortState(port):
    array_index = (port - port_begin) // 2
    return port_state[array_index]

@app.route('/create_server', methods=['POST'])
def create_server():
    print("CREATE_SERVER")
    try:
        avail_port = GetAvailablePort()        
        subprocess.Popen(["/bin/bash", "Launch.sh", str(avail_port)])
        SetPortState(avail_port, PortState.Pending)
        return jsonify({ "status": "Pending", "message": "create_server", "port": str(avail_port) })
    except Exception as e:
        return jsonify({ "status": "error", "message": str(e) }), 500

@app.route('/check_port_status<int:port>', methods=['GET'])
def check_port_status(port):
    print("CHECK_PORT_STATUS: ", port)
    state = GetPortState(port)
    if state is PortState.Connected:
        return jsonify({ "status": "Connected" })
    elif state is PortState.Pending:
        return jsonify({ "status": "Pending" })
    elif state is PortState.Cooldown:
        return jsonify({ "status": "Cooldown" })
    else:
        return jsonify({ "status": "Idle" })

@app.route('/server_connected', methods=['POST'])
def server_connected():
    port = int(request.get_data(as_text=True))
    print("SERVER_CONNECTED: ", port)
    SetPortState(port, PortState.Connected)

@app.route('/server_shutdown', methods=['POST'])
def server_shutdown():
    port = int(request.get_data(as_text=True))
    print("SERVER_SHUTDOWN: ", port)
    SetPortState(port, PortState.Cooldown)

def cooldown_watcher():
    while True:
        time.sleep(10) # 10 seconds - should be enough time for server to close the port
        with cooldown_lock:
            to_reset = list(cooldown_ports)
            cooldown_ports.clear()

        for idx in to_reset:
            port_state[idx] = PortState.Idle

# Start cooldown watcher thread
threading.Thread(target=cooldown_watcher, daemon=True).start()