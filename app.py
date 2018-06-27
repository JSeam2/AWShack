from flask import Flask, request, session, redirect, url_for, abort

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello"


if __name__ == "__main__":
    app.run("0.0.0.0", debug=True)
