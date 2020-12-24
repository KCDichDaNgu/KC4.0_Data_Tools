# from .resources import api

# todo_json = api.model('Todo', {
# '_id': fields.String,
# 'complete': fields.Boolean,
# 'text': fields.String,
# })

from app.extensions import mongo_db as db


class ParaDocument(db.Document):

    text1 = db.StringField()
    text2 = db.StringField()
    url1 = db.StringField()
    url2 = db.StringField()
    lang1 = db.CharField()
    lang2 = db.CharField()
    score = db.DictField()
    creator_id = db.IntField()
    status = db.IntField()
    created_time = db.IntField()
    updated_time = db.IntField()

    class Attr:
        text1 = 'text1'
        text2 = 'text2'
        url1 = 'url1'
        url2 = 'url2'
        lang1 = 'lang1'
        lang2 = 'lang2'
        score = 'score'
        creator_id = 'creator_id'
        status = 'status'
        created_time = 'created_time'
        updated_time = 'updated_time'
