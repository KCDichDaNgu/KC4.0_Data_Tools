from .parameters import AddParaDocumentParameters
from .models import ParaDocument
from flask import Blueprint, jsonify, request, render_template, url_for, redirect
from app.extensions.api import Namespace
from flask_restplus_patched import Resource
from flask_restplus._http import HTTPStatus
from app.extensions import mongo
from app.extensions.api.parameters import PaginationParameters
from flask_restplus import Resource

api = Namespace('para_document', description="para_document")


@api.route('/')
class ParaDocuments(Resource):
    """
    Manipulations with ParaDocuments
    """
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    def get(self, args):
        para_documents = ParaDocument.objects.exclude('id').all()
        return jsonify(para_documents)

    @api.parameters(AddParaDocumentParameters())
    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='create_para_documents')
    def post(self, args):
        """
        Create a new ParaDocuments.
        """
        para_document = ParaDocument(
            text1=args[ParaDocument.Attr.text1],
            text2=args[ParaDocument.Attr.text2],
            url1=args[ParaDocument.Attr.url1],
            url2=args[ParaDocument.Attr.url2],
            lang1=args[ParaDocument.Attr.lang1],
            lang2=args[ParaDocument.Attr.lang2],
            creator_id=args[ParaDocument.Attr.creator_id],
            status=args[ParaDocument.Attr.status],
            created_time=args[ParaDocument.Attr.created_time],
            updated_time=args[ParaDocument.Attr.updated_time])

        para_document.save()
        return jsonify(para_document)
