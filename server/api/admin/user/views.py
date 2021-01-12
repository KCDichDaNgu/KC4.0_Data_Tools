import time, re
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.user import User

from oauth2 import authorization, require_oauth, role_required

from bson import ObjectId

admin_manage_user_bp = Blueprint(__name__, 'user')    

@admin_manage_user_bp.route('/', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def create():

    user = current_token.user

    _form_data = request.get_json()

    _new_user_data = dict()

    for k, v in _form_data.items():

        if k in ['username', 'email', 'password', 'status', 'roles']:

            _new_user_data[k] = v
            
    user = User(**_new_user_data)

    user.save()

    return jsonify(
        code=STATUS_CODES['success'],
        data=user.id,
        message='create_success'
    )


@admin_manage_user_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def delete(id):

    User.objects.filter(id=ObjectId(id)).delete()
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=id,
        message='success'
    )


@admin_manage_user_bp.route('/<id>', methods=['PUT'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def update(id):

    _form_data = request.get_json()

    _new_user_data = dict()

    for k, v in _form_data.items():

        if k in ['username', 'email', 'password', 'status', 'roles']:

            _new_user_data[k] = v

    updated_user = User.objects.filter(id=ObjectId(id)).first()

    if set(_new_user_data.keys()).issubset(['username', 'email', 'password', 'status', 'roles']):

        updated_user.clear_auth_info()
    
    updated_user.update(**_new_user_data)

    return jsonify(
        code=STATUS_CODES['success'],
        data=updated_user,
        message='success'
    )

@admin_manage_user_bp.route('/search', methods=['POST'])
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def search():

    _raw_query = { '$or': [] }

    if request.get_json().get('username'):

        pattern = re.compile(f".*{ request.get_json().get('username') }.*", re.IGNORECASE)

        _raw_query['$or'].append({'username': { '$regex': pattern }})

    if request.get_json().get('email'):

        pattern = re.compile(f".*{ request.get_json().get('email') }.*", re.IGNORECASE)

        _raw_query['$or'].append({'email': { '$regex': pattern }})

    if len(_raw_query['$or']) == 0:
        _raw_query = {}
        
    result = User.objects \
        .filter(__raw__=_raw_query) \
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
    