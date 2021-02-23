# import pandas as pd
import time
import hashlib
from database.models.para_sentence import ParaSentence, NewestParaSentence, OriginalParaSentence, ParaSentenceText
from database.models.user import User
from datetime import timedelta, datetime
import pandas as pd
import re
from bson import ObjectId
from database.models.setting import Setting

ROLE2IDX = {
    None: 0,
    'member': 1,
    'reviewer': 2,
    'admin': 2,
}

IDX2ROLE = {
    0: None,
    1: 'member',
    2: 'reviewer'
}

RATING_KEY2TEXT = {
    ParaSentence.RATING_TYPES['good']: 'Tốt',
    ParaSentence.RATING_TYPES['bad']: 'Kém',
    ParaSentence.RATING_TYPES['unRated']: 'Chưa đánh giá'
}

def import_parasentences_by_sent_align(data):
    
    creator_id = data['creator_id']

    lang1 = data['lang1']
    lang2 = data['lang2']
    
    dataFieldId = data['dataFieldId']
    sentPairs = data['pairs']

    para_document = data['para_document']
    
    count = 0
    n_rows = 0
    n_error_hash_exists = 0

    for pair in sentPairs:

        score, text1, text2 = pair['score'], pair['text1'], pair['text2']

        try:
            hash_content = hash_para_sentence(text1, text2, lang1, lang2)

            para_sentence = ParaSentence(
                newest_para_sentence=NewestParaSentence(
                    text1=ParaSentenceText(
                        content=text1,
                        lang=lang1
                    ),
                    text2=ParaSentenceText(
                        content=text2,
                        lang=lang2
                    ),
                    hash_content=hash_content
                ),
                original_para_sentence=OriginalParaSentence(
                    text1=ParaSentenceText(
                        content=text1,
                        lang=lang1
                    ),
                    text2=ParaSentenceText(
                        content=text2,
                        lang=lang2
                    ),
                    hash_content=hash_content
                ),
                score={ "senAlign": float(score) },
                creator_id=creator_id,
                data_field_id=dataFieldId,
                para_document_id=para_document.id,
                domain_id=para_document.domain_id,
                created_at=time.time(),
                updated_at=time.time()
            )

            para_sentence.save()

            count += 1
            
        except Exception as err:
            if str(err) == "hashExists":
                n_error_hash_exists += 1

        n_rows += 1

    return {
        'nSuccess': count,
        'nData': n_rows,
        'nErrorHashExists': n_error_hash_exists
    }

def import_parasentences_from_file(data):

    text_file = data['filepath']
    creator_id = data['creator_id']

    lang1 = data['lang1']
    lang2 = data['lang2']
    
    dataFieldId = data['dataFieldId']

    count = 0
    n_rows = 0
    n_error_hash_exists = 0

    try:
        lines =  open(text_file, encoding='utf-8').readlines()
    except UnicodeDecodeError as err:
        lines =  open(text_file, encoding='utf-16').readlines()

    for line in lines:
        elms = line.strip('\n').split('\t')

        if len(elms) != 3: continue

        score, text1, text2 = elms

        try:
            hash = hash_para_sentence(text1, text2, lang1, lang2)

            para_sentence = ParaSentence(
                newest_para_sentence=NewestParaSentence(
                    text1=ParaSentenceText(
                        content=text1,
                        lang=lang1
                    ),
                    text2=ParaSentenceText(
                        content=text2,
                        lang=lang2
                    ),
                    hash_content=hash
                ),
                original_para_sentence=OriginalParaSentence(
                    text1=ParaSentenceText(
                        content=text1,
                        lang=lang1
                    ),
                    text2=ParaSentenceText(
                        content=text2,
                        lang=lang2
                    ),
                    hash_content=hash
                ),
                score={ "senAlign": float(score) },
                creator_id=creator_id,
                data_field_id=dataFieldId,
                created_at=time.time(),
                updated_at=time.time()
            )

            para_sentence.save()

            count += 1
        except Exception as err:
            if str(err) == "hashExists":
                n_error_hash_exists += 1

        n_rows += 1

    return {
        'nSuccess': count,
        'nData': n_rows,
        'nErrorHashExists': n_error_hash_exists
    }

