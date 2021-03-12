import time
from flask import Blueprint, request, session
from flask import jsonify, send_file
from authlib.integrations.flask_oauth2 import current_token
from oauth2 import authorization, require_oauth, status_required

from constants.common import STATUS_CODES

from database.models.user import User
from database.models.para_sentence_history import ParaSentenceHistory
from database.models.para_sentence import ParaSentence
from database.models.setting import Setting
from .utils import *

from bson import ObjectId
import os
import re
import json

report_bp = Blueprint(__name__, 'report')

@report_bp.route('/', methods=['GET'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def get():
    args = request.args

    from_date = float(args.get('fromDate', 0)) / 1000
    to_date = float(args.get('toDate', 0)) / 1000
    
    user = current_token.user

    langs = get_assignment_languages(user)

    report_by_language = {}

    for lang in langs:
        if User.USER_ROLES['admin'] in user.roles or User.USER_ROLES['reviewer'] in user.roles:
            # số lượng sửa
            user_edited_count = report_all_users_edited(lang, from_date, to_date)
            # số lượng bị sửa bởi reviewer
            user_be_edited_count = report_all_users_be_edited(lang, from_date, to_date)
            # số lượng chỉ đánh giá không sửa text, edit distance = 0
            user_only_rate = report_all_users_only_rate(lang, from_date, to_date)
            # tổng số edit distanace
            user_total_edit_distance = report_all_users_total_edit_distance(lang, from_date, to_date)
        elif User.USER_ROLES['member'] in user.roles:
            # số lượng sửa
            user_edited_count = report_all_users_edited(lang, from_date, to_date, user_id=user.id)
            # số lượng bị sửa bởi reviewer
            user_be_edited_count = report_all_users_be_edited(lang, from_date, to_date, user_id=user.id)
            # số lượng chỉ đánh giá không sửa text, edit distance = 0
            user_only_rate = report_all_users_only_rate(lang, from_date, to_date, user_id=user.id)
            # tổng số edit distanace
            user_total_edit_distance = report_all_users_total_edit_distance(lang, from_date, to_date, user_id=user.id)

        # merge 2 dictionary to 1
        user_report = merge_query_user_list([
            user_edited_count, 
            user_be_edited_count,
            user_only_rate,
            user_total_edit_distance])
        username_dict = get_username_by_user_ids(user_report.keys())
        
        for user_id, report in user_report.items():
            username = username_dict[user_id]
            report['username'] = username
            report['lang'] = lang
            report['from_date'] = from_date * 1000
            report['to_date'] = to_date * 1000

        user_report_list = []
        for user_id, report in user_report.items():
            user_report_list.append(report)

        report_by_language[lang] = user_report_list
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=report_by_language,
        message='success'
    )

@report_bp.route('/unrated-count', methods=['GET'])
@require_oauth()
@status_required(User.USER_STATUS['active'])
def get_unrated_count():
    args = request.args
    user = current_token.user

    # filter text1.words_count >= threshold
    setting = Setting.objects.first()

    if setting is None:
        min_words = 0
    else:
        min_words = setting['content']['min_words_of_vietnamese_sentence']

    langs = get_assignment_languages(user)
    
    count_unrated_dict = {}

    for lang in langs:
        n_unrated = ParaSentence.objects.filter(__raw__={
            'newest_para_sentence.text1.words_count': {
                '$gte': min_words
            },
            'newest_para_sentence.text2.lang': lang,
            'newest_para_sentence.rating': ParaSentence.RATING_TYPES['unRated']
        }).count()
        count_unrated_dict[lang] = n_unrated
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=count_unrated_dict,
        message='success'
    )
