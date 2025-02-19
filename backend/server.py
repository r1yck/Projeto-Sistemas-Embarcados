from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

@app.route("/dados", methods=["GET"])
def get_dados():
    return jsonify({"tensao": 220, "corrente": 0.0, "potencia": 0.0, "custo": 0.0})

if __name__ == "__main__":
    app.run(debug=True)
