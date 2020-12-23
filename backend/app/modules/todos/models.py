from .resources import api
from flask_restplus import Resource, fields

Todo = api.model('Todo', {
    '_id': fields.String,
    'complete': fields.Boolean,
    'text': fields.Integer,
})