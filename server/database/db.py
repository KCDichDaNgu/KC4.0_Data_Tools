import importlib
import logging
import warnings

from urllib.parse import urlparse

from bson import ObjectId, DBRef
from flask_mongoengine import MongoEngine, MongoEngineSessionInterface
from mongoengine.base import TopLevelDocumentMetaclass, get_document
from mongoengine.errors import ValidationError
from mongoengine.signals import pre_save, post_save

from flask_fs.mongo import FileField, ImageField

import entrypoints
from errors import ConfigError

from database.additional_fields.datetime_fields import DateField, DateRange, Datetimed
from database.additional_fields.extras_fields import ExtrasField
from database.additional_fields.slug_fields import SlugField
from database.additional_fields.url_field import URLField
from database.additional_fields.uuid_fields import AutoUUIDField

from database.helpers.queryset import CustomQuerySet

from flask import Flask

log = logging.getLogger(__name__)


class CustomMongoEngine(MongoEngine):
    '''Customized mongoengine with extra fields types and helpers'''
    def __init__(self, app=None):
        super(CustomMongoEngine, self).__init__(app)
        self.DateField = DateField
        self.Datetimed = Datetimed
        self.ExtrasField = ExtrasField
        self.SlugField = SlugField
        self.AutoUUIDField = AutoUUIDField
        self.DateRange = DateRange
        self.BaseQuerySet = CustomQuerySet
        self.BaseDocumentMetaclass = TopLevelDocumentMetaclass
        self.FileField = FileField
        self.ImageField = ImageField
        self.URLField = URLField
        self.ValidationError = ValidationError
        self.ObjectId = ObjectId
        self.DBRef = DBRef
        self.post_save = post_save
        self.pre_save = pre_save

    def resolve_model(self, model):
        '''
        Resolve a model given a name or dict with `class` entry.
        :raises ValueError: model specification is wrong or does not exists
        '''
        if not model:
            raise ValueError('Unsupported model specifications')
        if isinstance(model, str):
            classname = model
        elif isinstance(model, dict) and 'class' in model:
            classname = model['class']
        else:
            raise ValueError('Unsupported model specifications')

        try:
            return get_document(classname)
        except self.NotRegistered:
            message = 'Model "{0}" does not exist'.format(classname)
            raise ValueError(message)


db = CustomMongoEngine()
session_interface = MongoEngineSessionInterface(db)


MONGODB_DEPRECATED_SETTINGS = 'MONGODB_PORT', 'MONGODB_DB'
MONGODB_DEPRECATED_MSG = '{0} is deprecated, use the MONGODB_HOST url syntax'


def validate_config(config):
    for setting in MONGODB_DEPRECATED_SETTINGS:
        if setting in config:
            msg = MONGODB_DEPRECATED_MSG.format(setting)

            log.warning(msg)

            warnings.warn(msg, category=DeprecationWarning, stacklevel=2)

    url = config['MONGODB_HOST']

    parsed_url = urlparse(url)
    
    if not all((parsed_url.scheme, parsed_url.netloc)):
        raise ConfigError('{0} is not a valid MongoDB URL'.format(url))

    if len(parsed_url.path) <= 1:
        raise ConfigError('{0} is missing the database path'.format(url))


def build_test_config(config):
    if 'MONGODB_HOST_TEST' in config:
        config['MONGODB_HOST'] = config['MONGODB_HOST_TEST']
    else:
        # use `{database_name}-test` database for testing
        parsed_url = urlparse(config['MONGODB_HOST'])
        parsed_url = parsed_url._replace(path='%s-test' % parsed_url.path)
        config['MONGODB_HOST'] = parsed_url.geturl()

    validate_config(config)


# Avoid nose misdetecting this function as a test
build_test_config.__test__ = False

def init_for_migrate(app = Flask('test')):

    db = CustomMongoEngine()

    app.config.from_object('settings.Defaults')

    session_interface = MongoEngineSessionInterface(db)

    db.init_app(app)

def init_app(app):

    validate_config(app.config)
    
    if app.config['TESTING']:
        build_test_config(app.config)

    db.init_app(app)
