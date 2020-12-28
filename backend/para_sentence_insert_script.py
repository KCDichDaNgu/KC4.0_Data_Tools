from app.modules.para_sentence.models import ParaSentence
from pymongo import MongoClient
import random

mongo_db = MongoClient()

db = mongo_db.tool_nhap_lieu
collection = db.para_sentence

with open('o1_5.txt', encoding='utf-16') as f:
    lines = [line.rstrip() for line in f]

# statusList = ['Draft', 'Approved', 'Rejected']
# ratingList = ['Perfect', "Good", "Partially Understand", 'Understand', 'Bad']
ratingList = ['unRated', 'notGood', 'Good']


def insertSentence():
    count = 0
    for line in lines:
        split_line = line.split('\t')
        sentence = {
            "text1": split_line[1],
            "text2": split_line[2],
            "lang1": 'vi',
            "lang2": 'khm',
            "rating": random.choice(ratingList),
            "editor_id": 1,
            "origin_para_document_id": 1,
            "para_document_id": 2,
            "score": {
                "senAlign": split_line[0]
            },
            "updated_time": random.randint(1606847896,1608835096)
        }
        print('Create ', count, ' sentences')
        count += 1
        collection.insert_one(sentence)


insertSentence()
