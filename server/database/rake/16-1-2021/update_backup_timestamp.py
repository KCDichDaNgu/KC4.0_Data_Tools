import pymongo

import time

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']

    for backup in db.backup.find():
        hash_name = backup['hash_name']
        db.backup.update({'_id': backup['_id']}, {'$set': {'created_at': float(hash_name[:-3])}})

