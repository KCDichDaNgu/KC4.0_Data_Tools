import bson
import datetime
import logging
import os
import importlib
import types

from os.path import abspath, join, dirname, isfile, exists

from flask import (
    Flask, abort, g, send_from_directory, json, Blueprint as BaseBlueprint,
    make_response,
    url_for
)
from flask_caching import Cache

# from flask_wtf.csrf import CSRFProtect
from flask_navigation import Navigation
from speaklater import is_lazy_string
from werkzeug.middleware.proxy_fix import ProxyFix

from database import db
from oauth2 import config_oauth

import argparse

import json
from decouple import config

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from database.models.backup import create_backup
from constants.common import BACKUP_SCHEDULE_HOURS, ADD_LOCAL_DATA_SCHEDULE_MINUTES

from jobs.add_documents_and_sentences import add_all_documents_and_sentences_in_local

# import entrypoints

APP_NAME = __name__.split('.')[0]
ROOT_DIR = abspath(join(dirname(__file__)))

log = logging.getLogger(__name__)

cache = Cache()
# csrf = CSRFProtect()
nav = Navigation()

os.environ['AUTHLIB_INSECURE_TRANSPORT'] = 'true'

class Blueprint(BaseBlueprint):
    '''A blueprint allowing to decorate class too'''
    def route(self, rule, **options):
        def wrapper(func_or_cls):
            endpoint = str(options.pop('endpoint', func_or_cls.__name__))
            if isinstance(func_or_cls, types.FunctionType):
                self.add_url_rule(rule, endpoint, func_or_cls, **options)
            else:
                self.add_url_rule(rule,
                                  view_func=func_or_cls.as_view(endpoint),
                                  **options)
            return func_or_cls
        return wrapper

class CustomFlaskJsonEncoder(json.JSONEncoder):
    '''
    A JSONEncoder subclass to encode unsupported types:
        - ObjectId
        - datetime
        - lazy strings
    Handle special serialize() method and _data attribute.
    Ensure an app context is always present.
    '''
    def default(self, obj):
        if is_lazy_string(obj):
            return str(obj)
        elif isinstance(obj, bson.objectid.ObjectId):
            return str(obj)
        elif isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif hasattr(obj, 'to_dict'):
            return obj.to_dict()
        elif hasattr(obj, 'serialize'):
            return obj.serialize()
        # Serialize Raw data for Document and EmbeddedDocument.
        elif hasattr(obj, '_data'):
            return obj._data
        # Serialize raw data from Elasticsearch DSL AttrList
        elif hasattr(obj, '_l_'):
            return obj._l_
        return super(CustomFlaskJsonEncoder, self).default(obj)

def send_static(directory, filename, cache_timeout):
    out = send_from_directory(
        directory, 
        filename, 
        cache_timeout=cache_timeout
    )

    response = make_response(out)

    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Origin'] = '*'

    return response

# These loggers are very verbose
# We need to put them in WARNING level
# even if the main level is INFO or DEBUG
VERBOSE_LOGGERS = 'elasticsearch', 'requests'


def init_logging(app):
    logging.captureWarnings(True)  # Display warnings

    debug = app.debug or app.config.get('TESTING')

    log_level = logging.DEBUG if debug else logging.WARNING

    app.logger.setLevel(log_level)

    # for name in entrypoints.get_roots():  # Entrypoints loggers
    #     logging.getLogger(name).setLevel(log_level)

    for logger in VERBOSE_LOGGERS:
        logging.getLogger(logger).setLevel(logging.WARNING)

    return app

def register_extensions(app):
    
    import storages
    
    db.init_app(app)
    storages.init_app(app)
    cache.init_app(app)
    # csrf.init_app(app)
    nav.init_app(app)
    
    return app

class CustomFlaskApp(Flask):
    debug_log_format = '[%(levelname)s][%(name)s:%(lineno)d] %(message)s'

    # Keep track of static dirs given as register_blueprint argument
    static_prefixes = {}

    def send_static_file(self, filename):
        '''
        Override default static handling:
        - raises 404 if not debug
        - handle static aliases
        '''
        if not self.debug:
            self.logger.error('Static files are only served in debug')
            abort(404)

        cache_timeout = self.get_send_file_max_age(filename)

        # Default behavior
        if isfile(join(self.static_folder, filename)):
            return send_static(
                self.static_folder, 
                filename,
                cache_timeout=cache_timeout
            )

        # Handle aliases
        for prefix, directory in self.config.get('STATIC_DIRS', tuple()):
            if filename.startswith(prefix):
                real_filename = filename[len(prefix):]

                if real_filename.startswith('/'):
                    real_filename = real_filename[1:]

                if isfile(join(directory, real_filename)):
                    return send_static(
                        directory, 
                        real_filename,
                        cache_timeout=cache_timeout
                    )

        abort(404)

    def handle_http_exception(self, e):
        # Make exception/HTTPError available for context processors
        if 'error' not in g:
            g.error = e

        return super(CustomFlaskApp, self).handle_http_exception(e)

    def register_blueprint(self, blueprint, **kwargs):
        if blueprint.has_static_folder and 'url_prefix' in kwargs:
            self.static_prefixes[blueprint.name] = kwargs['url_prefix']

        return super(CustomFlaskApp, self).register_blueprint(blueprint, **kwargs)

