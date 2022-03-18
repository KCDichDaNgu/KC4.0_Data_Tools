import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.assignment import Assignment
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

from constants.common import LANGS

admin_manage_assignment_bp = Blueprint(__name__, 'assignment')    

@admin_manage_assignment_bp.route('/', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def create():
    
    user = current_token.user

    _form_data = request.get_json()

    _data = { 
        'editor_id': user,
        'user_id': _form_data['userId']
    }

    if _form_data['langScope']:

        _data['lang_scope'] = _form_data['langScope']
        
    assignment = Assignment(**_data)

    assignment.save()

    return jsonify(
        code=STATUS_CODES['success'],
        data=assignment.id,
        message='success'
    )


@admin_manage_assignment_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def delete(id):

    Assignment.objects.filter(id=ObjectId(id)).delete()
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=id,
        message='success'
    )


@admin_manage_assignment_bp.route('/<id>', methods=['PUT'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def update(id):

    user = current_token.user

    _data = { 'editor_id': user }

    assignment = Assignment.objects.filter(id=ObjectId(id))

    if request.get_json()['langScope']:

        _data['lang_scope'] = request.get_json()['langScope']
        
    assignment.update(**_data)

    return jsonify(
        code=STATUS_CODES['success'],
        data=assignment,
        message='success'
    )
    