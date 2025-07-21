from flask import Flask, jsonify, request
from waitress import serve

app = Flask(__name__)

@app.route('/create_server', methods=['POST'])
def create_server():
    print("SERVER CREATION")
    return jsonify({"status": "ok"})

application = app
