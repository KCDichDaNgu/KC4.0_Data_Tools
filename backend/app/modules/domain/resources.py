from .parameters import AddDomainParameters
from .models import Domain
from flask import Blueprint, jsonify, request, render_template, url_for, redirect
from app.extensions.api import Namespace
from flask_restplus_patched import Resource
from flask_restplus._http import HTTPStatus
from app.extensions import mongo
from app.extensions.api.parameters import PaginationParameters
from flask_restplus import Resource
from bson.objectid import ObjectId

api = Namespace('domain', description="domain")
_request = request


@api.route('/')
class Domains(Resource):
    """
    Manipulations with Domains.request.args.get('user')
    """
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    # @api.marshal_with(Domain_json)
    def get(self, args):
        domains = Domain.objects.all()
        return jsonify(domains)

    @api.parameters(AddDomainParameters())
    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='create_Domain')
    def post(self, args):
        """
        Create a new Domain.
        """
        domain = Domain(name=args[Domain.Attr.name],user_id=args[Domain.Attr.user_id])
        domain.save()
        return jsonify(domain)

@api.route('/<_id>')
class DeteleDomain(Resource):
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    def delete(self, request, _id, *args, **kwargs):
        Domain.objects.filter(id=ObjectId(_id)).delete()
        return ''

@api.route('/<_id>')
class UpdateDomain(Resource):
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    def put(self, request, _id, *args, **kwargs):
        name = _request.form.get('name')
        domain = Domain.objects.filter(id=ObjectId(_id))
        domain.update(name=name)
        return ''
