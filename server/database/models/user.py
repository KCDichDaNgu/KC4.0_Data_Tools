from copy import copy
from datetime import datetime
from itertools import chain
from time import time
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

__all__ = ('User', 'Role', 'datastore')

AVATAR_SIZES = [500, 200, 100, 32, 25]

def default_image_basename(*args, **kwargs):
    uuid = str(uuid4()).replace('-', '')
    return '/'.join((uuid[:2], uuid[2:]))


# TODO: use simple text for role
class Role(db.Document, RoleMixin):
    ADMIN = 'admin'
    username = db.StringField(max_length=80, unique=True)
    description = db.StringField(max_length=255)

    def __str__(self):
        return self.name


class UserSettings(db.EmbeddedDocument):
    prefered_language = db.StringField()


class User(UserMixin, db.Document):
    slug = db.SlugField(
        max_length=255, 
        required=True, 
        populate_from='fullname'
    )

    email = db.StringField(
        max_length=255, 
        required=True, 
        unique=True
    )

    password = db.StringField()
    active = db.BooleanField()
    roles = db.ListField(db.ReferenceField(Role), default=[])

    first_name = db.StringField(max_length=255, required=True)
    last_name = db.StringField(max_length=255, required=True)

    avatar_url = db.URLField()
    avatar = db.ImageField(
        fs=avatars, 
        basename=default_image_basename, 
        thumbnails=AVATAR_SIZES
    )

    website = db.URLField()
    about = db.StringField()

    prefered_language = db.StringField()

    apikey = db.StringField()

    created_at = db.DateTimeField(default=datetime.now, required=True)

    # The field below is required for Flask-security
    # when SECURITY_CONFIRMABLE is True
    confirmed_at = db.DateTimeField()

    password_rotation_demanded = db.DateTimeField()
    password_rotation_performed = db.DateTimeField()

    # The 5 fields below are required for Flask-security
    # when SECURITY_TRACKABLE is True
    last_login_at = db.DateTimeField()
    current_login_at = db.DateTimeField()
    last_login_ip = db.StringField()
    current_login_ip = db.StringField()
    login_count = db.IntField()

    deleted = db.DateTimeField()
    ext = db.MapField(db.GenericEmbeddedDocumentField())
    extras = db.ExtrasField()

    before_save = Signal()
    after_save = Signal()
    on_create = Signal()
    on_update = Signal()
    before_delete = Signal()
    after_delete = Signal()
    on_delete = Signal()

    meta = {
        'indexes': ['-created_at', 'slug', 'apikey'],
        'ordering': ['-created_at']
    }

    def __str__(self):
        return self.fullname

    @property
    def fullname(self):
        return ' '.join((self.first_name or '', self.last_name or '')).strip()

    @property
    def sysadmin(self):
        return self.has_role('admin')

    # @cached_property
    # def datasets_org_count(self):
    #     """Return the number of datasets of user's organizations."""
    #     from udata.models import Dataset  # Circular imports.
    #     return sum(Dataset.objects(organization=org).visible().count()
    #                for org in self.organizations)

    def generate_api_key(self):
        s = JSONWebSignatureSerializer(current_app.config['SECRET_KEY'])
        byte_str = s.dumps({
            'user': str(self.id),
            'time': time(),
        })
        self.apikey = byte_str.decode()

    def clear_api_key(self):
        self.apikey = None

    @classmethod
    def get(cls, id_or_slug):
        obj = cls.objects(slug=id_or_slug).first()
        return obj or cls.objects.get_or_404(id=id_or_slug)

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        cls.before_save.send(document)

    @classmethod
    def post_save(cls, sender, document, **kwargs):
        cls.after_save.send(document)
        if kwargs.get('created'):
            cls.on_create.send(document)
        else:
            cls.on_update.send(document)
            
    def mark_as_deleted(self):
        copied_user = copy(self)

        self.email = '{}@deleted'.format(self.id)
        self.slug = 'deleted'
        self.password = None
        self.active = False
        self.first_name = 'DELETED'
        self.last_name = 'DELETED'
        self.avatar = None
        self.avatar_url = None
        self.website = None
        self.about = None
        self.extras = None
        self.apikey = None
        self.deleted = datetime.now()
        self.save()


datastore = MongoEngineUserDatastore(db, User, Role)

pre_save.connect(User.pre_save, sender=User)
post_save.connect(User.post_save, sender=User)
