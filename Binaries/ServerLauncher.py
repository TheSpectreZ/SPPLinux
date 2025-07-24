import subprocess
import os

from flask import Flask, jsonify, request
from waitress import serve

app = Flask(__name__)

current_port = 4000
script_path = "/mnt/f/Work/EC2/SPP/Binaries/Launch.sh"

@app.route('/create_server', methods=['POST'])
def create_server():
    print("CREATE_SERVER")

    global current_port

    try:
        port_str = str(current_port)
        
        subprocess.Popen(
            ["/bin/bash", script_path, port_str]           
        )

        response = {
            "status": "ok",
            "message": "create_server"
        }

        current_port += 2  # increment after launch
        return jsonify(response)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

application = app
