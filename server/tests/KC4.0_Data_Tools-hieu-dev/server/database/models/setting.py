import time
from blinker import Signal

from database.db import db
from database.models.user import User

import os

from mongoengine.signals import pre_save, post_save, post_delete

from constants.common import LANGS

DEFAULT_SETTING_CONTENT = {
    'min_words_of_vietnamese_sentence': 11
}

class SettingContent(db.EmbeddedDocument):

    min_words_of_vietnamese_sentence = db.IntField(
        default=DEFAULT_SETTING_CONTENT['min_words_of_vietnamese_sentence'], 
        required=True
    )

class Setting(db.Document):

    content = db.EmbeddedDocumentField(SettingContent, required=True)
    
    created_at = db.FloatField(default=time.time(), required=True)
    updated_at = db.FloatField(default=time.time(), required=True)

    before_save = Signal()
    after_delete = Signal()

    meta = {'collection': 'setting'}

    @property
    def serialize(self):
        
        return {
            'id': str(self.id),
            'content': {
               'min_words_of_vietnamese_sentence': self.content.min_words_of_vietnamese_sentence
            },
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        
        document.updated_at = time.time()

        cls.before_save.send(document)

pre_save.connect(Setting.pre_save, sender=Setting)
