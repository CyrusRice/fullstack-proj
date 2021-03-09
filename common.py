import copy
from models import *
import bcrypt


def createNewUserDoc(userid, firstname, lastname, email, password):
    useridCount = db['users'].count_documents({'userid': userid})
    emailCount = db['users'].count_documents({'email': email})
    if useridCount == 0 and emailCount == 0:
        newuser = dict()
        newuser['firstname'] = firstname
        newuser['lastname'] = lastname
        newuser['email'] = email
        newuser['userid'] = userid

        salt = bcrypt.gensalt()
        pass_hash = bcrypt.hashpw(password, salt)
        newuser['password'] = pass_hash

        newuser['friends'] = {}
        newuser['communities'] = {}
        newuser['friendids'] = []
        newuser['communityids'] = []

        games = dict()
        games['1:1'] = dict()
        games['tournaments'] = dict()
        newuser['games'] = games

        stats = dict()

        regular = dict()
        regular['wins'] = 0
        regular['losses'] = 0
        regular['draws'] = 0
        stats['1:1'] = regular

        tournaments = dict()
        tournaments['wins'] = 0
        tournaments['losses'] = 0
        tournaments['draws'] = 0

        medals = dict()
        medals['gold'] = 0
        medals['silver'] = 0
        medals['bronze'] = 0

        tournaments['medals'] = medals

        stats['tournaments'] = tournaments

        newuser['stats'] = stats

        db['users'].insert_one(newuser)
        return "success"
    else:
        if useridCount > 0 and emailCount == 0:
            return "useridExists"
        if useridCount == 0 and emailCount > 0:
            return "emailExists"
        if useridCount > 0 and emailCount > 0:
            return "useridANDemailExist"


def createNewCommunityDoc(communitytype, communityid, owner, members):
    newcommunity = dict()
    newcommunity['type'] = communitytype
    newcommunity['communityid'] = communityid
    newcommunity['owner'] = owner
    newcommunity['members'] = members
    results = dict()
    membership = dict()
    for member in newcommunity['members']:
        memberResults = dict()
        if member == owner:
            membership[member] = 'joined'
        else:
            membership[member] = 'pending'
        for opponent in [x for x in newcommunity['members'] if x != member]:
            vsOpponentResults = dict()
            vsOpponentResults['wins'] = 0
            vsOpponentResults['losses'] = 0
            vsOpponentResults['draws'] = 0
            vsOpponentResults['history'] = list()
            vsOpponentResults['status'] = 'noActiveGame'
            vsOpponentResults['activeGame'] = None
            memberResults[opponent] = vsOpponentResults
        results[member] = memberResults
    newcommunity['results'] = results
    newcommunity['membership'] = membership
    newcommunity['tournaments'] = []
    newcommunity['messages'] = []
    db['communities'].insert_one(newcommunity)


def getFriendsListDoc(sender,clients):
    senderDoc = db['users'].find_one({'userid': sender})
    data = dict()
    for friendId in senderDoc["friendids"]:
        friendDataDoc = senderDoc['friends'][friendId]
        friendData = dict()
        friendData['id'] = friendDataDoc['id']
        friendData['name'] = friendDataDoc['name']
        friendData['requestStatus'] = friendDataDoc['requestStatus']
        friendData['gameStatus'] = friendDataDoc['gameStatus']
        if friendId in clients:
            friendData['onlineStatus'] = True
        else:
            friendData['onlineStatus'] = False
        communityQuery = {'$and': [{'type': '1:1'}, {
            'members': sender}, {'members': friendId}]}
        communityCount = db['communities'].count_documents(communityQuery)
        if communityCount > 0:
            communityDoc = db['communities'].find_one(communityQuery)
            results = communityDoc['results'][sender]
            friendResults = results[friendId]

            friendData['wins'] = friendResults['wins']  
            friendData['losses'] = friendResults['losses'] 
            friendData['draws'] = friendResults['draws'] 
        else:
            friendData['wins'] = 0
            friendData['losses'] = 0
            friendData['draws'] = 0
        data[friendId] = friendData
    return data
                            
