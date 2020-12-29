import time
from flask import Blueprint, request, session, url_for
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token

from oauth2 import authorization, require_oauth
from constants.common import STATUS_CODES
from database.models import UserContent
from database.db import db

content_bp = Blueprint(__name__, 'content')

@content_bp.route('/content', methods=['POST'])
@require_oauth()
def create():

    user = current_token.user
    
    _user_content = UserContent(
        creator_id=user.id,
        model_name=request.get_json()['modelName'],
        content=request.get_json()['content']
    )

    db.session.add(_user_content)
    db.session.commit()
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=_user_content.id,
        message='success'
    )

@content_bp.route('/content', methods=['GET'])
@require_oauth()
def index():

    user = current_token.user
    
    _records = UserContent \
        .query \
        .filter(
            UserContent.creator_id == user.id, \
            UserContent.model_name.in_(request.args.get('q__modelNames').split(','))
        ) \
        .paginate(
            page=int(request.args.get('pagination__page') or 1), 
            per_page=int(request.args.get('pagination__perPage') or 5)
        )
        
    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'total': _records.total,
            'page': _records.page,
            'per_page': _records.per_page,
            'items': [i.serialize for i in _records.items]
        },
        message='success'
    )

@content_bp.route('/content/<id>', methods=['PUT'])
@require_oauth()
def update(id):

    user = current_token.user
    
    _user_content = UserContent.query.get(id)
    
    if user.id == _user_content.creator_id:

        _user_content.content = request.get_json()['content']
        
        db.session.commit()
    
        return jsonify(
            code=STATUS_CODES['success'],
            data=_user_content.serialize,
            message='success'
        )

    return jsonify(
        code=STATUS_CODES['failure'],
        data=None,
        message='failure'
    )

@content_bp.route('/content/<id>', methods=['DELETE'])
@require_oauth()
def delete(id):

    user = current_token.user
    
    _user_content = UserContent.query.get(id)
    
    if user.id == _user_content.creator_id:
        
        db.session.delete(_user_content)
        db.session.commit()
    
        return jsonify(
            code=STATUS_CODES['success'],
            data={
                'deleted_id': id
            },
            message='success'
        )

    return jsonify(
        code=STATUS_CODES['failure'],
        data=None,
        message='failure'
    )
