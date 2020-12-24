from flask import Blueprint,jsonify,request,render_template, url_for, redirect
from app.extensions.api import Namespace
from flask_restplus_patched import Resource
from flask_restplus._http import HTTPStatus
from app.extensions import mongo
from app.extensions.api.parameters import PaginationParameters
from flask_restplus import Resource

api = Namespace('domain',description="domain")

from .models import Domain
from .parameters import AddDomainParameters

@api.route('/')
class Domains(Resource):
    """
    Manipulations with Domains.
    """
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    # @api.marshal_with(Domain_json)
    def get(self, args):
        domains = Domain.objects.exclude('id').all()
        return jsonify(domains)

    @api.parameters(AddDomainParameters())
    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='create_Domain')
    def post(self, args):
        """
        Create a new Domain.
        """
        domain = Domain(name=args[Domain.Attr.name],user_id=args[Domain.Attr.user_id],created_time=args[Domain.Attr.created_time])
        domain.save()
        return jsonify({"Success":True})
