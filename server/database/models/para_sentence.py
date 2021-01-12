import time

from database.db import db

from database.models.user import User
from database.models.para_document import ParaDocument

RATING_TYPES = {
    'good': 'good',
    'bad': 'bad',
    'unRated': 'unRated'
}

class ParaSentenceText(db.EmbeddedDocument):

    content = db.StringField()
    lang = db.StringField()

class NewestParaSentence(db.EmbeddedDocument):

    text1 = db.EmbeddedDocumentField(ParaSentenceText)
    text2 = db.EmbeddedDocumentField(ParaSentenceText)

    hash_content = db.StringField(required=True)

    rating = db.StringField(
        choices=RATING_TYPES.keys(),
        default=RATING_TYPES['unRated']
    )

class OriginalParaSentence(db.EmbeddedDocument):

    text1 = db.EmbeddedDocumentField(ParaSentenceText)
    text2 = db.EmbeddedDocumentField(ParaSentenceText)

    hash_content = db.StringField(required=True)

    rating = db.StringField(
        choices=RATING_TYPES.keys(),
        default=RATING_TYPES['unRated']
    )

class Editor(db.EmbeddedDocument):

    user_id = db.ReferenceField(User, default=None)
    roles = db.ListField(choices=User.USER_ROLES.keys(), default=[])

class ParaSentence(db.Document):

    RATING_TYPES = RATING_TYPES

    newest_para_sentence = db.EmbeddedDocumentField(NewestParaSentence, required=True)
    original_para_sentence = db.EmbeddedDocumentField(OriginalParaSentence, required=True)

    score = db.DictField()

    creator_id = db.ReferenceField(User)
    editor = db.EmbeddedDocumentField(Editor)

    para_document_id = db.ReferenceField(ParaDocument)
    last_history_record_id = db.ReferenceField('ParaSentenceHistory')
    
    created_at = db.IntField(default=int(time.time()), required=True)
    updated_at = db.IntField(default=int(time.time()), required=True)

    viewer_id = db.ObjectIdField()
    view_due_date = db.FloatField()

    ignore_users_id = db.ListField(db.ReferenceField(User), default=[])

    meta = {'collection': 'para_sentence'}

    def save(self):
        similar_parasentences = ParaSentence.objects.filter(hash=self.hash)

        if len(similar_parasentences) == 0:
            return super(ParaSentence, self).save()
        else:
            raise Exception('hashExists')
        
    @property
    def serialize(self):
        # lam lai serializer, theo cau truc cua collection
        return {
            'id': str(self.id),
            'text1': self.text1,
            'text2': self.text2,
            'lang1': self.lang1,
            'lang2': self.lang2,
            'rating': self.rating,
            # 'rating': [
            #     {
            #         'rating': rating.rating,
            #         'user_current_role': rating.user_current_role,
            #         'user_id': str(rating.user_id.id)
            #     } for rating in self.rating
            # ],
            'score': self.score,
            'editor': {
                'id': str(self.editor_id.id) if self.editor_id else None,
                'username': str(self.editor_id.username) if self.editor_id else None
            },
            'editor_role': self.editor_role,
            'created_time': self.created_time,
            'updated_at': self.updated_at,
            'original': self.original,
            'viewer_id': str(self.viewer_id),
            'view_due_date': self.view_due_date
        }
