from constants.common import DOC_ALIGNMENT_FILE_DIR

import os, time
import hashlib
from database.models.para_document import ParaDocument, NewestParaDocument, OriginalParaDocument, ParaDocumentText
from database.models.user import User
from datetime import timedelta, datetime
import re
from bson import ObjectId

def save_to_local_file(data):

    text1 = data['text1']
    lang1 = data['lang1']

    text2 = data['text2']
    lang2 = data['lang2']

    new_dir_path = f'{DOC_ALIGNMENT_FILE_DIR}/{time.time()}'

    if not os.path.isdir(new_dir_path):
        os.makedirs(new_dir_path)

    file1_path = f'{new_dir_path}/{lang1}.txt'
    file2_path = f'{new_dir_path}/{lang2}.txt'

    with open(file1_path, 'w+') as f:
        f.write(text1)

        f.close()

    with open(file2_path, 'w+') as f: 
        f.write(text2)

        f.close()

    return {
        'lang1': lang1,
        'lang2': lang2,
        'file1_path': file1_path,
        'file2_path': file2_path
    }

def hashtext(text):
    hasher = hashlib.md5()
    buf = text.encode('utf8')
    hasher.update(buf)
    return hasher.hexdigest()

def hash_para_document(text1, text2, lang1, lang2):
    text = f"{text1}\n{text2}\n{lang1}\n{lang2}"
    hash = hashtext(text)
    return hash

def get_view_due_date(minutes_to_expire=15):
    cur_time = datetime.now()
    end_time = cur_time + timedelta(minutes=minutes_to_expire)
    end_timestamp = end_time.timestamp()
    return end_timestamp

def remove_viewer_from_old_paradocuments(user_id):
    para_documents = ParaDocument.objects(viewer_id=user_id)
    updated = para_documents.update(viewer_id=None, view_due_date=None)
    return updated

def get_highest_user_role(user_roles):
    role_values = [ROLE2IDX[role] for role in user_roles]
    max_role_value = max(role_values)
    max_role_name = IDX2ROLE[max_role_value]
    return max_role_name

def is_member_only(user_roles):
    return len(user_roles) == 1 and user_roles[0] == User.USER_ROLES['member']

def build_query_params(args):
    # delete null in args
    args = {key: value for key, value in args.items() if len(str(value).strip()) > 0}

    query = {
        '$and': []
    }

    # filter params send by request
    if 'rating' in args and args['rating'] != 'all':
        query['$and'].append({
            'newest_para_document.rating': args['rating']
        })

    if 'alignment_status' in args and args['alignment_status'] != 'all':
        query['$and'].append({
            'alignment_status': args['alignment_status']
        })
        
    if 'lang1' in args and args['lang1'] != 'all':
        query['$and'].append({
            'newest_para_document.text1.lang': args['lang1']
        })

    if 'lang2' in args and args['lang2'] != 'all':
        query['$and'].append({
            'newest_para_document.text2.lang': args['lang2']
        })

    if 'updatedAt__fromDate' in args:
        updated_at_from_date = float(args['updatedAt__fromDate']) / 1000

        query['$and'].append({
            'updated_at': {
                '$gte': updated_at_from_date
            }
        })

    if 'updatedAt__toDate' in args:
        updated_at_to_date = float(args['updatedAt__toDate']) / 1000

        query['$and'].append({
            'updated_at': {
                '$lte': updated_at_to_date
            }
        })

    if 'score__from' in args:
        score__from = float(args['score__from'])

        query['$and'].append({
            'score.senAlign': {
                '$gte': score__from
            }
        })

    if 'score__to' in args:
        score__to = float(args['score__to'])

        query['$and'].append({
            'score.senAlign': {
                '$lte': score__to
            }
        })

    if 'creator_id' in args:
        query['$and'].append(({
            'creator_id': ObjectId(args['creator_id'])
        }))
        
    # query string contains
    append_or = False

    if 'text1' in args:
        pattern = re.compile(f".*{args['text1']}.*", re.IGNORECASE)

        query['$and'].append({
            '$or': [
                {
                    'newest_para_document.text1.content': {'$regex': pattern}
                }
            ]
        })

        append_or = True

    if 'text2' in args:
        pattern = re.compile(f".*{args['text2']}.*", re.IGNORECASE)

        if append_or:
            query['$and'][-1]['$or'].append(
                {
                    'newest_para_document.text2.content': {'$regex': pattern}
                }
            )
        else:
            query['$and'].append({
                '$or': [
                    {
                        'newest_para_document.text2.content': {'$regex': pattern}
                    }
                ]
            })

    if len(query['$and']) == 0:
        del query['$and']

    return query

