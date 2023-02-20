from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from gci_detector import gci_detector

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/gci_detector', methods=['POST'])
def detect_gci():
    try:
        # Get the input text from the request
        input_text = request.form.get('input')

        # Detect the GCI using the detect_gci function
        gci = gci_detector(input_text)

        # Return the GCI as JSON
        return gci

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=3333)


