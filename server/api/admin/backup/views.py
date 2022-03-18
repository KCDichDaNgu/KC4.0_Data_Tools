import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES, CURRENT_VERSION_FILE_PATH

from database.models.user import User
from database.models.backup import Backup, create_backup, restoreDb

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

admin_manage_backup_bp = Blueprint(__name__, 'backup')    

@admin_manage_backup_bp.route('/', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def create():
    try:
        args = request.get_json()

        user = current_token.user

        # backup database
        backup = create_backup(args['name'], user.id, Backup.BACKUP_TYPES['by_user'])

        return jsonify(
            code=STATUS_CODES['success'],
            data=backup.id,
            message='success'
        )
    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'createFailure'
        })
    
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

@admin_manage_backup_bp.route('/current-version', methods=['GET'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def get_current_verion():
    version_file = open(CURRENT_VERSION_FILE_PATH, 'r')
    current_version = version_file.read()

    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'current_version': current_version
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

@admin_manage_backup_bp.route('/restore', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def restore():
    try:
        file = request.files['file']
        # will return 1 record
        backup = Backup.objects.filter(__raw__ = {"hash_name": file.filename})

        # if backup's length is equal to 0, this mean requested backup file is not valid
        if len(backup) == 0:
            return jsonify({
                'code': STATUS_CODES['failure'], 
                'message': 'Không có thông tin bản sao lưu trong cơ sở dữ liệu!'
            })
        
        # check backup version
        current_version_file = open(CURRENT_VERSION_FILE_PATH, 'r+')
        current_version = current_version_file.read()
        current_version_postfix = int(current_version.split('.')[1])
        upcomming_version_postfix = int(backup[0].version.split('.')[1])
        if upcomming_version_postfix < current_version_postfix:
            return jsonify({
                'code': STATUS_CODES['failure'], 
                'message': 'Phiên bản cần sao lưu phải mới hơn hoặc bằng phiên bản hiện tại!'
            })

        # restore
        result = restoreDb(file)
        if result:
            # current update version file
            current_version_file.seek(0)
            current_version_file.write(backup[0].version)
            current_version_file.truncate()
            current_version_file.close()
            return jsonify({
                'code': STATUS_CODES['success'],
                'message': 'success'
            })
        else:
            return jsonify({
                'code': STATUS_CODES['failure'], 
                'message': 'restoreFailure'
            })
    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'restoreFailure'
        })
