# from .resources import api

# todo_json = api.model('Todo', {
# '_id': fields.String,
# 'complete': fields.Boolean,
# 'text': fields.String,
# })
import time
from database.db import db

from database.models.user import User

class Domain(db.Document):

    name = db.StringField()
    user_id = db.ReferenceField(User)
    created_time = db.IntField(default=int(time.time()))

    class Attr:
        name = 'name'
        user_id = 'user_id'
        created_time = 'created_time'

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'name': self.name,
           'user_id': str(self.user_id),
           'created_time': self.created_time
        }
