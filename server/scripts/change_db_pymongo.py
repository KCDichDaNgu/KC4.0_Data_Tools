from pymongo import MongoClient
from tqdm import tqdm
import json

mongodb = MongoClient()
db = mongodb['data-tool']

def change_db():
    para_sentences = db.para_sentence.find()

    for para_sentence in tqdm(para_sentences, desc="Update parasentence"):
        histories = list(db.para_sentence_history.find({
            'para_sentence_id': para_sentence['_id']
        }).sort('updated_at', -1))

        if len(histories) > 0:
            last_update = histories[0]
        else:
            last_update = None

        original_para_sentence = {
            'text1': {
                'content': para_sentence['text1'],
                'lang': para_sentence['lang1']
            },
            'text2': {
                'content': para_sentence['text2'],
                'lang': para_sentence['lang2']
            },
            'rating': para_sentence['rating'],
            'hash_content': para_sentence['hash']
        }
        
        newParaSentence = {
            'newest_para_sentence': {
                'text1': {
                    'content': para_sentence['text1'],
                    'lang': para_sentence['lang1']
                },
                'text2': {
                    'content': para_sentence['text2'],
                    'lang': para_sentence['lang2']
                },
                'rating': para_sentence['rating'],
                'hash_content': para_sentence['hash']
            },
            'original_para_sentence': original_para_sentence,
            'last_history_record_id': last_update['_id'] if last_update is not None else None,
            'created_at': para_sentence['created_time']
        }

        if 'editor_id' in para_sentence and para_sentence['editor_id'] is not None:
            user = db.user.find_one({'_id': para_sentence['editor_id']})
            newParaSentence['editor'] = {
                'user_id': para_sentence['editor_id'],
                'roles': user['roles']
            }

        db.para_sentence.update(
            {'_id': para_sentence['_id']}, 
            {
                '$set': newParaSentence,
                '$unset': {
                    'text1': 1,
                    'text2': 1,
                    'lang1': 1,
                    'lang2': 1,
                    'rating': 1,
                    'editor_id': 1,
                    'editor_role': 1,
                    'created_time': 1,
                    'hash': 1,
                    'original': 1
                }
            }, upsert=False, multi=False)

        for history in histories:
            para_sentence_history = {
                'newest_para_sentence': {
                    'text1': {
                        'content': history['text1'],
                        'lang': para_sentence['lang1']
                    },
                    'text2': {
                        'content': history['text2'],
                        'lang': para_sentence['lang2']
                    },
                    'rating': history['rating'],
                    'hash_content': para_sentence['hash']
                },
            }

            if 'editor_id' in history and history['editor_id'] is not None:
                user = db.user.find_one({'_id': history['editor_id']})
                para_sentence_history['editor'] = {
                    'user_id': history['editor_id'],
                    'roles': user['roles']
                }

            db.para_sentence_history.update(
                {'_id': history['_id']},
                {
                    '$set': para_sentence_history,
                    '$unset': {
                        'text1': 1,
                        'text2': 1,
                        'rating': 1,
                        'editor_id': 1,
                        'editor_role': 1
                    }
                },
                upsert=False,
                multi=False
            )
change_db()
