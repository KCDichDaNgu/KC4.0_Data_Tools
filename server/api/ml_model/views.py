import time
from flask import Blueprint, request, session, url_for
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token

from oauth2 import authorization, require_oauth
from constants.common import STATUS_CODES

ml_model_bp = Blueprint(__name__, 'ml_model')

@ml_model_bp.route('/ml-model/get-candidates', methods=['POST'])
def get_candidates():
    print(request.get_json())
    return jsonify(
        code=STATUS_CODES['success'],
        data=['aasdsdsdab'],
        message='success'
    )
