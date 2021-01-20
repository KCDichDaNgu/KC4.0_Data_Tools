import pymongo

import time

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']

    for para_sentence in db.para_sentence.find():
        senAlign = float(para_sentence['score']['senAlign'])
        
        db.para_sentence.update_one(
            { '_id': para_sentence['_id'] }, 
            { '$set': { 'score.senAlign': senAlign }}
        )
