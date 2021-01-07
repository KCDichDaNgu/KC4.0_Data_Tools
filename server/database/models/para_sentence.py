from database.db import db


class EditedParaSentence(db.EmbeddedDocument):
    text1 = db.StringField()
    text2 = db.StringField()
    rating = db.StringField()

    class Attr:
        text1 = 'text1'
        text2 = 'text2'
        rating = 'rating'

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
    edited = db.EmbeddedDocumentField(EditedParaSentence)

    meta = {'collection': 'para_sentence'}

    RATING_GOOD = 'Good'
    RATING_NOTGOOD = 'notGood'
    RATING_UNRATED = 'unRated'
    RATE_MAPPING_VI2STANDARD = {
        'Chưa đánh giá': RATING_UNRATED,
        'Chưa tốt': RATING_NOTGOOD,
        'Tốt': RATING_GOOD
    }
    RATE_MAPPING_EN2STANDARD = {
        'Unrated': RATING_UNRATED,
        'Not Good': RATING_NOTGOOD,
        'Good': RATING_GOOD
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
        edited = 'edited'
    

    def save(self):
        similar_parasentences = ParaSentence.objects.filter(hash=self.hash)

        if len(similar_parasentences) == 0:
            return super(ParaSentence, self).save()
        else:
            raise Exception('ParaSentence exists!')
        
