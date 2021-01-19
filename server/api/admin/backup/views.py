import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.user import User
from database.models.backup import Backup, create_backup

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

admin_manage_backup_bp = Blueprint(__name__, 'backup')    

@admin_manage_backup_bp.route('/', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def create():
    args = request.get_json()

    user = current_token.user

    backup = create_backup(args['name'], user.id, Backup.BACKUP_TYPES['by_server'])

    # backup = create_backup(args['name'], user.id, Backup.BACKUP_TYPES['by_user'])

    return jsonify(
        code=STATUS_CODES['success'],
        data=backup.id,
        message='success'
    )
    
@admin_manage_backup_bp.route('/', methods=['GET'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def get():
    args = request.args

    backups = Backup.objects.order_by('-created_at').paginate(
        page=int(args.get('page', 1)), 
        per_page=int(args.get('page_size', 5))
    )

    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'backups': [backup.serialize for backup in backups.items],
            'pagination': {
                'current_page': backups.page,
                'total_pages': backups.pages,
                'page_size': backups.per_page,
                'total_items': backups.total
            }
        },
        message='success'
    )
    
@admin_manage_backup_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def delete(id):
    try:
        backup = Backup.objects.get(id=ObjectId(id))

        backup.delete()

        return jsonify(
            code=STATUS_CODES['success'],
            message='success'
        )
    except:
        return jsonify(
            code=STATUS_CODES['failure'],
            message='notFound'
        )

@admin_manage_backup_bp.route('/<id>', methods=['PUT'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def put(id):
    try:
        backup = Backup.objects.get(id=ObjectId(id))
    except:
        return jsonify(
            code=STATUS_CODES['failure'],
            message='notFound'
        )

    if backup.type == Backup.BACKUP_TYPES['by_server']:
        return jsonify(
            code=STATUS_CODES['failure'],
            message='notAllowed'
        )
    
    args = request.get_json()
    args['name'] = args.get('name', backup.name)

    backup.update(**args)

    return jsonify(
        code=STATUS_CODES['success'],
        message='success'
    )
