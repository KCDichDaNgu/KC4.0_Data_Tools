import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES
from database.models.domain import Domain
from oauth2 import authorization, require_oauth

from bson import ObjectId

domain_bp = Blueprint(__name__, 'domain')    

@domain_bp.route('/', methods=['POST'])
@require_oauth()
def create():

    user = current_token.user

    domain = Domain(
        name=request.get_json()['name'],
        user_id=user
    )

    domain.save()

    return jsonify(
        code=STATUS_CODES['success'],
        data=domain.id,
        message='success'
    )

@domain_bp.route('/', methods=['GET'])
@require_oauth()
def index():

    result = Domain.objects.paginate(
        page=int(request.args.get('pagination__page') or 1), 
        per_page=int(request.args.get('pagination__perPage') or 5)
    )

    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'total': result.total,
            'page': result.page,
            'perPage': result.per_page,
            'items': [i.serialize for i in result.items]
        },
        message='success'
    )


@domain_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
def delete(id):

    Domain.objects.filter(id=ObjectId(id)).delete()
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=id,
        message='success'
    )


@domain_bp.route('/<id>', methods=['PUT'])
@require_oauth()
def update(id):

    name = request.get_json().get('name')

    domain = Domain.objects.filter(id=ObjectId(id))
    
    domain.update(name=name)

    return jsonify(
        code=STATUS_CODES['success'],
        data=domain,
        message='success'
    )

@domain_bp.route('/search', methods=['POST'])
def search():
    
    result = Domain.objects \
        .filter(name__contains=request.get_json().get('name') or '') \
        .paginate(
            page=int(request.get_json().get('pagination__page') or 1), 
            per_page=int(request.get_json().get('pagination__perPage') or 5)
        )
    
    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'total': result.total,
            'page': result.page,
            'perPage': result.per_page,
            'items': [i.serialize for i in result.items]
        },
        message='success'
    )
    