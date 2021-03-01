import time
import requests
from flask import Blueprint, request, session
from flask import jsonify
from authlib.integrations.flask_oauth2 import current_token
from constants.common import STATUS_CODES, API_CRAWL

from database.models.domain import Domain
from database.models.user import User
from database.models.para_document import ParaDocument
from utils.env import read_env_files

from oauth2 import authorization, require_oauth, status_required, role_required

from bson import ObjectId

admin_manage_domain_bp = Blueprint(__name__, 'domain')    

@admin_manage_domain_bp.route('/', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def create():

    user = current_token.user

    domain = Domain(
        url=request.get_json()['url'],
        creator_id=user
    )

    domain.save()

    return jsonify(
        code=STATUS_CODES['success'],
        data=domain.id,
        message='success'
    )


@admin_manage_domain_bp.route('/<id>', methods=['DELETE'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def delete(id):

    Domain.objects.filter(id=ObjectId(id)).delete()
    
    return jsonify(
        code=STATUS_CODES['success'],
        data=id,
        message='success'
    )


@admin_manage_domain_bp.route('/<id>', methods=['PUT'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def update(id):

    url = request.get_json().get('url')

    domain = Domain.objects.filter(id=ObjectId(id))
    
    domain.update(url=url, editor_id=current_token.user)

    return jsonify(
        code=STATUS_CODES['success'],
        data=domain,
        message='success'
    )

@admin_manage_domain_bp.route('/search', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def search():
    
    result = Domain.objects \
        .filter(url__contains=request.get_json().get('url') or '') \
        .paginate(
            page=int(request.get_json().get('pagination__page') or 1), 
            per_page=int(request.get_json().get('pagination__perPage') or 5)
        )

    result_domain = [i.serialize for i in result.items]
    for domain in result_domain:
        domain['inserted_documents_count'] = ParaDocument.objects(domain_id=domain['id']).count()
        
    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'total': result.total,
            'page': result.page,
            'perPage': result.per_page,
            'items': result_domain
        },
        message='success'
    )
    

@admin_manage_domain_bp.route('/crawl', methods=['POST'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def crawl():
    lang = request.get_json().get('lang')
    id = request.get_json().get('id')

    domain = Domain.objects(id=ObjectId(id)).first()
    
    env_dict = read_env_files()

    token_api = env_dict['TOKEN_CRAWL_API']

    res = requests.post(
        f"{API_CRAWL}/run_bitextor",
        params={
            'token': token_api,
            'host': domain.url,
            'lang': lang
        }
    )

    try:
        res = res.json()
    except Exception as err:
        return jsonify(
            code=STATUS_CODES['failure'],
            message='apiError'
        ) 

    if 'job_id' not in res:
        if 'job' in res and res['job']['status'] == 'Inprogress':
            return jsonify(
                code=STATUS_CODES['failure'],
                message='runningJob'
            )
        elif 'job' in res:
            return jsonify(
                code=STATUS_CODES['failure'],
                message='apiError'
            )
        else:
            return jsonify(
                code=STATUS_CODES['failure'],
                message='apiErrorNoJobId'
            )

    job_id = res['job_id']

    domain.update(job_id=job_id)

    return jsonify(
        code=STATUS_CODES['success'],
        data={
            'job_id': job_id
        },
        message='success'
    )

@admin_manage_domain_bp.route('/check_status_bitextor/<id>', methods=['GET'])
@require_oauth()
@role_required(['admin'])
@status_required(User.USER_STATUS['active'])
def check_status_bitextor(id):
    domain = Domain.objects(id=ObjectId(id)).first()

    env_dict = read_env_files()
    token_api = env_dict['TOKEN_CRAWL_API']

    res = requests.get(
        f"{API_CRAWL}/check_status_bitextor",
        params={
            'token': token_api,
            'job_id': domain.job_id
        }
    )

    try:
        res = res.json()
    except Exception as err:
        return jsonify(
            code=STATUS_CODES['failure'],
            message='apiError'
        )

    # print(res)
    # res['status'] = 'Completed'

    if 'status' not in res:
        domain.update(job_id=None)

        return jsonify(
            code=STATUS_CODES['failure'],
            message='jobNotFound'
        )

    if res['status'] == 'Completed':
        domain.update(job_id=None)

    return jsonify(
        code=STATUS_CODES['success'],
        data=domain.serialize,
        message='success'
    )
