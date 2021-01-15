import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES, IMPORT_FROM_FILE_DIR
from oauth2 import authorization, require_oauth, status_required

from database.models.para_sentence import ParaSentence, Editor, NewestParaSentence, ParaSentenceText
from database.models.para_sentence_history import ParaSentenceHistory
from database.models.user import User

from bson import ObjectId
from api.para_sentence.pagination import PaginationParameters
import os
from .utils import *
import re
import json

para_sentence_bp = Blueprint(__name__, 'para_sentence')    


@para_sentence_bp.route('/', methods=['GET'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def get():
    args = request.args

    # delete old records which has current user id
    user = current_token.user
    remove_viewer_from_old_parasentences(user.id)

    # request new records
    query = {
        '$and': []
    }

    # filter params send by request
    if 'rating' in args and args['rating'] != 'all':
        query['$and'].append({
            'newest_para_sentence.rating': args['rating']
        })
        
    if 'lang1' in args and args['lang1'] != 'all':
        query['$and'].append({
            'newest_para_sentence.text1.lang': args['lang1']
        })

    if 'lang2' in args and args['lang2'] != 'all':
        query['$and'].append({
            'newest_para_sentence.text2.lang': args['lang2']
        })

    # query string contains
    append_or = False

    if 'text1' in args:
        pattern = re.compile(f".*{args['text1']}.*", re.IGNORECASE)

        query['$and'].append({
            '$or': [
                {
                    'newest_para_sentence.text1.content': {'$regex': pattern}
                }
            ]
        })

        append_or = True

    if 'text2' in args:
        pattern = re.compile(f".*{args['text2']}.*", re.IGNORECASE)

        if append_or:
            query['$and'][-1]['$or'].append(
                {
                    'newest_para_sentence.text2.content': {'$regex': pattern}
                }
            )
        else:
            query['$and'].append({
                '$or': [
                    {
                        'newest_para_sentence.text2.content': {'$regex': pattern}
                    }
                ]
            })

    # get records has current_user_id and not expired yet or without viewer_id or expired view_due_date
    current_timestamp = time.time()

    query['$and'].append({
        '$or': [
            {'$and': [
                {'viewer_id': user.id},
                {'view_due_date': {'$gte': current_timestamp}}
            ]},
            {'viewer_id': None},
            {'view_due_date': {'$lt': current_timestamp}}
        ]
    })

    para_sentences = ParaSentence.objects.filter(__raw__=query)

    # sort
    if 'sort_by' in args:
        sort_by = args['sort_by']
        sort_mark = ''
        
        if args['sort_order'] == 'descend':
            sort_mark = '-'
            
        para_sentences = para_sentences.order_by(f'{sort_mark}{sort_by}')

    # pagination
    page = int(args.get('page', PaginationParameters.page))
    page_size = int(args.get('page_size', PaginationParameters.page_size))
    para_sentences = para_sentences.paginate(page=page, per_page=page_size)

    # update viewer_id, and view_due_date
    view_due_date = get_view_due_date()

    for para_sentence in para_sentences.items:
        para_sentence.update(viewer_id=user.id, view_due_date=view_due_date)
    
    # assert ParaSentence.objects(viewer_id=user.id).count() == PaginationParameters.page_size, "viewer has too many parasentences"

    return jsonify(
        code=STATUS_CODES['success'],
        data={
            "para_sentences": [x.serialize for x in para_sentences.items],
            "pagination": {
                "current_page": para_sentences.page,
                "total_pages": para_sentences.pages,
                "page_size": para_sentences.per_page,
                "total_items": para_sentences.total
            }
        },
        message='success'
    )

@para_sentence_bp.route('/', methods=['POST'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def create():
    """
    Create a new ParaSentences.
    """
    args = request.get_json()

    para_sentence = ParaSentence(
        text1=args[ParaSentence.Attr.text1],
        text2=args[ParaSentence.Attr.text2],
        editor_id=args[ParaSentence.Attr.editor_id],
        para_document_id=args[ParaSentence.Attr.para_document_id],
        origin_para_document_id=args[ParaSentence.Attr.origin_para_document_id],
        created_time=args[ParaSentence.Attr.created_time],
        updated_at=args[ParaSentence.Attr.updated_at]
    )

    para_sentence.save()

    return jsonify(para_sentence)

@para_sentence_bp.route('/list-option-field', methods=['GET'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def list_option_field():
    list_lang1 = ParaSentence.objects.distinct('lang1')
    list_lang2 = ParaSentence.objects.distinct('lang2')
    list_rating = [
        ParaSentence.RATING_TYPES['good'],
        ParaSentence.RATING_TYPES['bad'],
        ParaSentence.RATING_TYPES['unRated'],
    ]
    
    return jsonify(
        code=STATUS_CODES['success'],
        data={
            "lang1": list_lang1,
            "lang2" : list_lang2,
            "rating" : list_rating
        },
        message='success'
    )

@para_sentence_bp.route('/import-from-file', methods=['POST'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def import_from_file():
    """
    Create new ParaSentences from files
    """

    print(request.form.to_dict())
    
    file = request.files['file']
    
    file_content = file.read()

    user = current_token.user

    if not os.path.isdir(IMPORT_FROM_FILE_DIR):
        os.makedirs(IMPORT_FROM_FILE_DIR)

    filepath = f'{IMPORT_FROM_FILE_DIR}/{time.time()}'
    
    with open(filepath, 'wb') as fp: # save uploaded file
        fp.write(file_content)

    status = import_parasentences_from_file(**{
        'filepath': filepath,
        'creator_id': user.id,
        'lang1': request.form['lang1'],
        'lang2': request.form['lang2'],
        'dataFieldId': request.form['dataFieldId']
    })
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=status,
        message='success'
    )
            
@para_sentence_bp.route('/<_id>', methods=['PUT'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def update(_id):
    try:
        para_sentence = ParaSentence.objects.get(id=ObjectId(_id))
    except:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'notFound', 
        })

    user = current_token.user
    if para_sentence.viewer_id != user.id:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'notAllowed', 
        })
    
    if para_sentence.editor is not None:
        if is_member_only(user.roles) and ('reviewer' in para_sentence.editor.roles or 'admin' in para_sentence.editor.roles):
            return jsonify({
                'code': STATUS_CODES['failure'], 
                'message': 'updatedByHigherRole', 
            })

    try:
        # save revised history
        para_sentence_history = ParaSentenceHistory(
            para_sentence_id=para_sentence.id,
            newest_para_sentence=json.loads(para_sentence.newest_para_sentence.to_json()),
            editor={
                'user_id': user.id,
                'roles': user.roles
            }
        )
        para_sentence_history.save()

        args = request.json

        # update para sentence
        newest_para_sentence = para_sentence.newest_para_sentence
        newest_para_sentence.text1.content = args.get('text1', newest_para_sentence.text1.content)
        newest_para_sentence.text2.content = args.get('text2', newest_para_sentence.text2.content)
        newest_para_sentence.rating = args.get('rating', ParaSentence.RATING_TYPES['good'])

        para_sentence.update(
            newest_para_sentence=json.loads(newest_para_sentence.to_json()),
            updated_at=time.time(),
            editor=Editor(
                user_id=user.id,
                roles=user.roles
            ),
            last_history_record_id=para_sentence_history.id
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
