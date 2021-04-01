import pymongo
from tqdm import tqdm
import time
from hanziconv import HanziConv
import re

def convert_chinese():
    sentences = db['para_sentence'].find({
        # 'newest_para_sentence.rating': 'unRated',
        'newest_para_sentence.text2.lang': 'zh'
    })

    for para_sentence in tqdm(sentences):
        text2 = para_sentence['newest_para_sentence']['text2']['content']
        simplied = HanziConv.toSimplified(text2)
        nwords = len(re.split("\s+", simplied))

        para_sentence['newest_para_sentence']['text2']['content'] = simplied
        para_sentence['newest_para_sentence']['text2']['words_count'] = nwords

        db['para_sentence'].update_one({
            '_id': para_sentence['_id']
        }, {
            '$set': para_sentence
        })

    sentences = db['para_sentence_history'].find({
        # 'newest_para_sentence.rating': 'unRated',
        'newest_para_sentence.text2.lang': 'zh'
    })

    for para_sentence_history in tqdm(sentences):
        text2 = para_sentence_history['newest_para_sentence']['text2']['content']
        simplied = HanziConv.toSimplified(text2)
        nwords = len(re.split("\s+", simplied))

        para_sentence_history['newest_para_sentence']['text2']['content'] = simplied
        para_sentence_history['newest_para_sentence']['text2']['words_count'] = nwords

        db['para_sentence_history'].update_one({
            '_id': para_sentence_history['_id']
        }, {
            '$set': para_sentence_history
        })

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']

    convert_chinese()
    
