import pymongo

import time

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']

    old_db = client['data-tool-21-01']

    ph_without_editor = list(old_db.para_sentence_history.find({'editor': {'$exists': False}}))

    db.para_sentence_history.insert_many(ph_without_editor)

    ph_without_editor_main = list(db.para_sentence_history.find({'editor': {'$exists': False}}))

    for para_history in ph_without_editor_main:
        id = para_history['_id']
        # para_sentence = db.para_sentence.find_one({'last_history_record_id': id})
        para_sentence = db.para_sentence.find_one({'id': para_history['para_sentence_id']})

        if para_sentence is not None:
            db.para_sentence_history.update_one(
                {'_id': id},
                {'$set': {
                    'editor': para_sentence['editor']
                }}
            )
            print('updated')


    print('check every para sentences have editor')
    print(len(list(db.para_sentence_history.find({'editor': {'$exists': False}}))))
