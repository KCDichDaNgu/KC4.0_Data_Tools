import pymongo
import re
from tqdm import tqdm

def count_words(text):
    return len(re.split("\s+", text))

def add_words_count():
    for para_sentence in tqdm(db.para_sentence.find(), desc="update parasentences", total=db.para_sentence.count()):

        db.para_sentence.update_one(
            {'_id': para_sentence['_id']},
            {
                '$set': {
                    'newest_para_sentence.text1.words_count': count_words(para_sentence['newest_para_sentence']['text1']['content']),
                    'newest_para_sentence.text2.words_count': count_words(para_sentence['newest_para_sentence']['text2']['content']),
                    'original_para_sentence.text1.words_count': count_words(para_sentence['original_para_sentence']['text1']['content']),
                    'original_para_sentence.text2.words_count': count_words(para_sentence['original_para_sentence']['text2']['content'])
                }
            }
        )

    for para_sentence_history in tqdm(db.para_sentence_history.find(), desc="update parasentences", total=db.para_sentence_history.count()):

        db.para_sentence_history.update_one(
            {'_id': para_sentence_history['_id']},
            {
                '$set': {
                    'newest_para_sentence.text1.words_count': count_words(para_sentence['newest_para_sentence']['text1']['content']),
                    'newest_para_sentence.text2.words_count': count_words(para_sentence['newest_para_sentence']['text2']['content']),
                }
            }
        )


if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']
    
    add_words_count()