def create_app(
    config='settings.Defaults', 
    override=None,
    init_logging=init_logging,
):

    '''Factory for a minimal application'''
    app = CustomFlaskApp(
        APP_NAME, 
        static_url_path='',
        static_folder='public'
    )

    app.config.from_object(config)

    settings = os.environ.get('UDATA_SETTINGS', join(os.getcwd(), 'udata.cfg'))

    if exists(settings):
        app.settings_file = settings  # Keep track of loaded settings for diagnostic
        app.config.from_pyfile(settings)

    if override:
        app.config.from_object(override)

    # Loads defaults from plugins
    # for pkg in entrypoints.get_roots(app):
    #     if pkg == 'udata':
    #         continue  # Defaults are already loaded
    #     module = '{}.settings'.format(pkg)
    #     try:
    #         settings = importlib.import_module(module)
    #     except ImportError:
    #         continue
    #     for key, default in settings.__dict__.items():
    #         if key.startswith('__'):
    #             continue
    #         app.config.setdefault(key, default)

    app.json_encoder = CustomFlaskJsonEncoder

    app.debug = app.config['DEBUG'] and not app.config['TESTING']

    app.wsgi_app = ProxyFix(app.wsgi_app)

    init_logging(app)

    register_extensions(app)

    config_oauth(app)

    CORS(app)

    setup_app(app)

    return app


def setup_app(app):
    # Create tables if they do not exist already
    # migrate = Migrate(app, db)

    from api.auth.views import auth_bp
    from api.single_language_data.views import single_language_data_bp
    from api.para_sentence.views import para_sentence_bp
    from api.assignment.views import assignment_bp
    from api.data_field.views import data_field_bp
    from api.report.views import report_bp
    from api.document.views import document_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(single_language_data_bp, url_prefix='/api/single-language-data')
    app.register_blueprint(assignment_bp, url_prefix='/api/assignment') 
    app.register_blueprint(para_sentence_bp, url_prefix='/api/para-sentence') 
    app.register_blueprint(data_field_bp, url_prefix='/api/data-field') 
    app.register_blueprint(report_bp, url_prefix='/api/report') 
    app.register_blueprint(document_bp, url_prefix='/api/document') 
    

    from api.admin.user.views import admin_manage_user_bp
    from api.admin.domain.views import admin_manage_domain_bp
    from api.admin.data_field.views import admin_manage_data_field_bp
    from api.admin.backup.views import admin_manage_backup_bp
    from api.admin.assignment.views import admin_manage_assignment_bp
    from api.admin.setting.views import admin_manage_setting_bp
    
    app.register_blueprint(admin_manage_data_field_bp, url_prefix='/api/admin/data-field') 
    app.register_blueprint(admin_manage_domain_bp, url_prefix='/api/admin/domain') 
    app.register_blueprint(admin_manage_user_bp, url_prefix='/api/admin/user') 
    app.register_blueprint(admin_manage_backup_bp, url_prefix='/api/admin/backup') 
    app.register_blueprint(admin_manage_assignment_bp, url_prefix='/api/admin/assignment') 
    app.register_blueprint(admin_manage_setting_bp, url_prefix='/api/admin/setting') 

    public_bp = Blueprint('public', 'public', static_folder='public', 
        static_url_path='public')
    app.register_blueprint(public_bp, url_prefix='')

def has_no_empty_params(rule):

    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()

    return len(defaults) >= len(arguments)

def site_map(app):

    links = []

    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        links.append((rule.endpoint, rule.methods))

    return links

# cronjob backup databases
sched = BackgroundScheduler(daemon=True)
sched.add_job(create_backup, 'interval', hours=BACKUP_SCHEDULE_HOURS)
sched.add_job(add_all_documents_and_sentences_in_local, 'interval', minutes=ADD_LOCAL_DATA_SCHEDULE_MINUTES)
sched.start()

app = create_app()

if __name__ == '__main__':

    import argparse

    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--debug',
        type=bool,
        default=True,
        help='Debug type'
    )

    args = parser.parse_args()

    debug = args.debug

    app.run(
        host='0.0.0.0',
        port=6011,
        debug=debug
    )
