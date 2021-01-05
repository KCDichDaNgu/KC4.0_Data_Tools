import pandas as pd
import time
import hashlib
from .models import ParaSentence

def import_parasentences_from_file(text_file):
    count = 0
    n_rows = 0

    with open(text_file, encoding='utf-16') as fp:
        for line in fp:
            score, text1, text2 = line.strip('\n').split('\t')
            lang1 = 'vi'
            lang2 = 'khm'
            rating = ParaSentence.RATING_UNRATED

            try:
                hash = hash_para_sentence(text1, text2, lang1, lang2)

                para_sentence = ParaSentence(
                    text1=text1,
                    text2=text2,
                    lang1=lang1,
                    lang2=lang2,
                    rating=rating,
                    editor_id=None,
                    origin_para_document_id=None,
                    para_document_id=None,
                    score={"senAlign": score},
                    hash=hash,
                    created_time=time.time(),
                    updated_time=time.time())

                para_sentence.save()

                count += 1
            except:
                pass 

            n_rows += 1

    return count, n_rows


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
#                 updated_time=time.time())

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
