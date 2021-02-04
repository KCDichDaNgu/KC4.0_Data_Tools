import pymongo

import time

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']
    
    db.setting.insert_one({
        'content': {
            'min_words_of_vietnamese_sentence': 11
        },
        'created_at': time.time(), 
        'updated_at': time.time(), 
    })

