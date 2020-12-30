import pandas as pd
import time
from .models import ParaSentence

def import_parasentences_from_file(excel_file):
    xl = pd.ExcelFile(excel_file)
    sheet_names = xl.sheet_names
    df = xl.parse(sheet_names[0])

    columns = ['text1', 'text2', 'lang1', 'lang2', 'rating',
        'editor_id', 'origin_para_document_id', 'para_document_id',
        'score']
    
    count = 0
    n_rows = len(df)

    for row_data in df[columns].values:
        text1, text2, lang1, lang2, rating, editor_id, origin_para_document_id, \
            para_document_id, score = row_data

        try:
            # convert rating to db form
            if rating in ParaSentence.RATE_MAPPING_EN2STANDARD:
                rating = ParaSentence.RATE_MAPPING_EN2STANDARD[rating]
            elif rating in ParaSentence.RATE_MAPPING_VI2STANDARD:
                rating = ParaSentence.RATE_MAPPING_VI2STANDARD[rating]

            para_sentence = ParaSentence(
                text1=text1,
                text2=text2,
                lang1=lang1,
                lang2=lang2,
                rating=rating,
                editor_id=str(editor_id),
                origin_para_document_id=str(origin_para_document_id),
                para_document_id=str(para_document_id),
                score={"senAlign": score},
                created_time=time.time(),
                updated_time=time.time())

            para_sentence.save()

            count += 1
        except:
            continue

    return count, n_rows