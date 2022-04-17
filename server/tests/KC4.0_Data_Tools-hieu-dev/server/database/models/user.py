from copy import copy
import time
from itertools import chain
# from time import time
from uuid import uuid4

from blinker import Signal
from flask import url_for, current_app
from flask_security import UserMixin, RoleMixin, MongoEngineUserDatastore
from mongoengine.signals import pre_save, post_save
from itsdangerous import JSONWebSignatureSerializer
from elasticsearch_dsl import Integer, Object

from werkzeug import cached_property

from database.db import db
from storages import avatars, default_image_basename

from database.models.oauth2_code import OAuth2Code
from database.models.oauth2_token import OAuth2Token

__all__ = ('User', 'Role', 'datastore')

AVATAR_SIZES = [500, 200, 100, 32, 25]

def default_image_basename(*args, **kwargs):
    uuid = str(uuid4()).replace('-', '')
    return '/'.join((uuid[:2], uuid[2:]))

class UserSettings(db.EmbeddedDocument):
    prefered_language = db.StringField()


class User(UserMixin, db.Document):
    # slug = db.SlugField(
    #     max_length=255, 
    #     required=True, 
    #     populate_from='fullname'
    # )

    USER_STATUS = {
        'active': 'active',
        'inactive': 'inactive',
    }

    USER_ROLES = {
        'admin': 'admin', 
        'member': 'member', 
        'reviewer': 'reviewer'
    }

    email = db.StringField(
        max_length=255, 
        required=True, 
        unique=True
    )

    username = db.StringField(
        max_length=255, 
        required=True, 
        unique=True
    )

    password = db.StringField()
    status = db.StringField(
        choices=USER_STATUS.keys(),
        required=True,
        default=USER_STATUS['inactive']
    )

    roles = db.ListField(choices=USER_ROLES.keys(), default=['member'])

    first_name = db.StringField(max_length=255)
    last_name = db.StringField(max_length=255)

    avatar_url = db.URLField()
    avatar = db.ImageField(
        fs=avatars, 
        basename=default_image_basename, 
        thumbnails=AVATAR_SIZES
    )

    apikey = db.StringField()

    created_at = db.IntField(default=int(time.time()), required=True)
    updated_at = db.IntField(default=int(time.time()), required=True)

    # The field below is required for Flask-security
    # when SECURITY_CONFIRMABLE is True
    confirmed_at = db.DateTimeField()

    # password_rotation_demanded = db.DateTimeField()
    # password_rotation_performed = db.DateTimeField()

    # The 5 fields below are required for Flask-security
    # when SECURITY_TRACKABLE is True
    last_login_at = db.DateTimeField()
    current_login_at = db.DateTimeField()
    last_login_ip = db.StringField()
    current_login_ip = db.StringField()
    login_count = db.IntField()

    # deleted = db.DateTimeField()
    # ext = db.MapField(db.GenericEmbeddedDocumentField())
    extras = db.ExtrasField()

    before_save = Signal()
    after_save = Signal()
    on_create = Signal()
    on_update = Signal()
    before_delete = Signal()
    after_delete = Signal()
    on_delete = Signal()

    # deleted_at = db.DateTimeField()

    meta = {
        'indexes': ['-username'],
        'ordering': ['-username']
    }

    def __str__(self):
        return self.fullname

    def validate_password(self, password):
        return password == self.password

    def clear_auth_info(self):

        # OAuth2Code.objects.filter(user_id=self.id).delete()
        OAuth2Token.objects.filter(user=self.id).delete()

    @property
    def fullname(self):
        return ' '.join((self.first_name or '', self.last_name or '')).strip()

    @property
    def sysadmin(self):
        return self.has_role('admin')

    @classmethod
    def get(cls, id_or_slug):
        obj = cls.objects(slug=id_or_slug).first()
        
        return obj or cls.objects.get_or_404(id=id_or_slug)

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        document.updated_at = int(time.time())
        
        cls.before_save.send(document)

    @classmethod
    def post_save(cls, sender, document, **kwargs):
        cls.after_save.send(document)
        
        if kwargs.get('created'):
            cls.on_create.send(document)
        else:
            cls.on_update.send(document)

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'roles': self.roles,
           'username': self.username,
           'fullname': self.fullname,
           'email': self.email,
           'password': self.password,
           'status': self.status
        }

    def has_role(self, roles_name):
        return set(self.roles).issubset(set(roles_name))

    def has_status(self, status_name):
        return self.status == status_name

# datastore = MongoEngineUserDatastore(db, User)

pre_save.connect(User.pre_save, sender=User)
post_save.connect(User.post_save, sender=User)
