from datetime import datetime

from database.db import db

from database.models.user import User

class Lang(db.Document):

    creator_id = db.ReferenceField(User)
    editor_id = db.ReferenceField(User)

    notation = db.StringField(required=True)
    
    created_at = db.DateTimeField(default=datetime.now, required=True)
    updated_at = db.DateTimeField(default=datetime.now, required=True)

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'creator_id': str(self.creator_id),
           'editor_id': str(self.editor_id),
           'notation': self.notation,
           'created_at': self.created_at,
           'updated_at': self.updated_at
        }
