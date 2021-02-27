import time
from blinker import Signal

from database.db import db
from database.models.user import User

from mongoengine.signals import pre_save, post_save

class Domain(db.Document):

    url = db.StringField()

    creator_id = db.ReferenceField(User)
    editor_id = db.ReferenceField(User)

    job_id = db.StringField(default=None)

    created_at = db.IntField(default=time.time, required=True)
    updated_at = db.IntField(default=time.time, required=True)

    before_save = Signal()
    after_save = Signal()
    on_create = Signal()
    on_update = Signal()
    before_delete = Signal()
    after_delete = Signal()
    on_delete = Signal()

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'url': self.url,
           'job_id': self.job_id,
           'creator_id': str(self.creator_id),
           'editor_id': str(self.editor_id),
           'created_at': self.created_at,
           'updated_at': self.updated_at
        }

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        
        document.updated_at = int(time.time())

        cls.after_save.send(document)

        if kwargs.get('created'):
            cls.on_create.send(document)
        else:
            cls.on_update.send(document)


pre_save.connect(Domain.pre_save, sender=Domain)
