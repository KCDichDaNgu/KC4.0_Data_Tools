from pymongo import MongoClient
import editdistance
from tqdm import tqdm

def compute_edit_distance(old_text1, old_text2, new_text1, new_text2):
    editdistance1 = editdistance.eval(old_text1, new_text1)
    editdistance2 = editdistance.eval(old_text2, new_text2)
    return editdistance1 + editdistance2

def move_edit_distance_to_para_sentence():
    db['para_sentence_history'].update_many({}, {'$unset': {'edit_distance': 1}})

    for para_sentence in tqdm(db['para_sentence'].find()):
        edit_distance = compute_edit_distance(
            para_sentence['original_para_sentence']['text1']['content'].strip(),
            para_sentence['original_para_sentence']['text2']['content'].strip(),
            para_sentence['newest_para_sentence']['text1']['content'].strip(),
            para_sentence['newest_para_sentence']['text2']['content'].strip(),
        )
        db['para_sentence'].update_one(
            {'_id': para_sentence['_id']},
            {'$set': {'edit_distance': edit_distance}}
        )

if __name__ == '__main__':
    mongo = MongoClient()
    db = mongo['data-tool']
    move_edit_distance_to_para_sentence()
    # for backup in db.backup.find():
    #     hash_name = backup['hash_name']
    #     db.backup.update({'_id': backup['_id']}, {'$set': {'created_at': float(hash_name[:-3])}})
