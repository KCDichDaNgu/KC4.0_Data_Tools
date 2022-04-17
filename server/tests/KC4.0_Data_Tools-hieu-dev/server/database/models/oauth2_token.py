from ..db import db 
from datetime import datetime, timedelta

TOKEN_EXPIRATION = 30 * 24 * 60 * 60  # 30 days in seconds
REFRESH_EXPIRATION = 30  # days
EPOCH = datetime.fromtimestamp(0)

TOKEN_TYPES = {
    'Bearer': 'Bearer',
}

class OAuth2Token(db.Document):
    client_id = db.StringField(required=True)
    user = db.ReferenceField('User')

    # currently only bearer is supported
    token_type = db.StringField(choices=list(TOKEN_TYPES), default='Bearer')

    access_token = db.StringField(unique=True)
    refresh_token = db.StringField(unique=True, sparse=True)
    created_at = db.DateTimeField(default=datetime.utcnow, required=True)
    expires_in = db.IntField(required=True, default=TOKEN_EXPIRATION)
    scope = db.StringField(default='')
    revoked = db.BooleanField(default=False)

    meta = {
        'collection': 'oauth2_token'
    }

    def __str__(self):
        return '<OAuth2Token({0.client_id})>'.format(self)

    def get_scope(self):
        return self.scope

    def get_expires_in(self):
        return self.expires_in

    def get_expires_at(self):
        return (self.created_at - EPOCH).total_seconds() + self.expires_in

    def is_refresh_token_valid(self):
        if self.revoked:
            return False
        expired_at = datetime.fromtimestamp(self.get_expires_at())
        expired_at += timedelta(days=REFRESH_EXPIRATION)
        return expired_at > datetime.utcnow()