def hashtext(text):
    hasher = hashlib.md5()
    buf = text.encode('utf8')
    hasher.update(buf)
    return hasher.hexdigest()

def hash_para_sentence(text1, text2, lang1, lang2):
    text = f"{text1}\n{text2}\n{lang1}\n{lang2}"
    hash = hashtext(text)
    return hash

def get_view_due_date(minutes_to_expire=15):
    cur_time = datetime.now()
    end_time = cur_time + timedelta(minutes=minutes_to_expire)
    end_timestamp = end_time.timestamp()
    return end_timestamp

def remove_viewer_from_old_parasentences(user_id):
    para_sentences = ParaSentence.objects(viewer_id=user_id)
    updated = para_sentences.update(viewer_id=None, view_due_date=None)
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

    # filter text1.words_count >= threshold
    setting = Setting.objects.first()

    if setting is None:
        min_words = 0
    else:
        min_words = setting['content']['min_words_of_vietnamese_sentence']

    query['$and'].append({
        'newest_para_sentence.text1.words_count': {
            '$gte': min_words
        }
    })

    # filter params send by request
    if 'rating' in args and args['rating'] != 'all':
        query['$and'].append({
            'newest_para_sentence.rating': args['rating']
        })
        
    if 'lang1' in args and args['lang1'] != 'all':
        query['$and'].append({
            'newest_para_sentence.text1.lang': args['lang1']
        })

    if 'lang2' in args and args['lang2'] != 'all':
        query['$and'].append({
            'newest_para_sentence.text2.lang': args['lang2']
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

    if 'editorId' in args:
        query['$and'].append(({
            'editor.user_id': ObjectId(args['editorId'])
        }))
        
    # query string contains
    append_or = False

    if 'text1' in args:
        pattern = re.compile(f".*{args['text1']}.*", re.IGNORECASE)

        query['$and'].append({
            '$or': [
                {
                    'newest_para_sentence.text1.content': {'$regex': pattern}
                }
            ]
        })

        append_or = True

    if 'text2' in args:
        pattern = re.compile(f".*{args['text2']}.*", re.IGNORECASE)

        if append_or:
            query['$and'][-1]['$or'].append(
                {
                    'newest_para_sentence.text2.content': {'$regex': pattern}
                }
            )
        else:
            query['$and'].append({
                '$or': [
                    {
                        'newest_para_sentence.text2.content': {'$regex': pattern}
                    }
                ]
            })

    if len(query['$and']) == 0:
        del query['$and']

    return query

def export_csv_file(para_sentences, out_path):
    columns = [
        'Văn bản 1',
        'Văn bản 2',
        'Văn bản gốc 1',
        'Văn bản gốc 2',
        'Điểm',
        'Đánh giá',
        'Ngôn ngữ 1',
        'Ngôn ngữ 2',
        'Tên miền',
        'Thời gian tạo',
        'Cập nhật lần cuối lúc',
        'Cập nhật lần cuối bởi'
    ]

    data_list = []

    for para_sentence in para_sentences:
        para_sentence = para_sentence.serialize
        data_row = [
            para_sentence['newest_para_sentence'].text1.content,
            para_sentence['newest_para_sentence'].text2.content,
            para_sentence['original_para_sentence'].text1.content,
            para_sentence['original_para_sentence'].text2.content,
            para_sentence['score']['senAlign'],
            RATING_KEY2TEXT[para_sentence['newest_para_sentence'].rating],
            para_sentence['newest_para_sentence'].text1.lang,
            para_sentence['newest_para_sentence'].text2.lang,
            para_sentence['domain']['url'],
            datetime.utcfromtimestamp(para_sentence['created_at']).strftime('%d/%m/%Y %H:%M'),
            datetime.utcfromtimestamp(para_sentence['updated_at']).strftime('%d/%m/%Y %H:%M'),
            para_sentence['editor']['username']
        ]
        data_list.append(data_row)

    df = pd.DataFrame(
        data_list, 
        columns=columns)

    df.to_csv(out_path, index=False)
