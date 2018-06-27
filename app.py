from flask import Flask, render_template, request, session, redirect, url_for, abort
from flask_cors import CORS
import boto3

app = Flask(__name__)
CORS(app)
s3 = boto3.client('s3')
bucket = 'hackathonstore'


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/uploads", methods=["POST"])
def save_audio():
    rawAudio = request.get_data()

    print("Uploading")
    s3_object = s3.put_object(Bucket = bucket,
                              Body = rawAudio,
                              Key = 'audio/record.wav',
                              ContentType = "audio/x-wav")
    print("Uploaded wav to s3")



    return redirect(url_for('index'))


def transcribe(file_path):
    """
    call aws transcribe
    """
    # Upload record.wav to s3
    pass



if __name__ == "__main__":
    app.run("127.0.0.1", debug=True)
