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
    @api.response(code=HTTPStatus.CONFLICT)
    # @api.marshal_with(todo_json)
    def get(self, args):
        todos = Todo.objects.exclude('id').all()
        return jsonify(todos)

    @api.parameters(AddTodoParameters())
    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='create_todo')
    def post(self, args):
        """
        Create a new todo.
        """
        todo = Todo(complete=args[Todo.Attr.complete],text=args[Todo.Attr.text])
        todo.save()
        return jsonify({"Success":True})
