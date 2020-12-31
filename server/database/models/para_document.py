from database.db import db


class ParaDocument(db.Document):

    text1 = db.StringField()
    text2 = db.StringField()
    url1 = db.StringField()
    url2 = db.StringField()
    lang1 = db.StringField()
    lang2 = db.StringField()
    score = db.DictField()
    creator_id = db.StringField()
    status = db.IntField()
    created_time = db.IntField()
    updated_time = db.IntField()

    meta = {'collection': 'para_document'}

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