from flask import Flask, render_template, request, session, redirect, url_for, abort

app = Flask(__name__)


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/uploads", methods=["POST"])
def save_audio():
    rawAudio = request.get_data()
    print(rawAudio)
    print(type(rawAudio))

    with open("record.wav", 'wb') as audioFile:
        audioFile.write(rawAudio)

    return redirect(url_for('index'))

if __name__ == "__main__":
    app.run("127.0.0.1", debug=True)
