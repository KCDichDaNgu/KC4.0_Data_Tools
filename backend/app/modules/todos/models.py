from .resources import api
from flask_restplus import Resource

# todo_json = api.model('Todo', {
    # '_id': fields.String,
    # 'complete': fields.Boolean,
    # 'text': fields.String,
# })

from app.extensions import mongo_db as db

class Todo(db.Document):

    complete = db.BooleanField()
    text  = db.StringField()

    class Attr:
        complete = 'complete'
        text = 'text'
