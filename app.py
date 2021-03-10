from flask import Flask, render_template, url_for, request, redirect, flash
from flask_socketio import SocketIO, emit, join_room, leave_room
import bcrypt
import chess
#from models import *
from common import *
import copy
from bson.json_util import dumps

async_mode = None


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, log_output=True, logger=True, async_mode=async_mode)
# socketio.init_app(app)
clients = dict()
currGameId = ''
currFen = ''


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
                return redirect(url_for('account', userid=userid))
        return render_template("home.html", sync_mode=socketio.async_mode)

# Add new game, may move this code elsewhere


@app.route('/addGame', methods=['POST'])
def addGame():
    if request.method == 'POST':
        gameIdCount = db['games'].count_documents(
            {'gameid': request.form['gameId']})
        if gameIdCount > 0:
            flash('gameid already exists, pick a different one')
        else:
            newgame = dict()
            newgame['gameid'] = request.form['gameId']
            newgame['fen'] = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
            #newgame['player_1'] = 'n/a'
            #newgame['player_2'] = 'n/a'
            db['games'].insert_one(newgame)
    # return render_template("home.html", sync_mode=socketio.async_mode)
    return redirect(url_for('account'))

# @app.route('/loadGame', methods = ['POST'])
# def loadGame():
    # if request.method == 'POST':
    #query = {"gameid": request.form['games']}
    # for now load game for all clients, later will only load for players 1 & 2
    #game = dumps(list(db['games'].find(query)))
    #socketio.emit('load game', game, broadcast=True, namespace=url_for('home'))
    # return render_template("home.html", sync_mode=socketio.async_mode)
    # return redirect(url_for('home'))


@app.route('/createAccount', methods=['POST'])
def createAccount():
    if request.method == 'POST':
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        userid = request.form['userid']
        email = request.form['email']
        password = request.form['password'].encode('utf-8')
        addUserStatus = createNewUserDoc(
            userid, firstname, lastname, email, password)
        msg = ''
        if addUserStatus == "useridExists":
            msg = 'userid already exists, try again'
            #
        elif addUserStatus == "emailExists":
            msg = 'email already exists, try again'
        elif addUserStatus == "useridANDemailExist":
            msg = 'email,userid already exist, try again'
        else:
            return redirect(url_for('account', userid=userid))

        flash(msg)
        return redirect(url_for('signup'))

@socketio.on('getFriends')
def getFriends(data):
    sender = data['sender']
    senderCount = db['users'].count_documents({'userid': sender})
    if senderCount > 0:
        data = getFriendsListDoc(sender,clients)
        socketio.emit('populateFriendsList',data,room=request.sid)
        for friend in data:
            if friend in clients:
                dataToFriend = getFriendDataFromDoc(friend,sender,clients)
                for friendSocket in clients[friend]:
                    socketio.emit('updateFriendDataInTable', dataToFriend,room=friendSocket)



@socketio.on('acceptFriendRequest')
def acceptFriendRequest(data):
    sender = data['sender']
    receiver = data['receiver']
    senderCount = db['users'].count_documents({'userid': sender})
    receiverCount = db['users'].count_documents({'userid': receiver})

    communityQuery = {'$and': [{'type': '1:1'}, {
        'members': sender}, {'members': receiver}]}
    communityCount = db['communities'].count_documents(communityQuery)
    if senderCount > 0 and receiverCount > 0:
        acceptInviteStatus = updateFriendsListDoc(sender, receiver, 'acceptInvite')
        if acceptInviteStatus['status'] == 'success':
            if communityCount > 0:
                communityDoc = db['communities'].find_one(communityQuery)
                membership = copy.deepcopy(communityDoc["membership"])
                membership[receiver] = "joined"
                membership[sender] = "joined"
                newvalues = {"$set":{"membership":membership}}
                db['communities'].update_one(communityQuery, newvalues)
                results = communityDoc['results']
                if sender in clients:
                    senderData = acceptInviteStatus['toSender']
                    senderData['onlineStatus'] = True
                    senderData['wins'] = results[sender][receiver]['wins']  
                    senderData['losses'] = results[sender][receiver]['losses'] 
                    senderData['draws'] = results[sender][receiver]['draws']              
                    for senderSocket in clients[sender]:
                        socketio.emit('updateFriendDataInTable', senderData,room=senderSocket)
                if receiver in clients:
                    receiverData = acceptInviteStatus['toReceiver']
                    receiverData['onlineStatus'] = True  
                    receiverData['wins'] = results[receiver][sender]['wins']  
                    receiverData['losses'] = results[receiver][sender]['losses'] 
                    receiverData['draws'] = results[receiver][sender]['draws']                                
                    for receiverSocket in clients[receiver]:
                        socketio.emit('updateFriendDataInTable', receiverData,room=receiverSocket)

