import time
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES, IMPORT_FROM_FILE_DIR
from oauth2 import authorization, require_oauth
from database.models.para_sentence import ParaSentence
from bson import ObjectId
from api.para_sentence.pagination import PaginationParameters
import os
from .utils import import_parasentences_from_file, hash_para_sentence, get_view_due_date
import re

para_sentence_bp = Blueprint(__name__, 'para_sentence')    


@para_sentence_bp.route('/', methods=['GET'])
@require_oauth()
def get():
    args = request.args
    
    query = {
        '$and': []
    }

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

    # get records has current_user_id and not expired yet or  without viewer_id or expired view_due_date
    current_timestamp = time.time()
    user = current_token.user
    query['$and'].append({
        '$or': [
            {'$and': [
                {'viewer_id': user.id},
                {'view_due_date': {'$gte': current_timestamp}}
            ]},
            {'viewer_id': {'$exists': False}},
            {'view_due_date': {'$lt': current_timestamp}}
        ]
    })

    if len(query['$and']) == 0:
        del query['$and']

    para_sentences = ParaSentence.objects.filter(__raw__=query).all()

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
    
    return jsonify({
        "data": [x.serialize for x in para_sentences.items],
        "pagination": {
            "current_page": para_sentences.page,
            "total_pages": para_sentences.pages,
            "page_size": para_sentences.per_page,
            "total_items": para_sentences.total
        }
    })

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
        updated_time=args[ParaSentence.Attr.updated_time]
    )

    para_sentence.save()

    return jsonify(para_sentence)

@para_sentence_bp.route('/list-option-field', methods=['GET'])
@require_oauth()
def list_option_field():
    list_lang1 = ParaSentence.objects.distinct('lang1')
    list_lang2 = ParaSentence.objects.distinct('lang2')
    list_rating = [
        ParaSentence.RATING_GOOD,
        ParaSentence.RATING_BAD,
        ParaSentence.RATING_UNRATED,
    ]
    
    return jsonify({
        "lang1": list_lang1,
        "lang2" : list_lang2,
        "rating" : list_rating
    })

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
    
    return jsonify(status)

@para_sentence_bp.route('/<_id>', methods=['PUT'])
@require_oauth()
def update(_id):
    try:
        para_sentence = ParaSentence.objects.get(id=ObjectId(_id))
        user = current_token.user
        if para_sentence.viewer_id != user.id:
            return jsonify({
                'code': STATUS_CODES['failure'], 
                'message': 'notAllowed', 
            })
    except:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'notFound', 
        })

    try:
        hashes = {
            'text1': para_sentence.text1,
            'text2': para_sentence.text2,
            'lang1': para_sentence.lang1,
            'lang2': para_sentence.lang2,
        }

        filter_params = {}
        hash_changed = False
        text_changed = False

        for key, value in request.json.items():
            if key == '_id': continue
            filter_params[key] = value
            if key in hashes.keys():
                hashes[key] = value
                hash_changed = True
            if key in ['text1', 'text2']:
                text_changed = True

        if text_changed:
            filter_params['rating'] = ParaSentence.RATING_GOOD

        if para_sentence['original'] is None:
            original = {
                'text1': para_sentence.text1,
                'text2': para_sentence.text2,
                'rating': para_sentence.rating,
            }
            filter_params['original'] = original
        
        filter_params['updated_time'] = time.time()

        if hash_changed:
            hash = hash_para_sentence(hashes['text1'], hashes['text2'], hashes['lang1'], hashes['lang2'])
            para_sentence.update(hash=hash, **filter_params, editor_id=user)
            print('update hash')
        else:
            para_sentence.update(**filter_params, editor_id=user)

        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'updatedSuccess'
        })
    except:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'errorUpdate'
        })
            
