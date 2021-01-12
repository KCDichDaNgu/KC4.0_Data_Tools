from authlib.integrations.flask_oauth2 import (
    AuthorizationServer,
    ResourceProtector,
)

from authlib.integrations.sqla_oauth2 import (
    create_query_client_func,
    create_save_token_func,
    create_revocation_endpoint,
    create_bearer_token_validator,
)

from authlib.oauth2.rfc6749 import grants, ClientMixin
from authlib.oauth2.rfc7636 import CodeChallenge
from authlib.oauth2.rfc6750 import BearerTokenValidator
from authlib.oauth2.rfc7009 import RevocationEndpoint

from database.models import (
    User, 
    OAuth2Client, 
    OAuth2Code, 
    OAuth2Token 
) 

from bson import ObjectId, DBRef

from database.db import db

from functools import wraps
from authlib.integrations.flask_oauth2 import current_token

GRANT_EXPIRATION = 100  # 100 seconds

authorization = AuthorizationServer()

require_oauth = ResourceProtector()

class AuthorizationCodeGrant(grants.AuthorizationCodeGrant):

    TOKEN_ENDPOINT_AUTH_METHODS = [
        'client_secret_basic',
        'client_secret_post'
    ]

    def save_authorization_code(self, code, request):
        code_challenge = request.data.get('code_challenge')
        code_challenge_method = request.data.get('code_challenge_method')

        expires = datetime.utcnow() + timedelta(seconds=GRANT_EXPIRATION)

        auth_code = OAuth2Code.objects.create(
            code=code,
            client_id=request.client.client_id,
            redirect_uri=request.redirect_uri,
            scope=request.scope,
            user=ObjectId(request.user.id),
            code_challenge=code_challenge,
            code_challenge_method=code_challenge_method,
            expires=expires,
        )
        return auth_code

    def query_authorization_code(self, code, client):
        auth_code = OAuth2Code.objects(
            code=code, 
            client_id=client_id
        ).first()

        if auth_code and not auth_code.is_expired():
            return auth_code

    def delete_authorization_code(self, authorization_code):
        authorization_code.delete()

    def authenticate_user(self, authorization_code):
        return authorization_code.user


class PasswordGrant(grants.ResourceOwnerPasswordCredentialsGrant):

    TOKEN_ENDPOINT_AUTH_METHODS = [
       'none', 'client_secret_basic', 'client_secret_post'
    ]

    def authenticate_user(self, username, password):
        user = User.objects(username=username).first()

        if user is not None and user.validate_password(password):
            return user


class RefreshTokenGrant(grants.RefreshTokenGrant):

    def authenticate_refresh_token(self, refresh_token):
        item = OAuth2Token.objects(refresh_token=refresh_token).first()

        if item and item.is_refresh_token_valid():
            return item

    def authenticate_user(self, credential):
        return credential.user

    def revoke_old_credential(self, credential):
        credential.revoked = True
        credential.save()


class RevokeToken(RevocationEndpoint):

    def query_token(self, token, token_type_hint, client):
        qs = OAuth2Token.objects(client_id=client.client_id)

        if token_type_hint == 'access_token':
            return qs.filter(access_token=token).first()
        elif token_type_hint == 'refresh_token':
            return qs.filter(refresh_token=token).first()
        else:
            qs = qs(db.Q(access_token=token) | db.Q(refresh_token=token))
            return qs.first()

    def revoke_token(self, token):
        token.revoked = True
        token.save()

class BearerToken(BearerTokenValidator):

    def authenticate_token(self, token_string):
        return OAuth2Token.objects(access_token=token_string).first()

    def request_invalid(self, request):
        return False

    def token_revoked(self, token):
        return token.revoked



def query_client(client_id):
    '''Fetch client by ID'''
    return OAuth2Client.objects(client_id=client_id).first()


def save_token(token, request):
    scope = token.pop('scope', '')

    if request.grant_type == 'refresh_token':
        credential = request.credential
        credential.update(scope=scope, **token)
    else:
        client = request.client
        user = request.user or client.owner
        OAuth2Token.objects.create(
            client_id=client.client_id,
            user=user.id,
            scope=scope,
            **token
        )

def status_required(status_name):
    def decorator(f):
        @wraps(f)

        def authorize(*args, **kwargs):

            with require_oauth.acquire() as token:
                
                if not token.user.has_status(status_name):
                    abort(401) # not authorized

            return f(*args, **kwargs)

        return authorize

    return decorator

def role_required(roles_name):
    def decorator(f):
        @wraps(f)

        def authorize(*args, **kwargs):

            with require_oauth.acquire() as token:
                
                if not token.user.has_role(roles_name):
                    abort(401) # not authorized

            return f(*args, **kwargs)

        return authorize

    return decorator


def check_credentials():
    try:
        with require_oauth.acquire() as token:
            login_user(token.user)
        return True
    except (Unauthorized, AuthlibFlaskException):
        return False

def config_oauth(app):

    authorization.init_app(
        app, 
        query_client=query_client, 
        save_token=save_token
    )

    # support all grants
    authorization.register_grant(AuthorizationCodeGrant, [CodeChallenge(required=True)])
    authorization.register_grant(PasswordGrant)
    authorization.register_grant(RefreshTokenGrant)
    authorization.register_grant(grants.ClientCredentialsGrant)

    # support revocation endpoint
    authorization.register_endpoint(RevokeToken)

    require_oauth.register_token_validator(BearerToken())
    