@socketio.on('addFriend')
def addFriend(data):
    sender = data['sender']
    receiver = data['receiver']
    senderCount = db['users'].count_documents({'userid': sender})
    receiverCount = db['users'].count_documents({'userid': receiver})

    communityQuery = {'$and': [{'type': '1:1'}, {
        'members': sender}, {'members': receiver}]}
    communityCount = db['communities'].count_documents(communityQuery)

    if senderCount > 0 and receiverCount > 0:
        sendInviteStatus = updateFriendsListDoc(sender, receiver, 'sendInvite')
        if sendInviteStatus['status'] == 'success':
            if communityCount == 0:
                communitytype = '1:1'
                communityid = sender + '_' + receiver
                owner = sender
                members = [sender, receiver]
                createNewCommunityDoc(communitytype, communityid, owner, members)
            communityDoc = db['communities'].find_one(communityQuery)
            results = communityDoc['results']
            if sender in clients:
                senderData = sendInviteStatus['toSender']
                senderData['onlineStatus'] = True
                senderData['wins'] = results[sender][receiver]['wins']  
                senderData['losses'] = results[sender][receiver]['losses'] 
                senderData['draws'] = results[sender][receiver]['draws']              
                for senderSocket in clients[sender]:
                    socketio.emit('addFriendToTable', senderData,room=senderSocket)
            if receiver in clients:
                receiverData = sendInviteStatus['toReceiver']
                receiverData['onlineStatus'] = True  
                receiverData['wins'] = results[receiver][sender]['wins']  
                receiverData['losses'] = results[receiver][sender]['losses'] 
                receiverData['draws'] = results[receiver][sender]['draws']                                
                for receiverSocket in clients[receiver]:
                    socketio.emit('addFriendToTable', receiverData,room=receiverSocket)
    elif senderCount > 0:
        msg = "No account found with userid = " + receiver
        socketio.emit('alertUser',{'message':msg},room=request.sid)
            

    #return redirect(url_for('account', userid=sender))

@socketio.on('removeFriends')
def removeFriends(data):
    sender = data['sender']
    receivers = data['receivers']
    senderCount = db['users'].count_documents({'userid': sender})
    receiverCount = dict()
    for receiver in receivers:
        receiverCount = db['users'].count_documents({'userid': receiver})
        communityQuery = {'$and': [{'type': '1:1'}, {
            'members': sender}, {'members': receiver}]}
        communityCount = db['communities'].count_documents(communityQuery) 
        if senderCount > 0 and receiverCount > 0:
            removeFriendStatus = updateFriendsListDoc(sender, receiver, 'removeFriend')           
            if removeFriendStatus['status'] == 'success':
                if sender in clients:
                    for senderSocket in clients[sender]:
                        socketio.emit('removeFriendInTable', {'id':receiver},room=senderSocket)
                if receiver in clients:
                    for receiverSocket in clients[receiver]:
                        socketio.emit('removeFriendInTable', {'id':sender},room=receiverSocket)
                        

@app.route('/forgotPassword')
def forgotPassword():
    return render_template("forgotPassword.html", sync_mode=socketio.async_mode)


@socketio.on('connected')
def connected(data):
    clients[request.sid] = data['userid']
    try:
        userSockets = copy.deepcopy(clients[data['userid']])
    except:
        userSockets = list()

    userSockets.append(request.sid)
    clients[data['userid']] = userSockets
    socketio.emit('connectionRecorded',{'message':data},room=request.sid)



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
        userOnSocketCount = db['users'].count_documents({'userid': userOnSocket})
        if userOnSocketCount > 0:
            friendsOnSocket = getFriendsListDoc(userOnSocket,clients)
            for friend in friendsOnSocket:
                if friend in clients:
                    dataToFriend = getFriendDataFromDoc(friend,userOnSocket,clients)
                    for friendSocket in clients[friend]:
                        socketio.emit('updateFriendDataInTable', dataToFriend,room=friendSocket)



@socketio.on('update board')
def broadcastFen(message):
    query = {"gameid": message['currgameid']}
    newvalues = {"$set": {"fen": message['fen']}}
    if message['gameover'] == True:
        db['games'].delete_one(query)
    else:
        db['games'].update_one(query, newvalues)
    emit('broadcast fen', {'fen': message['fen'], 'gameover': message['gameover']}, room=message['currgameid'])

# Load new game and save old game


@socketio.on('load game')
def saveGame(message):
    #query = {"gameid": message['currgameid']}
    #newvalues = {"$set": {"fen": message['fen']}}
    if message['currgameid'] != '':
      leave_room(message['currgameid'])
      #db['games'].update_one(query, newvalues)
    query = {"gameid" : message['newgameid']}
    game = dumps(list(db['games'].find(query)))
    join_room(message['newgameid'])
    emit('load game', game, room=message['newgameid'])

# Add a new game


@socketio.on('add game')
def addGame(message):
    gameIdCount = db['games'].count_documents({'gameid': message['gameid']})
    player2Exists = db['users'].count_documents({'userid': message['p2']})
    invalidGameId = False
    invalidPlayer2 = False
    if gameIdCount > 0:
        invalidGameId = True
    elif player2Exists == 0:
        invalidPlayer2 = True
    else:
        newgame = dict()
        newgame['gameid'] = message['gameid']
        newgame['fen'] = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        newgame['player_1'] = message['p1']
        newgame['player_2'] = message['p2']
        db['games'].insert_one(newgame)
    emit('add game', {'gameid' : message['gameid'], 'p1' : message['p1'], 'p2' : message['p2'],
        'invalidgameid' : invalidGameId, 'invalidplayer2' : invalidPlayer2}, broadcast=True)

# Fill in the games list for all games user is in
@socketio.on('get games')
def broadcastGames(message):
    query = {"$or" : [{"player_1" : message['userId']}, {"player_2" : message['userId']}]}
    gameslist = dumps(list(db['games'].find(query)))
    emit('send games', gameslist)
    


if __name__ == "__main__":
    socketio.run(app, debug=True)
    # app.run(debug=True)
