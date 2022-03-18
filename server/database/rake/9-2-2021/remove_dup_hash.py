import pymongo
import re
from tqdm import tqdm

def check_has_history(para_sentence):
    n_histories = db.para_sentence_history.find({'para_sentence_id': para_sentence['_id']}).count()
    return n_histories > 0

def remove_dup_hash():

    hash_groups = db.para_sentence.aggregate([
        {
            '$group': {
                '_id': '$original_para_sentence.hash_content',
                'count': {'$sum': 1}
            }
        }
    ])


    for hash_group in tqdm(hash_groups, desc="Find duplicated hash"):
        hash = hash_group['_id']
        count = hash_group['count']
        if count < 2: continue
        similar_parasentences = list(db.para_sentence.find({'original_para_sentence.hash_content': hash}))

        print('similar hash', hash, len(similar_parasentences))
        # remove the ones which don't have history
        have_history_mask = [check_has_history(para_sentence) for para_sentence in similar_parasentences]

        have_history_mask[0] = True # always keep the first one

        for have_history, para_sentence in zip(have_history_mask, similar_parasentences):
            if not have_history:
                db.para_sentence.delete_one({'_id': para_sentence['_id']})


if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']
    
    remove_dup_hash()


