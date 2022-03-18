import pymongo

import time

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']

    for para_sentence in db.para_sentence.find({'original_para_sentence.text2.lang': 'khm'}):
        
        db.para_sentence.update_one(
            { '_id': para_sentence['_id'] }, 
            { '$set': { 'original_para_sentence.text2.lang': 'km' }}
        )

    for para_sentence in db.para_sentence.find({'newest_para_sentence.text2.lang': 'khm'}):
        
        db.para_sentence.update_one(
            { '_id': para_sentence['_id'] }, 
            { '$set': { 'newest_para_sentence.text2.lang': 'km' }}
        )

    for para_sentence_history in db.para_sentence_history.find({'newest_para_sentence.text2.lang': 'khm'}):
        
        db.para_sentence_history.update_one(
            { '_id': para_sentence_history['_id'] }, 
            { '$set': { 'newest_para_sentence.text2.lang': 'km' }}
        )
