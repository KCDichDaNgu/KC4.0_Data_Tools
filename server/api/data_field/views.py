import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.data_field import DataField
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required

from bson import ObjectId

data_field_bp = Blueprint(__name__, 'data_field')  

@data_field_bp.route('/search', methods=['POST'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def search():
    
    result = DataField.objects \
        .filter(name__contains=request.get_json().get('name') or '') \
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
    