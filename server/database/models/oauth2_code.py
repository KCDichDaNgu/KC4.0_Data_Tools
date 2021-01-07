from ..db import db 

class OAuth2Code(db.Document):
    user = db.ReferenceField('User', required=True)
    client_id = db.StringField(required=True)

    code = db.StringField(required=True)

    redirect_uri = db.StringField()
    expires = db.DateTimeField()

    scope = db.StringField(default='')
    code_challenge = db.StringField()
    code_challenge_method = db.StringField()

    meta = {
        'collection': 'oauth2_code'
    }

    def __str__(self):
        return '<OAuth2Code({0.client.name}, {0.user.fullname})>'.format(self)

    def is_expired(self):
        return self.expires < datetime.utcnow()

    def get_redirect_uri(self):
        return self.redirect_uri

    def get_scope(self):
        return self.scope
