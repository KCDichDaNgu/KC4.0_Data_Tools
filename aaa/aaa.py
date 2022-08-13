import pymongo
import hashlib
import random
import time
import editdistance
from pymongo import UpdateOne
from datetime import datetime, timedelta
import traceback
import re

def hashtext(text):
    hasher = hashlib.md5()
    buf = text.encode('utf8')
    hasher.update(buf)
    return hasher.hexdigest()

def hash_para_sentence(text1, text2, lang1, lang2):
    text = f"{text1}\n{text2}\n{lang1}\n{lang2}"
    hash = hashtext(text)
    return hash

RATING_TYPES = {
    'good': 'good',
    'bad': 'bad',
    'unRated': 'unRated'
}


if __name__ == "__main__":
    
    import argparse

    parser = argparse.ArgumentParser()
    
    parser.add_argument(
        '--db',
        type=str,
        default='data-tool',
        help='Debug type'
    )

    parser.add_argument(
        '--host',
        type=str,
        default='localhost',
        help='Debug type'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        default=27017,
        help='Debug type'
    )

    args = parser.parse_args()
    
    client = pymongo.MongoClient(args.host, args.port)

    db = client[args.db]
    
    text_file = './VietTrung.txt'
    
    creator_id = db.user.find_one({'roles': 'admin', 'username': 'admin'})['_id']
    
    editors = list(db.user.find({'roles': 'member'}))

    if not db.user.find_one({'username': 'nmtuet'}):
        db.user.insert_one({
            'roles': ['admin'], 
            'username': 'nmtuet',
            'password': '12345678',
            'first_name': 'nmtuet#first_name',
            'last_name': 'nmtuet#last_name',
            'created_at': datetime.now().timestamp(),
            'updated_at': datetime.now().timestamp(),
            'status': 'active',
            'email': 'nmtuet@gmail.com',
            'extras': {}
        })
    
    lang1 = 'vi'
    lang2 = 'zh'
    
    dataFieldId = db.data_field.find_one()['_id']

    try:
        lines =  open(text_file, encoding='utf-8').readlines()
    except UnicodeDecodeError as err:
        lines =  open(text_file, encoding='utf-16').readlines()

    new_para_sentence_records = []
    
    start_date = datetime(2021, 1, 1)
    end_date = datetime(2021, 6, 1) 
    
    seconds_between_dates = (end_date - start_date).days * 24 * 60 * 60
    
    for index, line in enumerate(lines):
        
        editor = random.choice(editors)
        
        elms = line.strip('\n').split('\t')

        if len(elms) != 3: continue

        score, text1, text2 = elms

        try:
            # import pdb; pdb.set_trace()
            hash = hash_para_sentence(text1.strip(), text2.strip(), lang1, lang2)

            para_sentence = dict(
                newest_para_sentence=dict(
                    text1=dict(
                        content=text1.strip(),
                        lang=lang1,
                        words_count=len(re.split("\s+", text1.strip()))
                    ),
                    text2=dict(
                        content=text2.strip(),
                        lang=lang2,
                        words_count=len(re.split("\s+", text2.strip()))
                    ),
                    hash_content=hash,
                    rating=RATING_TYPES['good'],
                ),
                original_para_sentence=dict(
                    text1=dict(
                        content=text1.strip(),
                        lang=lang1,
                        words_count=len(re.split("\s+", text1.strip()))
                    ),
                    text2=dict(
                        content=text2.strip(),
                        lang=lang2,
                        words_count=len(re.split("\s+", text2.strip()))
                    ),
                    hash_content=hash,
                    rating=RATING_TYPES['unRated'],
                ),
                score={ "senAlign": float(score) },
                creator_id=creator_id,
                data_field_id=dataFieldId,
                # created_at=time.time(),
                # updated_at=time.time()
                editor={
                    'user_id': editor['_id'],
                    'roles': editor['roles']
                },
                edit_distance=0
            )
            
            new_para_sentence_records.append(para_sentence)
                
            if len(new_para_sentence_records) > 9999:
                
                new_para_sentence_records_hash = []
                
                existed_doc = []
                existed_doc_hash = []
                
                try:
                    
                    for e in new_para_sentence_records:
                    
                        new_para_sentence_records_hash.append(e['original_para_sentence']['hash_content'])
                
                    existed_doc = list(db.para_sentence.find({
                        'original_para_sentence.hash_content': {
                            '$in': new_para_sentence_records_hash
                        }
                    }))
                    
                except:
                    existed_doc = []
                    existed_doc_hash = []
                    
                existed_doc_hash = [e['original_para_sentence']['hash_content'] for e in existed_doc]

                new_para_sentence_records = list(filter(lambda e: e['original_para_sentence']['hash_content'] not in existed_doc_hash, new_para_sentence_records))
            
            if len(new_para_sentence_records) > 9999 or (index == len(lines) - 1 and len(new_para_sentence_records) > 0):
                
                new_para_sentence_records_hash = []
                
                existed_doc = []
                existed_doc_hash = []
                
                try:
                    
                    for e in new_para_sentence_records:
                    
                        new_para_sentence_records_hash.append(e['original_para_sentence']['hash_content'])
                
                    existed_doc = list(db.para_sentence.find({
                        'original_para_sentence.hash_content': {
                            '$in': new_para_sentence_records_hash
                        }
                    }))
                    
                except:
                    existed_doc = []
                    existed_doc_hash = []
                    
                existed_doc_hash = [e['original_para_sentence']['hash_content'] for e in existed_doc]

                new_para_sentence_records = list(filter(lambda e: e['original_para_sentence']['hash_content'] not in existed_doc_hash, new_para_sentence_records))
                
                if len(new_para_sentence_records) == 0: continue

                para_sentence_created_at = start_date + timedelta(seconds=random.randrange(seconds_between_dates - 1)) 
                
                seconds_between_created_at_and_updated_at = ((end_date - para_sentence_created_at).days + 1) * 24 * 60 * 60
                
                for x in new_para_sentence_records:

                    x.update(dict(
                        created_at=para_sentence_created_at.timestamp(),
                        updated_at=(para_sentence_created_at + timedelta(seconds=random.randrange(seconds_between_created_at_and_updated_at))).timestamp(),
                    ))

                para_sentence_inserted_ids = db.para_sentence.insert_many(new_para_sentence_records).inserted_ids

                new_para_sentence_history_records = []
                
                for _i, _id in enumerate(para_sentence_inserted_ids):
                
                    new_para_sentence_records[_i].update(dict(_id=_id))
                    
                    new_para_sentence_history_record = dict(
                        para_sentence_id=_id,
                        newest_para_sentence=new_para_sentence_records[_i]['newest_para_sentence'],
                        editor=new_para_sentence_records[_i]['editor'],
                        updated_at=new_para_sentence_records[_i]['updated_at'],
                    )
                    
                    new_para_sentence_history_records.append(new_para_sentence_history_record)
                    
                para_sentence_history_inserted_ids = db.para_sentence_history.insert_many(new_para_sentence_history_records).inserted_ids

                update_requests = []
                
                for _ps_i, _psh_i in zip(para_sentence_inserted_ids, para_sentence_history_inserted_ids):
                    
                    update_requests.append(UpdateOne({'_id': _ps_i}, {'$set': {'last_history_record_id': _psh_i}}))
                    
                db.para_sentence.bulk_write(update_requests)
                
                new_para_sentence_records = []
                
                print(index)

        except Exception as err:
            print(traceback.format_exc())
            # import pdb; pdb.set_trace()
