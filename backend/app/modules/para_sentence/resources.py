from .parameters import AddParaSentenceParameters
from .models import ParaSentence
from flask import Blueprint, jsonify, request, render_template, url_for, redirect
from app.extensions.api import Namespace
from flask_restplus_patched import Resource
from flask_restplus._http import HTTPStatus
from app.extensions import mongo
from app.extensions.api.parameters import PaginationParameters
from flask_restplus import Resource

api = Namespace('para_sentence', description="para_sentence")


@api.route('/')
class ParaSentences(Resource):
    """
    Manipulations with ParaSentences
    """
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    def get(self, args):
        para_sentences = ParaSentence.objects.exclude('id').all()
        return jsonify(para_sentences)

    @api.parameters(AddParaSentenceParameters())
    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='create_para_sentences')
    def post(self, args):
        """
        Create a new ParaSentences.
        """
        para_sentence = ParaSentence(
            text1=args[ParaSentence.Attr.text1],
            text2=args[ParaSentence.Attr.text2],
            editor_id=args[ParaSentence.Attr.editor_id],
            para_document_id=args[ParaSentence.Attr.para_document_id],
            origin_para_document_id=args[ParaSentence.Attr.origin_para_document_id],
            status=args[ParaSentence.Attr.status],
            created_time=args[ParaSentence.Attr.created_time],
            updated_time=args[ParaSentence.Attr.updated_time])

        para_sentence.save()
        return jsonify(para_sentence)
