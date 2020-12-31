from .parameters import AddParaSentenceParameters
from .models import ParaSentence
from flask import Blueprint, jsonify, request, render_template, url_for, redirect
from app.extensions.api import Namespace
from flask_restplus_patched import Resource
from flask_restplus._http import HTTPStatus
from app.extensions import mongo
from app.extensions.api.parameters import PaginationParameters
from .parameters import ParaSentenceFilterParameter
from flask_restplus import Resource
from bson.objectid import ObjectId

from config import BaseConfig
from .utils import import_parasentences_from_file, hash_para_sentence

import time
import os

api = Namespace('para_sentence', description="para_sentence")


@api.route('/')
class ParaSentences(Resource):
    """
    Manipulations with ParaSentences
    """
    @api.parameters(ParaSentenceFilterParameter())
    @api.response(code=HTTPStatus.CONFLICT)
    def get(self, args):
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
        para_sentences = para_sentences.paginate(page=args['page'], per_page=args['page_size'])
        
        return jsonify({
            "data": para_sentences.items,
            "pagination": {
                "current_page": para_sentences.page,
                "total_pages": para_sentences.pages,
                "page_size": para_sentences.per_page,
                "total_items": para_sentences.total
            }
        })

    @api.parameters(AddParaSentenceParameters())
    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='create_para_sentences')
    def post(self, args):
        """
        Create a new ParaSentences.
        """
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

@api.route('/list_lang')
class ListLang(Resource):
    """
    Manipulations with ParaSentences
    """
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    def get(self, args):
        list_lang = ParaSentence.objects.distinct('lang1')
        return jsonify({"data" : list_lang})

@api.route('/list_rating')
class ListRating(Resource):
    """
    Manipulations with ParaSentences
    """
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    def get(self, args):
        list_rating = ParaSentence.objects.distinct('rating')
        return jsonify({"ratings" : list_rating})

# @api.route('/list_status')
# class ListStatus(Resource):
#     """
#     Manipulations with ParaSentences
#     """
#     @api.parameters(PaginationParameters())
#     @api.response(code=HTTPStatus.CONFLICT)
#     def get(self, args):
#         list_status = ParaSentence.objects.distinct('status')
#         return jsonify({"statuses" : list_status})

@api.route('/list_option_field')
class ListOptionField(Resource):
    """
    Manipulations with ParaSentences
    """
    @api.parameters(PaginationParameters())
    @api.response(code=HTTPStatus.CONFLICT)
    def get(self, args):
        list_lang1 = ParaSentence.objects.distinct('lang1')
        list_lang2 = ParaSentence.objects.distinct('lang2')
        list_rating = ParaSentence.objects.distinct('rating')
        
        return jsonify({
            "lang1": list_lang1,
            "lang2" : list_lang2,
            "rating" : list_rating
        })

@api.route('/import_from_file')
class ImportFromFile(Resource):

    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    def post(self):
        """
        Create new ParaSentences from files
        """
        file = request.files['file']
        file_content = file.read()

        if not os.path.isdir(BaseConfig.IMPORT_FROM_FILE_DIR):
            os.makedirs(BaseConfig.IMPORT_FROM_FILE_DIR)

        filepath = f'{BaseConfig.IMPORT_FROM_FILE_DIR}/{time.time()}'
        
        with open(filepath, 'wb') as fp: # save uploaded file
            fp.write(file_content)

        n_success, n_data = import_parasentences_from_file(filepath)
       
        return jsonify({
            "n_success": n_success,
            "n_data": n_data
        })

@api.route('/<_id>')
class ParaSentenceAPI(Resource):

    @api.response(code=HTTPStatus.FORBIDDEN)
    @api.response(code=HTTPStatus.CONFLICT)
    @api.doc(id='update_para_sentence')
    def put(self, _id, *args, **kwargs):
        try:
            para_sentence = ParaSentence.objects.get(id=ObjectId(_id))
        except:
            return jsonify({
                'code': BaseConfig.STATUS_CODE['failure'], 
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

            for key, value in request.json.items():
                if key == '_id': continue
                filter_params[key] = value
                if key in hashes.keys():
                    hashes[key] = value
                    hash_changed = True
            
            if hash_changed:
                hash = hash_para_sentence(hashes['text1'], hashes['text2'], hashes['lang1'], hashes['lang2'])
                para_sentence.update(edited=filter_params, hash=hash)
            else:
                para_sentence.update(edited=filter_params)

            return jsonify({
                'code': BaseConfig.STATUS_CODE['success'], 
                'message': 'updatedSuccess', 
            })
        except:
            return jsonify({
                'code': BaseConfig.STATUS_CODE['failure'], 
                'message': 'errorUpdate', 
            })
            