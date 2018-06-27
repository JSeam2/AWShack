from flask import Flask, request, session, redirect, url_for, abort

app = Flask(__name__)


@app
