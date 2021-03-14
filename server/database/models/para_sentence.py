import time
import re
import editdistance

from database.db import db

from database.models.user import User
from database.models.para_document import ParaDocument
from database.models.data_field import DataField
from database.models.domain import Domain

RATING_TYPES = {
    'good': 'good',
    'bad': 'bad',
    'unRated': 'unRated'
}

LANGS = ['vi', 'km', 'zh', 'lo']

class ParaSentenceText(db.EmbeddedDocument):

    content = db.StringField(required=True)
    lang = db.StringField(required=True)
    words_count = db.IntField(required=True)

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

class Score(db.EmbeddedDocument):

    senAlign = db.FloatField(default=0)

class ParaSentence(db.Document):

    RATING_TYPES = RATING_TYPES

    newest_para_sentence = db.EmbeddedDocumentField(NewestParaSentence, required=True)
    original_para_sentence = db.EmbeddedDocumentField(OriginalParaSentence, required=True)

    score = db.EmbeddedDocumentField(Score)

    creator_id = db.ReferenceField(User)
    editor = db.EmbeddedDocumentField(Editor)

    domain_id =  db.ReferenceField(Domain)
    
    para_document_id = db.ReferenceField(ParaDocument)

    last_history_record_id = db.ReferenceField('ParaSentenceHistory')

    data_field_id = db.ReferenceField(DataField)
    
    created_at = db.IntField(default=int(time.time()), required=True)
    updated_at = db.IntField(default=int(time.time()), required=True)

    viewer_id = db.ObjectIdField()
    view_due_date = db.FloatField()

    ignore_users_id = db.ListField(db.ReferenceField(User), default=[])

    edit_distance = db.IntField(required=True)

    meta = {'collection': 'para_sentence'}

    @staticmethod
    def compute_edit_distance(old_text1, old_text2, new_text1, new_text2):
        editdistance1 = editdistance.eval(old_text1, new_text1)
        editdistance2 = editdistance.eval(old_text2, new_text2)
        return editdistance1 + editdistance2

    def custom_update(self, **kwargs):
        for key, value in kwargs.items():
            self[key] = value

        self.save(is_update=True)

    def save(self, is_update=False):
        n_words1 = len(re.split("\s+", self.newest_para_sentence.text1.content))
        self.newest_para_sentence.text1.words_count = n_words1

        n_words2 = len(re.split("\s+", self.newest_para_sentence.text2.content))
        self.newest_para_sentence.text2.words_count = n_words2

        n_words_ori1 = len(re.split("\s+", self.original_para_sentence.text1.content))
        self.original_para_sentence.text1.words_count = n_words1

        n_words_ori2 = len(re.split("\s+", self.original_para_sentence.text2.content))
        self.original_para_sentence.text2.words_count = n_words2

        # update editdistance
        self.edit_distance = ParaSentence.compute_edit_distance(
            self.original_para_sentence.text1.content.strip(), 
            self.original_para_sentence.text2.content.strip(),
            self.newest_para_sentence.text1.content.strip(), 
            self.newest_para_sentence.text2.content.strip(),
        )

        if is_update:
            return super(ParaSentence, self).save()
        else:
            similar_parasentences = ParaSentence.objects.filter(
                original_para_sentence__hash_content=self.original_para_sentence.hash_content
            )

            if len(similar_parasentences) == 0:
                return super(ParaSentence, self).save()
            else:
                raise Exception('hashExists')
        
    @property
    def serialize(self):
        return {
            'id': str(self.id),
            'newest_para_sentence': self.newest_para_sentence,
            'original_para_sentence': self.original_para_sentence,
            'score': self.score,
            'creator_id': str(self.creator_id),
            'editor': {
                'id': str(self.editor.user_id.id) if self.editor is not None else None,
                'username': self.editor.user_id.username if self.editor is not None else None,
                'roles': self.editor.roles if self.editor is not None else None
            },
            'domain': {
                'id': str(self.domain_id.id) if self.domain_id is not None else None,
                'url': str(self.domain_id.url) if self.domain_id is not None else ''
            },
            'para_document_id': self.para_document_id,
            'last_history_record_id': self.last_history_record_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'viewer_id': str(self.viewer_id),
            'view_due_date': self.view_due_date,
            'edit_distance': self.edit_distance
        }
