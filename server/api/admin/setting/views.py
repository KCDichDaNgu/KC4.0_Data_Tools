import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.setting import Setting
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

admin_manage_setting_bp = Blueprint(__name__, 'setting') 

@admin_manage_setting_bp.route('/', methods=['GET'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def get():

    setting = Setting.objects.first()

    return jsonify(
        code=STATUS_CODES['success'],
        data=setting.serialize,
        message='success'
    )


@admin_manage_setting_bp.route('/', methods=['PUT'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def update():

    content = request.get_json().get('content')

    setting = Setting.objects.first()
    
    setting.update(content=content)

    return jsonify(
        code=STATUS_CODES['success'],
        data=setting,
        message='success'
    )
    