from flask import Blueprint,jsonify,request,render_template, url_for, redirect
from app.extensions.api import Namespace
from flask_restplus_patched import Resource
from flask_restplus._http import HTTPStatus
from app.extensions import mongo
from app.extensions.api.parameters import PaginationParameters
from flask_restplus import Resource

api = Namespace('todos',description="Todos")

from .models import Todo
from .parameters import AddTodoParameters

todos_col = mongo.db.todos

@api.route('/')
class Todos(Resource):
    """
    Manipulations with todos.
    """
    @api.parameters(PaginationParameters())
    @api.marshal_with(Todo)
    def get(self, args):
        saved_todos = todos_col.find()
        return saved_todos[0]

    @api.parameters(AddTodoParameters())
    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='create_todo')
    def post(self, args):
        """
        Create a new todo.
        """
        todos_col.insert_one(args)
        return jsonify({"Success":True})
