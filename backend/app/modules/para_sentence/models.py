# from .resources import api    

# todo_json = api.model('Todo', {
# '_id': fields.String,
# 'complete': fields.Boolean,
# 'text': fields.String,
# })

from app.extensions import mongo_db as db


class ParaSentence(db.Document):

    text1 = db.StringField()
    text2 = db.StringField()
    lang1 = db.StringField()
    lang2 = db.StringField()
    rating = db.StringField()
    score = db.DictField()
    editor_id = db.StringField()
    para_document_id = db.StringField()
    origin_para_document_id = db.StringField()
    created_time = db.IntField()
    updated_time = db.IntField()
    hash = db.StringField()

    meta = {'collection': 'para_sentence'}

    RATE_MAPPING_VI2STANDARD = {
        'Chưa đánh giá': 'unRated',
        'Chưa tốt': 'notGood',
        'Tốt': 'Good'
    }
    RATE_MAPPING_EN2STANDARD = {
        'Unrated': 'unRated',
        'Not Good': 'notGood',
        'Good': 'Good'
    }

    class Attr:
        text1 = 'text1'
        text2 = 'text2'
        lang1 = 'lang1'
        lang2 = 'lang2'
        rating = 'rating'
        score = 'score'
        editor_id = 'editor_id'
        para_document_id = 'para_document_id'
        origin_para_document_id = 'origin_para_document_id'
        created_time = 'created_time'
        updated_time = 'updated_time'
    

    def save(self):
        similar_parasentences = ParaSentence.objects.filter(hash=self.hash)

        # if len(similar_parasentences) == 0:
        return super(ParaSentence, self).save()
        # else:
        #     raise Exception('ParaSentence exists!')
