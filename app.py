from flask import Flask, render_template, url_for, request,redirect,flash
from flask_socketio import SocketIO, emit
import chess
from models import *
from bson.json_util import dumps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app,log_output=True,logger=True)

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

@app.route('/account')
def account():
    return render_template("account.html")

@app.route('/addGame', methods = ['POST'])
def addGame():
    if request.method == 'POST':
        gameIdCount = db['games'].count_documents({'gameid': request.form['gameId']})
        if gameIdCount > 0:
            flash('gameid already exists, pick a different one')
        newgame = dict()
        newgame['gameid'] = request.form['gameId']
        newgame['fen'] = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        #newgame['player_1'] = 'n/a'
        #newgame['player_2'] = 'n/a'
        db['games'].insert_one(newgame)
    return render_template("home.html")

@app.route('/loadGame', methods = ['POST'])
def loadGame():
    if request.method == 'POST':
        query = {"gameid": request.form['games']}
        #for now load game for all clients, later will only load for players 1 & 2
        game = db['games'].find(query)
        socketio = SocketIO()
        socketio.emit('load game', {'fen': game['fen'], 'gameid': game['gameid']}, broadcast=True)
    return render_template("home.html")

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

        useridCount = db['users'].count_documents({'userid': request.form['userid']})
        emailCount = db['users'].count_documents({'email': request.form['email']})

        if useridCount > 0:
            flash('userid already exists, pick a different one')

        elif emailCount > 0:
            flash('email already exists, pick a different one')

        else:
            db['users'].insert_one(newuser)
            return redirect(url_for('account'))

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

@socketio.on('save game')
def saveGame(message):
    query = {"gameid" : message['gameid']}
    newvalues = { "$set": { "fen": message['fen'] } }
    db['games'].update_one(query, newvalues)

# Fill in the games list in the home.html page w/ all existing games
@socketio.on('get games')
def broadcastGames(message):
    gameslist = dumps(list(db['games'].find()))
    emit('send games', gameslist, broadcast=True)
    



if __name__ == "__main__":
    socketio.run(app,debug=True)
    #app.run(debug=True)
