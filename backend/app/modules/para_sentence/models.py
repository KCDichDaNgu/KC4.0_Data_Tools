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
    score = db.DictField()
    editor_id = db.IntField()
    para_document_id = db.IntField()
    origin_para_document_id = db.IntField()
    status = db.IntField()
    created_time = db.IntField()
    updated_time = db.IntField()

    class Attr:
        text1 = 'text1'
        text2 = 'text2'
        score = 'score'
        editor_id = 'editor_id'
        para_document_id = 'para_document_id'
        origin_para_document_id = 'origin_para_document_id'
        status = 'status'
        created_time = 'created_time'
        updated_time = 'updated_time'