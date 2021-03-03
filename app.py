from flask import Flask, render_template, url_for, request
from flask_socketio import SocketIO, emit
import chess
from models import *

app = Flask(__name__)
socketio = SocketIO(app)

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

#@socketio.on('connect')
#def test_connect():
    #emit('my response', {'data': 'Connected'})

@socketio.on('update board')
def broadcastFen(message):
    emit('broadcast fen', {'fen': message['fen']}, broadcast=True)



if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0')
    #app.run(debug=True)
