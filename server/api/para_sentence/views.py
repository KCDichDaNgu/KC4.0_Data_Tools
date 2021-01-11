import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES, IMPORT_FROM_FILE_DIR
from oauth2 import authorization, require_oauth
from database.models.para_sentence import ParaSentence, UserRating
from database.models.para_sentence_history import ParaSentenceHistory
from database.models.user import User
from bson import ObjectId
from api.para_sentence.pagination import PaginationParameters
import os
from .utils import *
import re

para_sentence_bp = Blueprint(__name__, 'para_sentence')    


@para_sentence_bp.route('/', methods=['GET'])
@require_oauth()
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
    if ParaSentence.Attr.rating in args and args[ParaSentence.Attr.rating] != 'all':
        query['$and'].append({ParaSentence.Attr.rating: args[ParaSentence.Attr.rating]})
        
    if ParaSentence.Attr.lang1 in args and args[ParaSentence.Attr.lang1] != 'all':
        query['$and'].append({ParaSentence.Attr.lang1: args[ParaSentence.Attr.lang1]})

    if ParaSentence.Attr.lang2 in args and args[ParaSentence.Attr.lang2] != 'all':
        query['$and'].append({ParaSentence.Attr.lang2: args[ParaSentence.Attr.lang2]})

    # query string contains
    append_or = False

    if 'text1' in args:
        pattern = re.compile(f".*{args['text1']}.*", re.IGNORECASE)

        query['$and'].append({
            '$or': [
                {'text1': {'$regex': pattern}}
            ]
        })

        append_or = True

    if 'text2' in args:
        pattern = re.compile(f".*{args['text2']}.*", re.IGNORECASE)

        if append_or:
            query['$and'][-1]['$or'].append(
                {'text2': {'$regex': pattern}}
            )
        else:
            query['$and'].append({
                '$or': [
                    {'text2': {'$regex': pattern}}
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
def list_option_field():
    list_lang1 = ParaSentence.objects.distinct('lang1')
    list_lang2 = ParaSentence.objects.distinct('lang2')
    list_rating = [
        UserRating.RATING_TYPES['good'],
        UserRating.RATING_TYPES['bad'],
        UserRating.RATING_TYPES['unRated'],
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
def import_from_file():
    """
    Create new ParaSentences from files
    """
    file = request.files['file']
    file_content = file.read()

    if not os.path.isdir(IMPORT_FROM_FILE_DIR):
        os.makedirs(IMPORT_FROM_FILE_DIR)

    filepath = f'{IMPORT_FROM_FILE_DIR}/{time.time()}'
    
    with open(filepath, 'wb') as fp: # save uploaded file
        fp.write(file_content)

    status = import_parasentences_from_file(filepath)
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=status,
        message='success'
    )
            
@para_sentence_bp.route('/<_id>', methods=['PUT'])
@require_oauth()
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
    
    if ROLE2IDX[para_sentence.editor_role] > ROLE2IDX[get_highest_user_role(user.roles)]:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'updatedByHigherRole', 
        }) 

    try:
        # hashes = {
        #     'text1': para_sentence.text1,
        #     'text2': para_sentence.text2,
        #     'lang1': para_sentence.lang1,
        #     'lang2': para_sentence.lang2,
        # }

        update_args = {
            'rating': ParaSentence.RATING_TYPES['good']
        }
        # hash_changed = False

        for key, value in request.json.items():
            if key == '_id': continue
            update_args[key] = value
            # if key in hashes.keys():
            #     hashes[key] = value
                # hash_changed = True

        # update last_updated time
        updated_at = time.time()
        update_args['updated_at'] = updated_at

        # recompute hash 
        # if hash_changed:
        #     hash = hash_para_sentence(hashes['text1'], hashes['text2'], hashes['lang1'], hashes['lang2'])
        #     update_args['hash'] = hash

        # assign highest user role to para_sentence.editor_role
        editor_role = get_highest_user_role(user.roles)
        update_args['editor_id'] = user.id
        update_args['editor_role'] = editor_role

        # save original para sentence
        if para_sentence.original is None:
            original = {
                'text1': para_sentence.text1,
                'text2': para_sentence.text2,
                'rating': para_sentence.rating,
            }
            update_args['original'] = original

        # save revised history
        before_update_status = {
            'para_sentence_id': para_sentence.id,
            'text1': para_sentence.text1,
            'text2': para_sentence.text2,
            'rating': para_sentence.rating,
            'updated_at': updated_at,
            'editor_id': para_sentence.editor_id,
            'editor_role': para_sentence.editor_role
        }
        root_para_sentence_history = ParaSentenceHistory(**before_update_status)
        root_para_sentence_history.save()

        # update para sentence
        para_sentence.update(**update_args)

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
