from pymongo import MongoClient
from pymongo.errors import CollectionInvalid
from collections import OrderedDict

dbclient = MongoClient("mongodb://localhost:27017/")
db = dbclient["OnBoardGames"]

dbModels = dict()

dbModels['users'] = dict()
dbModels['users']['schema'] = {
    'firstname' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },
    'lastname' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },
    'email': {
        'type': 'string',
        "required": True,
    },
    'userid' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },   
    'password' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    }, 
    'friends' : {
        'type': 'array',
        'required' : True,
    },
    'communities' : {
        'type': 'array',
        'required' : True,
    },
    'games' : {
        'type': 'array',
        'required' : True,
    },                         
}

dbModels['online'] = dict()
dbModels['online']['schema'] = {
    'userid' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },   
    'socketid' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
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
    'communityid' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },   
    'owner' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },      
    'members' : {
        'type': 'array',
        'required' : True,
    },     
    'tournaments' : {
        'type': 'array',
        'required' : False,        
    } ,       
    'messages' : {
        'type': 'array',
        'required' : False,
    },     
}

dbModels['tournaments'] = dict()
dbModels['tournaments']['schema'] = {
    'type' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },   
    'schedule' : {
        'type': 'object',
        'required' : True,
    },      
    'players' : {
        'type': 'object',
        'required' : True,
    }, 
    'results' : {
        'type': 'object',
        'required' : False,
    }, 
    'status' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,        
    },               
}
dbModels['messages'] = dict()
dbModels['messages']['schema'] = {
    'type' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },   
    'message' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },     
    'sender' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },    
    'reciever' : {
        'type': 'string',
        'minlength': 1,
        'required' : True,
    },
    'timestamp' : {
        'type': 'timestamp',
        'required' : True,
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


