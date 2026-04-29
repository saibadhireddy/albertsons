import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_compress import Compress
from dotenv import load_dotenv

# Import logic from our second file
from backend.genie_logic import get_genie_space_info, start_genie_conversation, create_genie_message

load_dotenv()

app = Flask(__name__)
Compress(app)

# Configure CORS to allow your frontend
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173", 
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:8000",
    "http://localhost:5000",
    "https://organic-space-waffle-x5vxpr9q76xg3vj6p-8000.app.github.dev/"
])

DIST_FOLDER = os.path.join(os.path.dirname(__file__), "client/dist")

@app.route('/')
def index():
    return send_from_directory(DIST_FOLDER, "index.html")

@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory(os.path.join(DIST_FOLDER, "assets"), filename)

@app.route('/<path:path>')
def catch_all(path):
    # This checks if the requested path exists as a physical file (like an image or icon)
    # If it doesn't, it returns index.html so React Router can take over.
    if os.path.exists(os.path.join(DIST_FOLDER, path)):
        return send_from_directory(DIST_FOLDER, path)
    return send_from_directory(DIST_FOLDER, "index.html")

@app.route('/api/genie/space-info', methods=['GET'])
def space_info():
    space_name = request.args.get('space_name', 'MARGE')
    return jsonify(get_genie_space_info(space_name))

@app.route('/api/genie/start-conversation', methods=['POST'])
def start_convo():
    data = request.json
    return jsonify(start_genie_conversation(data.get('space_name'), data.get('message')))

@app.route('/api/genie/create-message', methods=['POST'])
def create_msg():
    data = request.json
    return jsonify(create_genie_message(
        data.get('space_name'), 
        data.get('conversation_id'), 
        data.get('message')
    ))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)