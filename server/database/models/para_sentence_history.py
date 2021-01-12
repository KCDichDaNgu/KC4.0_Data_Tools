from database.db import db

from database.models.user import User
from database.models.para_sentence import ParaSentence

class ParaSentenceText(db.EmbeddedDocument):

    content = db.StringField()
    lang = db.StringField()

class NewestParaSentence(db.EmbeddedDocument):

    text1 = db.EmbeddedDocumentField(ParaSentenceText)
    text2 = db.EmbeddedDocumentField(ParaSentenceText)

    hash_content = db.StringField(required=True)

    rating = db.StringField(
        choices=ParaSentence.RATING_TYPES.keys(),
        default=ParaSentence.RATING_TYPES['unRated']
    )

class Editor(db.EmbeddedDocument):

    user_id = db.ReferenceField(User, default=None)
    roles = db.ListField(choices=User.USER_ROLES.keys(), default=[])

class ParaSentenceHistory(db.Document):
    para_sentence_id = db.ObjectIdField()

    newest_para_sentence = db.EmbeddedDocumentField(NewestParaSentence, required=True)

    editor = db.EmbeddedDocumentField(Editor)

    updated_at = db.DateTimeField(default=datetime.now, required=True)

    meta = {'collection': 'para_sentence_history'}
    
    @property
    def serialize(self):
        # lam lai nhe
        return {
            'id': str(self.id),
            'text1': self.text1,
            'text2': self.text2,
            'rating': self.rating,
            'score': self.score,
            'editor': {
                'id': str(self.editor_id.id) if self.editor_id else None,
                'username': str(self.editor_id.username) if self.editor_id else None
            },
            'editor_role': self.editor_role,
            'updated_at': self.updated_at,
        }
