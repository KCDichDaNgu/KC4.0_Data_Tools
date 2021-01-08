from database.db import db

from database.models.user import User


class OriginalParaSentence(db.EmbeddedDocument):
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
    editor_id = db.ReferenceField(User, default=None)

    para_document_id = db.StringField()
    origin_para_document_id = db.StringField()
    created_time = db.IntField()
    updated_time = db.IntField()

    hash = db.StringField()
    original = db.EmbeddedDocumentField(OriginalParaSentence)

    viewer_id = db.ObjectIdField()
    view_due_date = db.FloatField()

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
        original = 'original'
        
        viewer_id = 'viewer_id'
        view_due_date = 'view_due_date'
    

    def save(self):
        similar_parasentences = ParaSentence.objects.filter(hash=self.hash)

        if len(similar_parasentences) == 0:
            return super(ParaSentence, self).save()
        else:
            raise Exception('hashExists')
        
    @property
    def serialize(self):
        
        return {
            'id': str(self.id),
            'text1': self.text1,
            'text2': self.text2,
            'lang1': self.lang1,
            'lang2': self.lang2,
            'rating': self.rating,
            'score': self.score,
            'editor': {
                'id': str(self.editor_id.id) if self.editor_id else None,
                'username': str(self.editor_id.username) if self.editor_id else None
            },
            'created_time': self.created_time,
            'updated_time': self.updated_time,
            'original': self.original,
            'viewer_id': str(self.viewer_id),
            'view_due_date': self.view_due_date
        }
