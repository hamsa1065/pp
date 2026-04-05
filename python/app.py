import sys
sys.path.insert(0, "python")
from dementia_predict import app   # your Flask app must be in here

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))