import time
from blinker import Signal

from database.db import db
from database.models.user import User

import os

from mongoengine.signals import pre_save, post_save, post_delete

class LangScope(db.EmbeddedDocument):

    lang1 = db.StringField(required=True)
    lang2 = db.StringField(required=True)

class Assignment(db.Document):

    lang_scope = db.ListField(db.EmbeddedDocumentField(LangScope), default=[])
    
    editor_id = db.ReferenceField(User, required=True)
    
    created_at = db.FloatField(default=time.time(), required=True)
    updated_at = db.FloatField(default=time.time(), required=True)

    before_save = Signal()
    after_delete = Signal()

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'lang_scope': lang_scope,
           'editor': {
               'id': str(self.editor_id.id) if self.editor_id is not None else None,
               'username': self.editor_id.username if self.editor_id is not None else None
           },
           'created_at': self.created_at,
           'updated_at': self.updated_at
        }

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        
        document.updated_at = time.time()

        cls.before_save.send(document)

pre_save.connect(Backup.pre_save, sender=Backup)
