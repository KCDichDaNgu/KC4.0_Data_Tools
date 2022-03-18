import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES

from database.models.para_document import (
    ParaDocument, 
    Editor,
    Score,
    NewestParaDocument,
    OriginalParaDocument,
    ParaDocumentText
)

from database.models.user import User

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId
import json

from .utils import *

document_bp = Blueprint(__name__, 'document')

@document_bp.route('/', methods=['POST'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def create():

    user = current_token.user

    _data = request.get_json()  

    res_data = {
        'code': STATUS_CODES['success'],
        'data': { 'id': None },
        'message': 'success'
    }

    try:
        hash_content = hash_para_document(
            _data['text1'], 
            _data['text2'], 
            _data['lang1'], 
            _data['lang2']
        )

        para_doc = ParaDocument(
            newest_para_document=NewestParaDocument(
                text1=ParaDocumentText(
                    content=_data['text1'],
                    lang=_data['lang1']
                ),
                text2=ParaDocumentText(
                    content=_data['text2'],
                    lang=_data['lang2']
                ),
                hash_content=hash_content,
                rating=ParaDocument.RATING_TYPES['good']
            ),
            
            original_para_document=OriginalParaDocument(
                text1=ParaDocumentText(
                    content=_data['text1'],
                    lang=_data['lang1']
                ),
                text2=ParaDocumentText(
                    content=_data['text2'],
                    lang=_data['lang2']
                ),
                hash_content=hash_content,
                rating=ParaDocument.RATING_TYPES['good']
            ),
            creator_id=user.id,
            alignment_status=ParaDocument.ALIGNMENT_STATUSES['aligned'],
            data_field_id=_data['dataFieldId'],
            created_by=ParaDocument.CREATED_BY['by_user']
        )

        para_doc.save()
        
        res_data['data']['id'] = para_doc.id

    except Exception as err:
        if str(err) == "hashExists":
            
            res_data = {
                'code': STATUS_CODES['failure'],
                'data': { 'id': None },
                'message': 'docExisted'
            }

    return jsonify(res_data)
    
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
    print(query)

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

@document_bp.route('/<_id>', methods=['PUT'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def update(_id):
    # người quản trị chỉ được xem không được sửa
    # nếu user chỉ có roles 'admin' => ko được sửa
    user = current_token.user
    if set(User.USER_ROLES['admin']) == set(user.roles): 
        return jsonify(
            code=STATUS_CODES['failure'],
            message='notAllowed'
        )

    try:
        para_document = ParaDocument.objects.get(id=ObjectId(_id))
    except:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'notFound', 
        })

    if para_document.viewer_id != user.id:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'notAllowed', 
        })
    
    if para_document.editor is not None:
        if is_member_only(user.roles) and ('reviewer' in para_document.editor.roles or 'admin' in para_document.editor.roles):
            return jsonify({
                'code': STATUS_CODES['failure'], 
                'message': 'updatedByHigherRole', 
            })

    try:
        # # save revised history
        # para_document_history = ParaDocumentHistory(
        #     para_document_id=para_document.id,
        #     newest_para_document=json.loads(para_document.newest_para_document.to_json()),
        #     editor={
        #         'user_id': user.id,
        #         'roles': user.roles
        #     },
        #     updated_at=time.time()
        # )
        # para_document_history.save()

        args = request.json

        # update para document
        newest_para_document = para_document.newest_para_document
        newest_para_document.text1.content = args.get('text1', newest_para_document.text1.content).strip()
        newest_para_document.text2.content = args.get('text2', newest_para_document.text2.content).strip()
        newest_para_document.rating = args.get('rating', ParaDocument.RATING_TYPES['good'])

        para_document.update(
            newest_para_document=json.loads(newest_para_document.to_json()),
            updated_at=time.time(),
            editor=Editor(
                user_id=user.id,
                roles=user.roles
            )
        )

        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'updatedSuccess'
        })
    except Exception as err:
        print(err)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'errorUpdate'
        })

@document_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def delete(id):
    try:
        para_document = ParaDocument.objects.get(id=ObjectId(id))

        para_document.delete()

        return jsonify(
            code=STATUS_CODES['success'],
            message='success'
        )
    except:
        return jsonify(
            code=STATUS_CODES['failure'],
            message='notFound'
        )
