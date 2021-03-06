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


def createNewCommunityDoc(communitytype, communityid, owner, members, name=None):
    newcommunity = dict()
    newcommunity['type'] = communitytype
    newcommunity['communityid'] = communityid
    newcommunity['owner'] = owner
    newcommunity['members'] = members
    memberNames = dict()
    if communitytype == 'group':
        if name is None:
            newcommunity['name'] = communityid
        else:
            newcommunity['name'] = name
    results = dict()
    membership = dict()
    for member in newcommunity['members']:
        memberResults = dict()
        memberDoc = db['users'].find_one({'userid': member})
        memberNames[member] = memberDoc['firstname'] + \
            ',' + memberDoc['lastname']
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
    if communitytype == 'group':
        newcommunity['membernames'] = memberNames
    newcommunity['results'] = results
    newcommunity['membership'] = membership
    newcommunity['tournaments'] = []
    newcommunity['messages'] = []
    db['communities'].insert_one(newcommunity)


def getMemberData(member, communityDoc, clients):
    members = communityDoc['members']
    results = communityDoc['results']
    memberData = dict()
    memberData['id'] = communityDoc['communityid']
    memberData['name'] = communityDoc['name']
    opponents = [x for x in members if x != member]
    memberData['opponents'] = opponents
    memberData['opponentnames'] = dict()
    memberData['opponentmemberships'] = dict()
    memberData['owner'] = communityDoc['owner']
    memberData['wins'] = dict()
    memberData['wins']['All Members'] = 0
    memberData['losses'] = dict()
    memberData['losses']['All Members'] = 0
    memberData['draws'] = dict()
    memberData['draws']['All Members'] = 0
    memberData['membership'] = communityDoc['membership'][member]
    for opponent in opponents:
        memberData['wins']['All Members'] += results[member][opponent]['wins']
        memberData['wins'][opponent] = results[member][opponent]['wins']
        memberData['losses']['All Members'] += results[member][opponent]['losses']
        memberData['losses'][opponent] = results[member][opponent]['losses']
        memberData['draws']['All Members'] += results[member][opponent]['draws']
        memberData['draws'][opponent] = results[member][opponent]['losses']
        memberData['opponentnames'][opponent] = communityDoc['membernames'][opponent]
        memberData['opponentmemberships'][opponent] = communityDoc['membership'][opponent]
    return memberData


def getFriendDataFromDoc(sender, friendId, clients):
    senderDoc = db['users'].find_one({'userid': sender})
    friendData = dict()
    if friendId in senderDoc["friendids"]:
        friendDataDoc = senderDoc['friends'][friendId]
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
    return friendData


def getCommunitiesListDoc(sender, clients):
    senderDoc = db['users'].find_one({'userid': sender})
    data = dict()
    for communityid in senderDoc["communityids"]:
        communityQuery = {
            '$and': [{'type': 'group'}, {'communityid': communityid}, {'members': sender}]}
        communityDoc = db['communities'].find_one(communityQuery)
        data[communityid] = getMemberData(sender, communityDoc, clients)
    return data


def getFriendsListDoc(sender, clients):
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


def updateCommunitiesListDoc(sender, communityDoc, clients, action):
    senderDoc = db['users'].find_one({'userid': sender})
    communityid = communityDoc['communityid']
    if action == "create":
        senderCommunity = getMemberData(sender, communityDoc, clients)
        senderCommunities = copy.deepcopy(senderDoc["communities"])
        senderCommunities[communityid] = senderCommunity
        senderCommunityids = copy.deepcopy(senderDoc["communityids"])
        senderCommunityids.append(communityid)
        newvalues = {"$set": {"communities": senderCommunities,
                              "communityids": senderCommunityids}}
        db['users'].update_one({'userid': sender}, newvalues)
        return senderCommunity


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
            newvalues = {"$set": {"friends": senderFriends,
                                  "friendids": senderFriendids}}
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
            newvalues = {"$set": {"friends": receiverFriends,
                                  "friendids": receiverFriendids}}
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
            newvalues = {"$set": {"friends": senderFriends}}
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
            newvalues = {"$set": {"friends": receiverFriends}}
            db['users'].update_one({'userid': receiver}, newvalues)
            result['toReceiver'] = receiverFriend
            result['status'] = "success"
    if action == "removeFriend":
        if receiver in senderDoc["friendids"] and sender in receiverDoc["friendids"]:
            senderFriends = copy.deepcopy(senderDoc["friends"])
            senderFriends.pop(receiver)
            senderFriendids = copy.deepcopy(senderDoc["friendids"])
            senderFriendids.remove(receiver)
            newvalues = {"$set": {"friends": senderFriends,
                                  "friendids": senderFriendids}}
            db['users'].update_one({'userid': sender}, newvalues)

            receiverFriends = copy.deepcopy(receiverDoc["friends"])
            receiverFriends.pop(sender)
            receiverFriendids = copy.deepcopy(receiverDoc["friendids"])
            receiverFriendids.remove(sender)
            newvalues = {"$set": {"friends": receiverFriends,
                                  "friendids": receiverFriendids}}
            db['users'].update_one({'userid': receiver}, newvalues)
            result['status'] = "success"
    return result
