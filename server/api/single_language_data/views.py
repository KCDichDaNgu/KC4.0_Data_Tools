import time
import os
import zipfile
import string

from flask_mongoengine import Pagination
from flask import Blueprint, request, session
from flask import jsonify, send_file, make_response
from authlib.integrations.flask_oauth2 import current_token
from bson.objectid import ObjectId
from mongoengine.queryset.transform import query
from constants.common import STATUS_CODES, IMPORT_SINGLE_LANGUAGE_DATA_DIR
from oauth2 import authorization, require_oauth, status_required, role_required

from collections import Counter

from database.models.user import User
from database.models.single_language_data import SentenceData, UploadedFile, SingleLanguageData
from database.models.data_field import DataField

from .utils import *


single_language_data_bp = Blueprint(__name__, 'single_language_data')

@single_language_data_bp.route('/upload', methods=['post'])
@require_oauth()
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def upload():
    try:
        uploaded_files = request.files.getlist("file")
        source = request.form['source']
        lang = request.form['lang']
        data_field_id = request.form['data_field_id']
        data_field = DataField.objects.get(id=data_field_id)

        user = current_token.user

        if not os.path.isdir(IMPORT_SINGLE_LANGUAGE_DATA_DIR):
            os.makedirs(IMPORT_SINGLE_LANGUAGE_DATA_DIR)

        sentences = []

        file_paths = [] # for removing files if error occurs
        for file in uploaded_files:
            
            file_content = file.read().decode("utf-8")

            file_path = f'{IMPORT_SINGLE_LANGUAGE_DATA_DIR}/{time.time()}_{file.filename}'
            file_paths.append(file_path)
            with open(file_path, 'w') as fp: # save uploaded file
                fp.write(file_content)

            word_array = split_into_words(file_content)
            sentence_array = file_content.splitlines()
            shortest_sentence, longest_sentence = getShortestAndLongestSentence(sentence_array)
            word_count = Counter(word_array) # for reporting

            sentence = SingleLanguageData(
                sentence_data = SentenceData(
                    content = file_content,
                    lang = lang,
                    word_num = len(word_array),
                    sentence_num = len(sentence_array),
                    longest_sentence = longest_sentence,
                    shortest_sentence = shortest_sentence,
                    word_count = word_count,
                ),
                data_file = UploadedFile(
                    file_name = file.filename,
                    file_path = file_path
                ),
                source = source,
                data_field = data_field,
                updated_by = user,
                updated_at = time.time(),
                created_by = user,
                created_at = time.time()
            )

            sentences.append(sentence)

        SingleLanguageData.objects.insert(sentences)

        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'uploadSuccess'
        }) 
    except Exception as ex:
        for file_path in file_paths:
            os.remove(file_path)
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'uploadFail'
        })

@single_language_data_bp.route('', methods=['get'])
@require_oauth()
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def get():
    try:
        args = request.args
        query = {}
        if args['lang'] != '':
            query = {"sentence_data.lang": args['lang']}
        single_sentences = Pagination(
            SingleLanguageData
                .objects.filter(__raw__ = query)
                .order_by('-created_at')
                .only("id", "sentence_data.content", "sentence_data.lang", "source", "data_field", "created_by", "updated_by"),
            int(args['page']),
            int(args['size']))
        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'success',
            'data': {
                "single_sentences": [x.serialize for x in single_sentences.items],
                "pagination": {
                    "current_page": single_sentences.page,
                    "total_pages": single_sentences.pages,
                    "page_size": single_sentences.per_page,
                    "total_items": single_sentences.total
                }
            }
        }) 
    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'fail'
        })

@single_language_data_bp.route('/delete-sentence', methods=['post'])
@require_oauth()
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def delete_by_id():
    try:
        id_to_delete = request.json['id']
        sentence_to_delete = SingleLanguageData.objects.get(id=id_to_delete)
        os.remove(sentence_to_delete['data_file']['file_path'])
        sentence_to_delete.delete()
        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'deleteSuccess'
        })
    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'deleteFail'
        })

@single_language_data_bp.route('/download/<id>', methods=['get'])
@require_oauth()
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def download(id):
    try:
        sentence = SingleLanguageData.objects.get(id=id)
        zipf = zipfile.ZipFile('data.zip', mode='w', compression=zipfile.ZIP_DEFLATED)
        zipf.write(sentence['data_file']['file_path'], sentence['data_file']['file_name'])
        zipf.close()
        return send_file(
            'data.zip',
            mimetype='zip',
        )
    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'fail'
        })

@single_language_data_bp.route('/export', methods=['get'])
@require_oauth()
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def export():
    try:
        lang = request.args.get('lang')
        query = {}
        if lang != '':
            query = {'sentence_data.lang': lang}
        sentences = SingleLanguageData.objects.filter(__raw__ = query)

        zipf = zipfile.ZipFile('data.zip', mode='w', compression=zipfile.ZIP_DEFLATED)
        for sentence in sentences:
            zipf.write(sentence['data_file']['file_path'], os.path.basename(sentence['data_file']['file_path']))

        zipf.close()
        return send_file(
            'data.zip',
            mimetype='zip',
        )
    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'fail'
        })

@single_language_data_bp.route('/report', methods=['get'])
@require_oauth()
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def get_report():
    try:
        lang = request.args.get('lang')
        field = request.args.get('field') # id
        query = {
            '$and': []
        }
        if lang != None and lang != '':
            query["$and"].append({'sentence_data.lang': lang})
        if field != None and field != '':
            query["$and"].append({'data_field': ObjectId(field)})

        if len(query['$and']) == 0:
            del query['$and']

        sentences = SingleLanguageData.objects.filter(__raw__ = query).only(
            "id",
            "sentence_data.lang",
            "sentence_data.word_num",
            "sentence_data.sentence_num",
            "sentence_data.longest_sentence",
            "sentence_data.shortest_sentence",
            "sentence_data.word_count",
            "source", "data_field",
            "created_by",
            "updated_by")
        
        report_data = create_report(sentences)

        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'success',
            'data': report_data
        })
    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'fail'
        })

@single_language_data_bp.route('/field-report', methods=['get'])
@require_oauth()
@role_required(['admin', 'reviewer'])
@status_required(User.USER_STATUS['active'])
def get_domain_report():
    try:
        lang = request.args.get('lang')
        query = {
            '$and': []
        }
        if lang != None and lang != '':
            query["$and"].append({'sentence_data.lang': lang})

        if len(query['$and']) == 0:
            del query['$and']
        grouped_fields = SingleLanguageData.objects().filter(__raw__ = query).aggregate([
            {
                "$group" : {'_id':"$data_field", 'count':{'$sum':1}}
            }, 
            {
                "$sort": {"count":-1, "data_field": 1}
            }
        ])

        field_report = []
        for item in grouped_fields:
            field = DataField.objects().get(id=item['_id'])
            field_report.append({
                'field': field,
                'count': item['count']
            })
        return jsonify({
            'code': STATUS_CODES['success'], 
            'message': 'success',
            'data': field_report
        })

    except Exception as ex:
        print(ex)
        return jsonify({
            'code': STATUS_CODES['failure'], 
            'message': 'fail'
        })