import time

from database.db import db

from database.models.user import User

class DataField(db.Document):

    name = db.StringField(required=True)

    creator_id = db.ReferenceField(User)
    editor_id = db.ReferenceField(User)
    
    created_at = db.IntField(default=int(time.time()), required=True)
    updated_at = db.IntField(default=int(time.time()), required=True)

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'name': self.name,
           'creator_id': str(self.creator_id),
           'editor_id': str(self.editor_id),
           'created_at': self.created_at,
           'updated_at': self.updated_at
        }
