from flask import Flask, render_template, url_for, request
import chess
from models import *

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

@app.route('/createAccount', methods = ['POST'])
def createAccount():
    if request.method == 'POST':
        newuser = dict()
        newuser['firstname'] = request.form['firstname'] 
        newuser['lastname'] = request.form['lastname'] 
        newuser['email'] = request.form['email'] 
        newuser['userid'] = request.form['userid'] 
        newuser['password'] = request.form['password']
        newuser['friends'] = []
        newuser['communities'] = []
        newuser['games'] = []
        db['users'].insert_one(newuser)
        return render_template("signup.html")

@app.route('/forgotPassword')
def forgotPassword():
    return render_template("forgotPassword.html")



if __name__ == "__main__":
    app.run(debug=True)
