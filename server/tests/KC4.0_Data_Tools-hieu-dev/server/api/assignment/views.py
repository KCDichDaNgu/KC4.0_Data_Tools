import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.assignment import Assignment
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required

from bson import ObjectId

from constants.common import LANGS

assignment_bp = Blueprint(__name__, 'assignment')    

@assignment_bp.route('/current-user', methods=['GET'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def current_user():

    user = current_token.user

    assignment = Assignment.objects(user_id=user.id).first()

    return jsonify(
        code=STATUS_CODES['success'],
        data=assignment.serialize,
        message='success'
    )
    