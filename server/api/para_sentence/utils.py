# import pandas as pd
import time
import hashlib
from database.models.para_sentence import ParaSentence, NewestParaSentence, OriginalParaSentence, ParaSentenceText
from database.models.user import User
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

def import_parasentences_from_file(text_file, creator_id):
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
        lang1 = 'vi'
        lang2 = 'khm'

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
                score={"senAlign": score},
                creator_id=creator_id)

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