def updateFriendsListDoc(sender, receiver, action):
    senderDoc = db['users'].find_one({'userid': sender})
    receiverDoc = db['users'].find_one({'userid': receiver})
    result = dict()
    if action == "sendInvite":
        if receiver not in senderDoc["friendids"] and sender not in receiverDoc["friendids"]:
            senderFriend = dict()
            senderFriend['id'] = receiver
            senderFriend['name'] = receiverDoc['firstname'] + \
                ',' + receiverDoc['lastname']
            senderFriend['requestStatus'] = 'inviteSent'
            senderFriend['gameStatus'] = 'noActiveGame'
            senderFriends = copy.deepcopy(senderDoc["friends"])
            senderFriends[receiver] = senderFriend
            senderFriendids = copy.deepcopy(senderDoc["friendids"])
            senderFriendids.append(receiver)
            newvalues = {"$set": {"friends": senderFriends, "friendids": senderFriendids } }
            db['users'].update_one({'userid': sender}, newvalues)
            result['toSender'] = senderFriend

            receiverFriend = dict()
            receiverFriend['id'] = sender
            receiverFriend['name'] = senderDoc['firstname'] + \
                ',' + senderDoc['lastname']
            receiverFriend['requestStatus'] = 'pending'
            receiverFriend['gameStatus'] = None
            receiverFriends = copy.deepcopy(receiverDoc["friends"])
            receiverFriends[sender] = receiverFriend
            receiverFriendids = copy.deepcopy(receiverDoc["friendids"])
            receiverFriendids.append(sender)
            newvalues = {"$set": { "friends": receiverFriends , "friendids": receiverFriendids } }
            db['users'].update_one({'userid': receiver}, newvalues)
            result['toReceiver'] = receiverFriend
            result['status'] = "success"

        else:
            if receiver in senderDoc["friendids"] and sender not in receiverDoc["friendids"]:
                result['status'] = "inconsistentDB"
            if receiver not in senderDoc["friendids"] and sender in receiverDoc["friendids"]:
                result['status'] = "inconsistentDB"
            if receiver in senderDoc["friendids"] and sender in receiverDoc["friendids"]:
                senderFriends = senderDoc['friends']
                senderData = senderFriends[receiver]
                receiverFriends = receiverDoc["friends"]
                receiverData = receiverFriends[sender]
                if senderData['requestStatus'] == 'inviteSent' and receiverData['requestStatus'] == 'pending':
                    result['status'] = "waitingForReceiverResponse"
                elif receiverData['requestStatus'] == 'inviteSent' and senderData['requestStatus'] == 'pending':
                    result['status'] = "waitingForSenderResponse"
                elif senderData['requestStatus'] == 'added' and receiverData['requestStatus'] == 'added':
                    result['status'] = "alreadyFriends"
                else:
                    result['status'] = "inconsistentDB"
    if action == "acceptInvite":
        if receiver in senderDoc["friendids"] and sender in receiverDoc["friendids"]:
            senderFriend = dict()
            senderFriend['id'] = receiver
            senderFriend['name'] = receiverDoc['firstname'] + \
                ',' + receiverDoc['lastname']
            senderFriend['requestStatus'] = 'isFriend'
            senderFriend['gameStatus'] = 'noActiveGame'
            senderFriends = copy.deepcopy(senderDoc["friends"])
            senderFriends[receiver] = senderFriend
            senderFriendids = copy.deepcopy(senderDoc["friendids"])
            newvalues = {"$set": {"friends": senderFriends} }
            db['users'].update_one({'userid': sender}, newvalues)
            result['toSender'] = senderFriend

            receiverFriend = dict()
            receiverFriend['id'] = sender
            receiverFriend['name'] = senderDoc['firstname'] + \
                ',' + senderDoc['lastname']
            receiverFriend['requestStatus'] = 'isFriend'
            receiverFriend['gameStatus'] = None
            receiverFriends = copy.deepcopy(receiverDoc["friends"])
            receiverFriends[sender] = receiverFriend
            receiverFriendids = copy.deepcopy(receiverDoc["friendids"])
            receiverFriendids.append(sender)
            newvalues = {"$set": { "friends": receiverFriends , "friendids": receiverFriendids } }
            db['users'].update_one({'userid': receiver}, newvalues)
            result['toReceiver'] = receiverFriend
            result['status'] = "success"

    return result
