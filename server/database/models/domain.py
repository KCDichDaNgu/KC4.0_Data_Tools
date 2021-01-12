from datetime import datetime

from database.db import db

from database.models.user import User

class Domain(db.Document):

    url = db.StringField()

    creator_id = db.ReferenceField(User)
    editor_id = db.ReferenceField(User)

    created_at = db.DateTimeField(default=datetime.now, required=True)
    updated_at = db.DateTimeField(default=datetime.now, required=True)

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'url': self.url,
           'creator_id': str(self.creator_id),
           'editor_id': str(self.editor_id),
           'created_at': created_at,
           'updated_at': updated_at
        }
