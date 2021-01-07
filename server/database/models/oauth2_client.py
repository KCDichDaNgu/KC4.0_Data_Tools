from authlib.oauth2.rfc6749 import grants, ClientMixin

from ..db import db 

from storages import images, default_image_basename
from authlib.oauth2.rfc6749.util import scope_to_list, list_to_scope

class OAuth2Client(ClientMixin, db.Datetimed, db.Document):
    secret = db.StringField(default=lambda: gen_salt(50))
    client_id = db.StringField(required=True)

    name = db.StringField(required=True)
    description = db.StringField()

    owner = db.ReferenceField('User')
    organization = db.ReferenceField('Organization')
    image = db.ImageField(
        fs=images, 
        basename=default_image_basename,
        thumbnails=[150, 25]
    )

    redirect_uris = db.ListField(db.StringField())
    scope = db.StringField(default='default')
    grant_types = db.ListField(db.StringField())
    response_types = db.ListField(db.StringField())

    confidential = db.BooleanField(default=False)
    internal = db.BooleanField(default=False)

    meta = {
        'collection': 'oauth2_client'
    }

    def get_client_id(self):
        return str(self.client_id)

    @property
    def client_secret(self):
        return self.secret

    @property
    def default_redirect_uri(self):
        return self.redirect_uris[0]

    def get_default_redirect_uri(self):
        return self.default_redirect_uri

    def get_allowed_scope(self, scope):
        if not scope:
            return ''

        allowed = set(scope_to_list(self.scope))

        return list_to_scope([s for s in scope.split() if s in allowed])

    def check_redirect_uri(self, redirect_uri):
        return redirect_uri in self.redirect_uris

    def check_client_secret(self, client_secret):
        return self.secret == client_secret

    def check_token_endpoint_auth_method(self, method):
        if not self.has_client_secret():
            return method == 'none'
            
        return method in ('client_secret_post', 'client_secret_basic')

    def check_response_type(self, response_type):
        return True

    def check_grant_type(self, grant_type):
        return True

    def check_requested_scope(self, scope):
        allowed = set(self.scope)
        return allowed.issuperset(set(scope))

    def has_client_secret(self):
        return bool(self.secret)
