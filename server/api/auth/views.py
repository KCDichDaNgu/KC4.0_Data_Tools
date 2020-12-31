import time
from flask import Blueprint, request, session, url_for
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES
from database.models.user import User
from oauth2 import authorization, require_oauth, RevokeToken

from app import csrf

auth_bp = Blueprint(__name__, 'auth')

@auth_bp.route('/oauth/token', methods=['POST'], localize=False)
@csrf.exempt
def access_token():
    return authorization.create_token_response()


@auth_bp.route('/oauth/token', methods=['POST'], localize=False)
@csrf.exempt
def revoke_token():
    return authorization.create_endpoint_response(RevokeToken.ENDPOINT_NAME)


def issue_token():
    return authorization.create_token_response(request)


@auth_bp.route('/me')
@require_oauth('profile')
def api_me():
    user = current_token.user

    user = User.query.get(user.id)
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=user.serialize,
        message='success'
    )

def init_app(app):
    app.register_blueprint(auth_bp, url_prefix='/api')