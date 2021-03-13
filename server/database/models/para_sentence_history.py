import time
import editdistance

from database.db import db

from database.models.user import User
from database.models.para_sentence import ParaSentence

class ParaSentenceText(db.EmbeddedDocument):

    content = db.StringField(required=True)
    lang = db.StringField(required=True)
    words_count = db.IntField(required=True)

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

    updated_at = db.IntField(default=int(time.time()), required=True)

    meta = {'collection': 'para_sentence_history'}

    @staticmethod
    def compute_edit_distance(old_text1, old_text2, new_text1, new_text2):
        editdistance1 = editdistance.eval(old_text1, new_text1)
        editdistance2 = editdistance.eval(old_text2, new_text2)
        return editdistance1 + editdistance2
    
    @property
    def serialize(self):
        return {
            'id': str(self.id),
            'para_sentence_id': str(self.para_sentence_id),
            'newest_para_sentence': self.newest_para_sentence,
            'editor': {
                'id': str(self.editor.user_id.id),
                'username': self.editor.user_id.username,
                'roles': self.editor.roles
            },
            'updated_at': self.updated_at,
        }
