from database.db import db

from database.models.user import User
from database.models.para_sentence import ParaSentence

class ParaSentenceHistory(db.Document):
    text1 = db.StringField(default=None)
    text2 = db.StringField(default=None)
    rating = db.StringField(
        choices=ParaSentence.RATING_TYPES.keys(),
        default=None
    )

    editor_id = db.ReferenceField(User, default=None)
    editor_role = db.StringField(
        choices=User.USER_ROLES.keys(),
        default=None
    ) # role của user edit lần cuối

    updated_at = db.IntField()

    meta = {'collection': 'para_sentence_history'}

    class Attr:
        text1 = 'text1'
        text2 = 'text2'
        rating = 'rating'
        editor_id = 'editor_id'
        editor_role = 'editor_role'
    
    @property
    def serialize(self):
        
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
