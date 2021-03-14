from database.models.user import User 
import time
import hashlib
from database.models.para_sentence import ParaSentence, NewestParaSentence, OriginalParaSentence, ParaSentenceText, Editor
from database.models.para_sentence_history import ParaSentenceHistory
import json
from datetime import timedelta, datetime
import pandas as pd
import re
from bson import ObjectId
from database.models.setting import Setting
from database.db import init_for_migrate
from api.para_sentence.utils import hash_para_sentence
from tqdm import tqdm

import sys

filepath = sys.argv[1]

def update(_id, user):
    # người quản trị chỉ được xem không được sửa
    # nếu user chỉ có roles 'admin' => ko được sửa
    args = {}

    try:
        para_sentence = ParaSentence.objects.get(id=ObjectId(_id))
    except Exception as err:
        print(err)

    try:
        # save revised history
        para_sentence_history = ParaSentenceHistory(
            para_sentence_id=para_sentence.id,
            newest_para_sentence=json.loads(para_sentence.newest_para_sentence.to_json()),
            editor={
                'user_id': user.id,
                'roles': user.roles
            },
            updated_at=time.time()
        )
        para_sentence_history.save()

        # update para sentence
        newest_para_sentence = para_sentence.newest_para_sentence
        newest_para_sentence.text1.content = newest_para_sentence.text1.content.strip()
        newest_para_sentence.text2.content = newest_para_sentence.text2.content.strip()
        newest_para_sentence.rating = ParaSentence.RATING_TYPES['good']

        para_sentence.custom_update(
            newest_para_sentence=newest_para_sentence,
            updated_at=time.time(),
            editor=Editor(
                user_id=user.id,
                roles=user.roles
            ),
            last_history_record_id=para_sentence_history.id
        )

    except Exception as err:
        print(err)

def import_parasentences_from_file(data):

    text_file = data['filepath']
    creator_id = data['creator_id']

    lang1 = data['lang1']
    lang2 = data['lang2']

    count = 0
    n_rows = 0
    n_error_hash_exists = 0

    try:
        lines =  open(text_file, encoding='utf-8').readlines()
    except UnicodeDecodeError as err:
        lines =  open(text_file, encoding='utf-16').readlines()

    for line in tqdm(lines):
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
                created_at=time.time(),
                updated_at=time.time()
            )

            para_sentence.save()

            id = para_sentence.id
            update(id, user)


            count += 1
        except Exception as err:
            if str(err) == "hashExists":
                n_error_hash_exists += 1
            print(err)

        n_rows += 1

    return {
        'nSuccess': count,
        'nData': n_rows,
        'nErrorHashExists': n_error_hash_exists
    }

init_for_migrate()

user = User.objects(username="vietlao01").first()


status = import_parasentences_from_file({
    'filepath': filepath,
    'creator_id': user.id,
    'lang1': 'vi',
    'lang2': 'lo'
})

print(status)
