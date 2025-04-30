from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Define a route for GET requests
@app.route('/get_data', methods=['GET'])
def get_data():
    data = {
        'success': True,
        'message': 'Data retrieved successfully',
        'data': {
            'crop': 'Rice',
            'yield': 1200
        }
    }
    return jsonify(data)

# Define a route for POST requests
@app.route('/post_data', methods=['POST'])
def post_data():
    received_data = request.json
    print(f"Received data: {received_data}")
    
    response = {
        'success': True,
        'message': 'Data received successfully'
    }
    return jsonify(response)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
