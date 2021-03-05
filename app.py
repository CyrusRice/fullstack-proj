from flask import Flask, render_template, url_for, request, redirect, flash
from flask_socketio import SocketIO, emit
import bcrypt
import chess
from models import *
import copy

async_mode = None


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, log_output=True, logger=True, async_mode=async_mode)
clients = dict()


@app.route('/')
def home():
    # app.route('/')
    return render_template("home.html", sync_mode=socketio.async_mode)


@app.route('/about')
def about():
    return render_template("about.html", sync_mode=socketio.async_mode)


@app.route('/signup')
def signup():
    return render_template("signup.html", sync_mode=socketio.async_mode)


@app.route('/account/<userid>')
def account(userid):
    return render_template("account.html", userid=userid, sync_mode=socketio.async_mode)


@app.route('/logout')
def logout():
    return redirect(url_for('home'))


@app.route('/signin', methods=['POST'])
def signin():
    if request.method == 'POST':
        userid = request.form['userid']
        password = request.form['password'].encode('utf-8')
        useridCount = db['users'].count_documents({'userid': userid})
        if useridCount > 0:
            user = db['users'].find({'userid': userid})[0]
            if bcrypt.checkpw(password, user['password']):
                print(request.args)
                return redirect(url_for('account', userid=userid))
        return render_template("home.html", sync_mode=socketio.async_mode)


@app.route('/createAccount', methods=['POST'])
def createAccount():
    if request.method == 'POST':
        newuser = dict()
        newuser['firstname'] = request.form['firstname']
        newuser['lastname'] = request.form['lastname']
        newuser['email'] = request.form['email']

        userid = request.form['userid']
        newuser['userid'] = userid

        password = request.form['password'].encode('utf-8')
        salt = bcrypt.gensalt()
        pass_hash = bcrypt.hashpw(password, salt)
        newuser['password'] = pass_hash

        newuser['friends'] = {}
        newuser['communities'] = {}
        newuser['games'] = {}
        newuser['stats'] = {}

        useridCount = db['users'].count_documents({'userid': userid})
        emailCount = db['users'].count_documents(
            {'email': request.form['email']})

        if useridCount > 0:
            flash('userid already exists, pick a different one')

        elif emailCount > 0:
            flash('email already exists, pick a different one')

        else:
            db['users'].insert_one(newuser)
            return redirect(url_for('account', userid=userid))

        return redirect(url_for('signup'))


@app.route('/forgotPassword')
def forgotPassword():
    return render_template("forgotPassword.html", sync_mode=socketio.async_mode)


@socketio.on('connected')
def connected(message):
    clients[request.sid] = message['userid']
    try:
        userSockets = copy.deepcopy(clients[message['userid']])
    except:
        userSockets = list()

    userSockets.append(request.sid)
    clients[message['userid']] = userSockets


@socketio.on('disconnect')
def disconnect():
    if request.sid in clients.keys():
        userOnSocket = clients[request.sid]
        clients.pop(request.sid)
    else:
        userOnSocket = None

    if userOnSocket:
        userSockets = copy.deepcopy(clients[userOnSocket])
        if request.sid in userSockets:
            userSockets.remove(request.sid)
        if len(userSockets) == 0:
            clients.pop(userOnSocket)
        else:
            clients[userOnSocket] = userSockets


@socketio.on('update board')
def broadcastFen(message):
    emit('broadcast fen', {'fen': message['fen']}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)
    # app.run(debug=True)
