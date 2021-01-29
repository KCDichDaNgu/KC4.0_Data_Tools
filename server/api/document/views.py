import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.para_document import ParaDocument
from database.models.user import User

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

from .utils import *

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
    
@document_bp.route('/', methods=['GET'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def get():
    args = request.args
    
    # xoá các bản ghi cũ mà user đã xem
    user = current_token.user
    
    if User.USER_ROLES['admin'] not in user.roles:
        remove_viewer_from_old_paradocuments(user.id)

    # request new records
    query = build_query_params(args)

    # get records has current_user_id and not expired yet or without viewer_id or expired view_due_date
    current_timestamp = time.time()

    # nếu current user là admin -> view được hết
    if User.USER_ROLES['admin'] not in user.roles:
        query['$and'].append({
            '$or': [
                {
                    '$and': [
                        { 'viewer_id': user.id },
                        { 'view_due_date': { '$gte': current_timestamp }}
                ]},
                { 'viewer_id': None },
                { 'view_due_date': { '$lt': current_timestamp }}
            ]
        })

    para_documents = ParaDocument.objects.filter(__raw__=query)

    # sort
    if 'sortBy' in args:
        sort_by = args['sortBy']
        sort_mark = ''
        
        if args['sortOrder'] == 'descend':
            sort_mark = '-'
            
        para_documents = para_documents.order_by(f'{sort_mark}{sort_by}')

    # pagination
    page = int(args.get('page', 1))
    page_size = int(args.get('page_size', 5))
    para_documents = para_documents.paginate(page=page, per_page=page_size)

    # update viewer_id, and view_due_date
    view_due_date = get_view_due_date()

    # nếu current user không phải admin, cập nhật view_id
    if User.USER_ROLES['admin'] not in user.roles:
        for para_document in para_documents.items:
            para_document.update(viewer_id=user.id, view_due_date=view_due_date)
    
    # assert ParaDocument.objects(viewer_id=user.id).count() == PaginationParameters.page_size, "viewer has too many ParaDocuments"

    return jsonify(
        code=STATUS_CODES['success'],
        data={
            "para_documents": [x.serialize for x in para_documents.items],
            "pagination": {
                "current_page": para_documents.page,
                "total_pages": para_documents.pages,
                "page_size": para_documents.per_page,
                "total_items": para_documents.total
            }
        },
        message='success'
    )

@document_bp.route('/list-option-field', methods=['GET'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def list_option_field():
    list_lang1 = ParaDocument.objects.distinct('lang1')
    list_lang2 = ParaDocument.objects.distinct('lang2')
    list_rating = [
        ParaDocument.RATING_TYPES['good'],
        ParaDocument.RATING_TYPES['bad'],
        ParaDocument.RATING_TYPES['unRated'],
    ]
    list_alignment_status = [
        ParaDocument.ALIGNMENT_STATUSES['aligned'],
        ParaDocument.ALIGNMENT_STATUSES['not_aligned_yet']
    ]
    
    return jsonify(
        code=STATUS_CODES['success'],
        data={
            "lang1": list_lang1,
            "lang2" : list_lang2,
            "rating" : list_rating,
            "alignment_status": list_alignment_status
        },
        message='success'
    )
