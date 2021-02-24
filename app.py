from flask import Flask, render_template
import chess
import models

app = Flask(__name__)


@app.route('/')
def home():
    # app.route('/')
    return render_template("home.html")


@app.route('/about')
def about():
    return render_template("about.html")


@app.route('/signup')
def signup():
    return render_template("signup.html")


@app.route('/forgotPassword')
def forgotPassword():
    return render_template("forgotPassword.html")


if __name__ == "__main__":
    app.run(debug=True)
