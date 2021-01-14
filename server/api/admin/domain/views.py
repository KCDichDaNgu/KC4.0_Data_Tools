import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.domain import Domain
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required

from bson import ObjectId

admin_manage_domain_bp = Blueprint(__name__, 'domain')    

@admin_manage_domain_bp.route('/', methods=['POST'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def create():

    user = current_token.user

    domain = Domain(
        url=request.get_json()['url'],
        creator_id=user
    )

    domain.save()

    return jsonify(
        code=STATUS_CODES['success'],
        data=domain.id,
        message='success'
    )


@admin_manage_domain_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def delete(id):

    Domain.objects.filter(id=ObjectId(id)).delete()
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=id,
        message='success'
    )


@admin_manage_domain_bp.route('/<id>', methods=['PUT'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def update(id):

    url = request.get_json().get('url')

    domain = Domain.objects.filter(id=ObjectId(id))
    
    domain.update(url=url, editor_id=current_token.user)

    return jsonify(
        code=STATUS_CODES['success'],
        data=domain,
        message='success'
    )

@admin_manage_domain_bp.route('/search', methods=['POST'])
@status_required(User.USER_STATUS['active'])
def search():
    
    result = Domain.objects \
        .filter(url__contains=request.get_json().get('url') or '') \
        .paginate(
            page=int(request.get_json().get('pagination__page') or 1), 
            per_page=int(request.get_json().get('pagination__perPage') or 5)
        )
    print(result)
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
    