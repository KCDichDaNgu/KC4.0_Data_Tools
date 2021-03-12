from database.models.para_sentence_history import ParaSentenceHistory
from database.models.para_sentence import ParaSentence
from database.models.user import User
from database.models.para_sentence import LANGS
from database.models.assignment import Assignment

def build_match_query(lang, from_date=None, to_date=None, user_id=None):
    match_query = {
        '$match': {
            'newest_para_sentence.text2.lang': lang
        }
    }

    if user_id is not None:
        match_query['$match']['editor.user_id'] = user_id

    if from_date is not None and from_date > 0:
        match_query['$match']['updated_at'] = {'$gte': from_date}
    
    if to_date is not None and to_date > 0:
        if 'updated_at' not in match_query['$match']:
            match_query['$match']['updated_at'] = {}
        match_query['$match']['updated_at']['$lte'] = to_date
    
    return match_query

def report_all_users_be_edited(lang, from_date=None, to_date=None, user_id=None):
    match_query = build_match_query(lang, from_date, to_date, user_id)

    user_be_edited = ParaSentenceHistory.objects.aggregate([
        match_query,
        # 1 para sentence có thể bị edit nhiều lần bởi 1 user -> group theo para_sentence_id x user_id để chỉ tính là 1 lần edit
        {
            '$group': { 
                '_id': {
                    'para_sentence_id': '$para_sentence_id',
                    'user_id': '$editor.user_id'
                }
            }
        },
        # cần phải check xem cặp câu ngoài editor đã chỉnh sửa có bị người khác chỉnh sửa nữa ko
        # join với bảng para_sentence để tìm người chỉnh sửa cuối, phép join 1-1 gồm 1 lệnh $lookup + $project lấy phần tử đầu tiên
        {
            '$lookup': {
                'from': 'para_sentence',
                'localField': '_id.para_sentence_id',
                'foreignField': '_id',
                'as': 'newest_para_sentence'
            }
        },
        {
            '$project': {
                'newest_para_sentence': {'$arrayElemAt': ['$newest_para_sentence', 0]}
            }
        },
        # phép chiếu chỉ query 1 số lượng field nhất định, giảm memory, tăng thời gian tính toán
        {
            '$project': {
                '_id': 0,
                'last_editor_id': '$newest_para_sentence.editor.user_id',
                'user_id': '$_id.user_id',
                'para_sentence_id': '$_id.para_sentence_id',
                'same_editor': {'$cmp': ['$_id.user_id', '$newest_para_sentence.editor.user_id']}
            }
        },
        # nếu last_editor_id == user_id -> same_editor = 0
        # query các cặp câu có giá trị same_editor != 0, là số lượng cặp câu bị sửa của user
        {
            '$match': {
                'same_editor': {'$ne': 0}
            }
        },
        # đếm số lượng cặp câu bị sửa theo từng user
        {
            '$group': {
                '_id': '$user_id',
                'n_be_edited': {'$sum': 1}
            }
        },
        # chiếu đổi tên _id -> user_id
        {
            '$project': {
                '_id': 0,
                'user_id': '$_id',
                # 'user_id': { '$convert': { 'input': '$_id', 'to': 'string' } },
                'n_be_edited': 1
            }
        }
    ])

    user_be_edited = list(user_be_edited)

    for row in user_be_edited:
        row['user_id'] = str(row['user_id'])

    return user_be_edited

def report_all_users_edited(lang, from_date=None, to_date=None, user_id=None):
    match_query = build_match_query(lang, from_date, to_date, user_id)

    user_edited_count = ParaSentenceHistory.objects.aggregate(
        [
            match_query,
            {
                '$group': { # group by parasentence x user_id because 1 parasentence can be edited many times by an user
                    '_id': {
                        'para_sentence_id': '$para_sentence_id', 
                        'user_id': '$editor.user_id'
                    }
                }
            }, 
            {
                '$group': { # count number of parasentences group by user_id
                    '_id': '$_id.user_id', 
                    'n_edited': {'$sum': 1}
                }
            },
            {
                '$project': {  # convert _id -> str(user_id)
                    '_id': 0,
                    'user_id': '$_id',
                    # 'user_id': { '$convert': { 'input': '$_id', 'to': 'string' } },
                    'n_edited': 1
                }
            }
        ]
    )

    user_edited_count = list(user_edited_count)

    for row in user_edited_count:
        row['user_id'] = str(row['user_id'])

    return user_edited_count

def report_all_users_only_rate(lang, from_date=None, to_date=None, user_id=None):
    match_query = build_match_query(lang, from_date, to_date, user_id)
    match_query['$match']['edit_distance'] = 0
    if user_id is None:
        match_query['$match']['editor.user_id'] = {'$exists': True}

    user_only_rate = ParaSentence.objects.aggregate([
        match_query,
        {
            '$group': { # count number of parasentences group by user_id
                '_id': '$editor.user_id', 
                'n_only_rate': {'$sum': 1}
            }
        },
        {
            '$project': {  # convert _id -> str(user_id)
                '_id': 0,
                'user_id': '$_id',
                # 'user_id': { '$convert': { 'input': '$_id', 'to': 'string' } },
                'n_only_rate': 1
            }
        }
    ])

    user_only_rate = list(user_only_rate)

    for row in user_only_rate:
        row['user_id'] = str(row['user_id'])

    return user_only_rate

def report_all_users_total_edit_distance(lang, from_date=None, to_date=None, user_id=None):
    match_query = build_match_query(lang, from_date, to_date, user_id)
    if user_id is None:
        match_query['$match']['editor.user_id'] = {'$exists': True}

    user_total_edit_distance = ParaSentence.objects.aggregate([
        match_query,
        {
            '$group': { # count number of parasentences group by user_id
                '_id': '$editor.user_id', 
                'total_edit_distance': {'$sum': '$edit_distance'}
            }
        },
        {
            '$project': {  # convert _id -> str(user_id)
                '_id': 0,
                'user_id': '$_id',
                # 'user_id': { '$convert': { 'input': '$_id', 'to': 'string' } },
                'total_edit_distance': 1
            }
        }
    ])

    user_total_edit_distance = list(user_total_edit_distance)

    for row in user_total_edit_distance:
        row['user_id'] = str(row['user_id'])

    return user_total_edit_distance

def merge_query_user_list(user_list):
    user_id2data = {}

    for user_dict in user_list:
        for row in user_dict:
            user_id = row['user_id']

            if user_id not in user_id2data:
                user_id2data[user_id] = {}
            
            user_id2data[user_id].update({k: v for k, v in row.items()})

    return user_id2data

def get_username_by_user_ids(user_ids):
    users = User.objects.filter(id__in=user_ids)

    user_id2username = {}
    for user in users:
        user_id2username[str(user.id)] = user.username
    
    return user_id2username

def get_assignment_languages(user):
    langs = [lang for lang in LANGS if lang != 'vi']
    # nếu chỉ là reviewer, chỉ xem được ngôn ngữ của họ
    # nếu là cộng tác viên chỉ thấy ngôn ngữ của họ và user của họ
    if User.USER_ROLES['admin'] not in user.roles:
        assignment = Assignment.objects(user_id=user.id).first()
        langs = [lang.lang2 for lang in assignment.lang_scope]

    return langs
