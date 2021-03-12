from pymongo import MongoClient
import editdistance
from tqdm import tqdm

def compute_edit_distance(old_text1, old_text2, new_text1, new_text2):
    editdistance1 = editdistance.eval(old_text1, new_text1)
    editdistance2 = editdistance.eval(old_text2, new_text2)
    return editdistance1 + editdistance2

def add_edit_distance_to_history():
    all_histories = list(db['para_sentence_history'].find())
    # group by para_sentence_id
    para_id2histories = {}

    for history in all_histories:
        para_id = history['para_sentence_id']
        if para_id not in para_id2histories:
            para_id2histories[para_id] = []

        para_id2histories[para_id].append(history)

    # sort each group by updated_at
    # for each group, compute edit distance
    for para_id in tqdm(para_id2histories.keys(), desc="Updating"):
        sorted_histories = sorted(para_id2histories[para_id], key=lambda x: x['updated_at'])
        # find last updated
        para_sentence = db['para_sentence'].find_one({'_id': para_id})
        
        editted_sequence = sorted_histories + [para_sentence]
        edit_distance_list = []
        for i in range(len(editted_sequence)-1):
            old_para = editted_sequence[i]['newest_para_sentence']
            cur_para = editted_sequence[i+1]['newest_para_sentence']

            edit_distance = compute_edit_distance(
                old_para['text1']['content'],
                old_para['text2']['content'],
                cur_para['text1']['content'],
                cur_para['text2']['content']
            )
            edit_distance_list.append(edit_distance)
        # 
        for edit_distance, para_history in zip(edit_distance_list, sorted_histories):
            db['para_sentence_history'].update_one({'_id': para_history['_id']},
                {'$set': {
                    'edit_distance': edit_distance
                }})

if __name__ == '__main__':
    mongo = MongoClient()
    db = mongo['data-tool']
    add_edit_distance_to_history()
    # for backup in db.backup.find():
    #     hash_name = backup['hash_name']
    #     db.backup.update({'_id': backup['_id']}, {'$set': {'created_at': float(hash_name[:-3])}})
