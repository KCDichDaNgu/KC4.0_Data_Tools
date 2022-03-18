import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.data_field import DataField
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

admin_manage_data_field_bp = Blueprint(__name__, 'data_field')    

@admin_manage_data_field_bp.route('/', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def create():

    user = current_token.user

    data_field = DataField(
        name=request.get_json()['name'],
        creator_id=user
    )

    data_field.save()

    return jsonify(
        code=STATUS_CODES['success'],
        data=data_field.id,
        message='success'
    )


@admin_manage_data_field_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def delete(id):

    DataField.objects.filter(id=ObjectId(id)).delete()
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=id,
        message='success'
    )


@admin_manage_data_field_bp.route('/<id>', methods=['PUT'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def update(id):

    name = request.get_json().get('name')

    data_field = DataField.objects.filter(id=ObjectId(id))
    
    data_field.update(name=name, editor_id=current_token.user)

    return jsonify(
        code=STATUS_CODES['success'],
        data=data_field,
        message='success'
    )

@admin_manage_data_field_bp.route('/search', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def search():
    
    result = DataField.objects \
        .filter(name__contains=request.get_json().get('name') or '') \
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
    