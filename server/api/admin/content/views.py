import time
from flask import Blueprint, request, session, url_for
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token

from oauth2 import authorization, require_oauth
from constants.common import STATUS_CODES
from database.models import UserContent
from database.db import db
from utils.auth import role_required
from flask import current_app

content_bp = Blueprint(__name__, 'content')

@content_bp.route('/get-download-link', methods=['GET'])
@require_oauth()
@role_required('admin')
def get_download_link():

    user = current_token.user
    model_name = request.args.get('modelName')
    
    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'link': UserContent.get_download_link(model_name)
        },
        message='success'
    )
    
