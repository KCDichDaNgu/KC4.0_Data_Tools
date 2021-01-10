# import pandas as pd
import time
import hashlib
from database.models.para_sentence import ParaSentence, UserRating
from datetime import timedelta, datetime

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

def import_parasentences_from_file(text_file):
    count = 0
    n_rows = 0
    n_error_hash_exists = 0

    with open(text_file, encoding='utf-16') as fp:
        for line in fp:
            score, text1, text2 = line.strip('\n').split('\t')
            lang1 = 'vi'
            lang2 = 'khm'
            # rating = UserRating.RATING_TYPES['unRated'] 

            try:
                hash = hash_para_sentence(text1, text2, lang1, lang2)

                para_sentence = ParaSentence(
                    text1=text1,
                    text2=text2,
                    lang1=lang1,
                    lang2=lang2,
                    # rating=rating,
                    editor_id=None,
                    origin_para_document_id=None,
                    para_document_id=None,
                    score={"senAlign": score},
                    hash=hash,
                    created_time=time.time(),
                    updated_at=time.time())

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


# def import_parasentences_from_file(excel_file):
#     xl = pd.ExcelFile(excel_file)
#     sheet_names = xl.sheet_names
#     df = xl.parse(sheet_names[0])

#     columns = ['text1', 'text2', 'lang1', 'lang2', 'rating',
#         'editor_id', 'origin_para_document_id', 'para_document_id',
#         'score']
    
#     count = 0
#     n_rows = len(df)

#     for row_data in df[columns].values:
#         text1, text2, lang1, lang2, rating, editor_id, origin_para_document_id, \
#             para_document_id, score = row_data

#         try:
#             # convert rating to db form
#             if rating in ParaSentence.RATE_MAPPING_EN2STANDARD:
#                 rating = ParaSentence.RATE_MAPPING_EN2STANDARD[rating]
#             elif rating in ParaSentence.RATE_MAPPING_VI2STANDARD:
#                 rating = ParaSentence.RATE_MAPPING_VI2STANDARD[rating]

#             hash = hash_para_sentence(text1, text2, lang1, lang2)

#             para_sentence = ParaSentence(
#                 text1=text1,
#                 text2=text2,
#                 lang1=lang1,
#                 lang2=lang2,
#                 rating=rating,
#                 editor_id=str(editor_id),
#                 origin_para_document_id=str(origin_para_document_id),
#                 para_document_id=str(para_document_id),
#                 score={"senAlign": score},
#                 hash=hash,
#                 created_time=time.time(),
#                 updated_at=time.time())

#             para_sentence.save()

#             count += 1
#         except:
#             continue

#     return count, n_rows

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

