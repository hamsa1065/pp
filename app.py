import sys, os, tempfile
sys.path.insert(0, "python")

from flask import Flask, request, jsonify
from flask_cors import CORS
from dementia_predict import predict

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": True})

@app.route("/predict", methods=["POST"])
def run_predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    try:
        zip_file = request.files["file"]
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
            zip_file.save(tmp.name)
            result = predict(tmp.name, json_mode=False)
            os.unlink(tmp.name)
        return jsonify(result)
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)