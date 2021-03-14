from pymongo import MongoClient
from pymongo.errors import CollectionInvalid
from collections import OrderedDict
from common import *
import random

import os

dbclient = MongoClient("mongodb+srv://user:pass@onboardgames.xuuxa.mongodb.net/OnBoardGames?retryWrites=true&w=majority")
#dbclient = MongoClient(os.getenv("MONGODB_URI","mongodb://127.0.0.1:27017/OnBoardGames"))
db = dbclient["OnBoardGames"]

dbModels = dict()

dbModels['users'] = dict()
dbModels['users']['schema'] = {
    'firstname': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'lastname': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'email': {
        'type': 'string',
        "required": True,
    },
    'userid': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'password': {
        'type': 'binData',
        'minlength': 1,
        'required': True,
    },
    'friends': {
        'type': 'object',
        'required': True,
    },
    'friendids': {
        'type': 'array',
        'required': True,
    },
    'communities': {
        'type': 'object',
        'required': True,
    },
    'communityids': {
        'type': 'array',
        'required': True,
    },
    'games': {
        'type': 'object',
        'required': True,
    },
    'stats': {
        'type': 'object',
        'required': True,
    },
}

dbModels['games'] = dict()
dbModels['games']['schema'] = {
    'gameid' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },
    'fen' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },
    'player_1' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },
    'player_2' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },
    #'type' : {
    #    'type': 'string',
    #    'minlength': 1,
    #    'required' : True,
    #},   
    #'starttime' : {
    #    'type': 'timestamp',
    #    'required' : True,
    #},      
    #'players' : {
    #    'type': 'object',
    #    'required' : True,
    #},     
    #'status' : {
    #    'type': 'string',
    #    'minlength': 1,
    #    'required' : True,        
    #} ,        
    #'state' : {
    #    'type': 'object',
    #    'required' : False,
    #}, 
}

dbModels['communities'] = dict()
dbModels['communities']['schema'] = {
    'type': {
        'type': 'string',
        'required': True,
        'enum': ['1:1', 'group']
    },
    'communityid': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'owner': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'members': {
        'type': 'array',
        'required': True,
    },
    'results': {
        'type': 'object',
        'required': True,
    },
    'membership': {
        'type': 'object',
        'required': True,
    },
    'tournaments': {
        'type': 'array',
        'required': False,
    },
    'messages': {
        'type': 'array',
        'required': False,
    },
}

dbModels['tournaments'] = dict()
dbModels['tournaments']['schema'] = {
    'type': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'schedule': {
        'type': 'object',
        'required': True,
    },
    'players': {
        'type': 'object',
        'required': True,
    },
    'results': {
        'type': 'object',
        'required': False,
    },
    'status': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
}
dbModels['messages'] = dict()
dbModels['messages']['schema'] = {
    'type': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'message': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'sender': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'reciever': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'timestamp': {
        'type': 'timestamp',
        'required': True,
    },
}

for dbModelKey in dbModels:
    dbModel = dbModels[dbModelKey]
    dbModelSchema = dbModel['schema']
    validator = {'$jsonSchema': {'bsonType': 'object', 'properties': {}}}
    required = []
    for fieldKey in dbModelSchema:
        field = dbModelSchema[fieldKey]
        properties = {'bsonType': field['type']}
        minimum = field.get('minlength')

        if field.get('enum'):
            properties['enum'] = field.get('enum')

        if type(minimum) == int:
            properties['minimum'] = minimum

        if field.get('required') is True:
            required.append(fieldKey)

        validator['$jsonSchema']['properties'][fieldKey] = properties

        if len(required) > 0:
            validator['$jsonSchema']['required'] = required

        query = [('collMod', dbModelKey),
                 ('validator', validator)]

        try:
            db.create_collection(dbModelKey)
        except CollectionInvalid:
            pass

        command_result = db.command(OrderedDict(query))

if __name__ == '__main__':
    maxUsers = 100
    maxFriendPairs = 1000
    for i in range(maxUsers):
        userid = "player" + str(i)
        firstname = userid
        lastname = "test"
        email = userid + "@gmail.com"
        password = "abcdef"
        createNewUserDoc(userid, firstname, lastname, email, password.encode('utf-8'))
    
    possiblePairs = [(x,y) for x in range(maxUsers) for y in range(maxUsers) if x != y]

    selectPairs = random.sample(possiblePairs,maxFriendPairs*2)
    i = 0
    friendPairs = list() 
    for friendPair in selectPairs:
        sender = "player" + str(friendPair[0])
        receiver = "player" + str(friendPair[1])
        senderCount = db['users'].count_documents({'userid': sender})
        receiverCount = db['users'].count_documents({'userid': receiver})

        communityQuery = {'$and': [{'type': '1:1'}, {
            'members': sender}, {'members': receiver}]}
        communityCount = db['communities'].count_documents(communityQuery) 
        if senderCount > 0 and receiverCount > 0:
            sendInviteStatus = updateFriendsListDoc(sender, receiver, 'sendInvite')
            if sendInviteStatus['status'] == 'success':
                i += 1
                friendPairs.append(friendPair)
                if communityCount == 0:
                    communitytype = '1:1'
                    communityid = sender + '_' + receiver
                    owner = sender
                    members = [sender, receiver]
                    createNewCommunityDoc(communitytype, communityid, owner, members)
                if i >= maxFriendPairs:
                    break