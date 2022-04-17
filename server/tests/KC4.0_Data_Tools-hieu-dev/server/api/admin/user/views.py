import time, re
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES, LANGS

from database.models.user import User
from database.models.assignment import Assignment

from oauth2 import authorization, require_oauth, role_required, status_required

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
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def search():
    user = current_token.user

    _raw_query = { '$or': [] }
    args = request.get_json()

    if len(args.get('username', '').strip()) > 0:

        pattern = re.compile(f".*{ args.get('username') }.*", re.IGNORECASE)

        _raw_query['$or'].append({'username': { '$regex': pattern }})

    if len(args.get('email', '').strip()) > 0:

        pattern = re.compile(f".*{ args.get('email') }.*", re.IGNORECASE)

        _raw_query['$or'].append({'email': { '$regex': pattern }})

    if len(_raw_query['$or']) == 0:
        _raw_query = {}

    all_users = result = User.objects.filter(__raw__=_raw_query)

    # depend on language, query on assignment or not
    langs = None
    if 'lang' in args and args['lang'].strip() != '': 
        # if lang is specified in request params
        langs = [args['lang']]
    else:
        if User.USER_ROLES['admin'] not in user.roles and \
            User.USER_ROLES['reviewer'] in user.roles: # reviewer
            # chỉ query những user cùng language với reviewer
            assignment = Assignment.objects(user_id=user.id).first()
            langs = [lang.lang2 for lang in assignment.lang_scope] # ngôn ngữ của editor

    if langs is not None:
        # query through assignment
        result = Assignment.objects(
            lang_scope__lang2__in=langs,
            user_id__in=[user.id for user in all_users]
        ).paginate(
            page=int(args.get('pagination__page') or 1), 
            per_page=int(args.get('pagination__perPage') or 5)
        )

        result.items = [ua.user_id.serialize for ua in result.items]
    else:
        result = all_users.paginate(
                page=int(args.get('pagination__page') or 1), 
                per_page=int(args.get('pagination__perPage') or 5)
            )

        result.items = [i.serialize for i in result.items]

    if args.get('extraData'):

        _extra_data_conds = args.get('extraData')

        result.items = [{**item, **{'extraData': {}}} for item in result.items]

        if type(_extra_data_conds['assignment']) != dict and int(_extra_data_conds['assignment']) == 1:

            result.items = [{**item, **{'extraData': {'assignment': {}}}} for item in result.items]

            users_id = set(map(lambda x: x['id'], result.items))
            
            users_assignment = Assignment.objects(user_id__in=users_id)
            users_assignment = [us.serialize for us in users_assignment]

            for item in result.items:

                item['extraData']['assignment'] = {}

                for index, user_assignment in enumerate(users_assignment):

                    if user_assignment['user']['id'] == item['id']:

                        item['extraData']['assignment'] = user_assignment
    
    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'total': result.total,
            'page': result.page,
            'perPage': result.per_page,
            'items': result.items
        },
        message='success'
    )
    