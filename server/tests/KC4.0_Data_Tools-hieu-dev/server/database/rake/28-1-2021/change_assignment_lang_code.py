import pymongo

import time

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']

    for assignment in db.assignment.find({'lang_scope.0.lang2': 'khm'}):
        
        db.assignment.update_one(
            { '_id': assignment['_id'] }, 
            { '$set': { 'lang_scope.0.lang2': 'km' }}
        )
