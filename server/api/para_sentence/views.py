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
from .utils import import_parasentences_from_file, hash_para_sentence

para_sentence_bp = Blueprint(__name__, 'para_sentence')    


@para_sentence_bp.route('/', methods=['GET'])
@require_oauth()
def get():
    args = request.args
    
    spec = {}
    attr_filter = [
        ParaSentence.Attr.lang1,
        ParaSentence.Attr.lang2,
        ParaSentence.Attr.rating,
    ]
    for attr in attr_filter:
        if attr in args:
            spec[attr] = args[attr]

    para_sentences = ParaSentence.objects.filter(__raw__=spec).all()

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
    
    return jsonify({
        "data": para_sentences.items,
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
        updated_time=args[ParaSentence.Attr.updated_time])

    para_sentence.save()

    return jsonify(para_sentence)

@para_sentence_bp.route('/list_option_field', methods=['GET'])
@require_oauth()
def list_option_field():
    list_lang1 = ParaSentence.objects.distinct('lang1')
    list_lang2 = ParaSentence.objects.distinct('lang2')
    list_rating = [
        ParaSentence.RATING_GOOD,
        ParaSentence.RATING_NOTGOOD,
        ParaSentence.RATING_UNRATED,
    ]
    
    return jsonify({
        "lang1": list_lang1,
        "lang2" : list_lang2,
        "rating" : list_rating
    })

@para_sentence_bp.route('/import_from_file', methods=['POST'])
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

    n_success, n_data = import_parasentences_from_file(filepath)
    
    return jsonify({
        "n_success": n_success,
        "n_data": n_data
    })

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
        
        if hash_changed:
            hash = hash_para_sentence(hashes['text1'], hashes['text2'], hashes['lang1'], hashes['lang2'])
            para_sentence.update(edited=filter_params, hash=hash)
        else:
            para_sentence.update(edited=filter_params)

        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'updatedSuccess'
        })
    except:
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'errorUpdate'
        })
            
