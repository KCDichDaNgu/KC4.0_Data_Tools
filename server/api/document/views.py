import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.para_document import ParaDocument
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

from .utils import save_to_local_file

document_bp = Blueprint(__name__, 'document')    

@document_bp.route('/', methods=['POST'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def alignment():

    user = current_token.user

    _data = request.get_json()

    files_metadata = save_to_local_file({
        'text1': _data['text1'],
        'text2': _data['text2'],
        'lang1': _data['lang1'],
        'lang2': _data['lang2']
    })    

    print(files_metadata) 

    return jsonify(
        code=STATUS_CODES['success'],
        data={},
        message='success'
    )
    