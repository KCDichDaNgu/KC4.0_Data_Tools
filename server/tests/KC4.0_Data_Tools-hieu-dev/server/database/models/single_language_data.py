import time
from database.db import db

from database.models.user import User
from database.models.data_field import DataField

class SentenceData(db.EmbeddedDocument):
    content = db.StringField(required=True)
    lang = db.StringField(required=True)
    word_num = db.IntField(required=True)
    sentence_num = db.IntField(required=True)
    longest_sentence = db.IntField(required=True)
    shortest_sentence = db.IntField(required=True)
    word_count = db.DynamicField(required=True)

class UploadedFile(db.EmbeddedDocument):
    file_name = db.StringField(required=True)
    file_path = db.StringField(required=True)

class SingleLanguageData(db.Document):
    sentence_data = db.EmbeddedDocumentField(SentenceData, required=True)
    data_file = db.EmbeddedDocumentField(UploadedFile, required=True)
    source = db.StringField(required=True)
    data_field = db.ReferenceField(DataField)
    updated_by = db.ReferenceField(User)
    updated_at = db.IntField(default=int(time.time()), required=True)
    created_by = db.ReferenceField(User)
    created_at = db.IntField(default=int(time.time()), required=True)

    @property
    def serialize(self):
        return {
            'id': str(self.id),
            'sentence_data': self.sentence_data,
            'data_file': self.data_file,
            'source': self.source,
            'data_field': self.data_field,
            'created_by': str(self.created_by),
            'created_at': self.created_at,
            'updated_by': str(self.created_by),
            'updated_at': self.updated_at,
        }