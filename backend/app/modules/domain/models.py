from .resources import api

# todo_json = api.model('Todo', {
    # '_id': fields.String,
    # 'complete': fields.Boolean,
    # 'text': fields.String,
# })

from app.extensions import mongo_db as db

class Domain(db.Document):

    name = db.StringField()
    user_id  = db.StringField()
    created_time = db.IntField()

    class Attr:
        name = 'name'
        user_id = 'user_id'
        created_time = 'created_time'
