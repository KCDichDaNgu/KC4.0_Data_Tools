from functools import wraps
from authlib.integrations.flask_oauth2 import current_token

def role_required(role_name):
    def decorator(f):
        @wraps(f)

        def authorize(*args, **kwargs):
            
            if not current_token.user.has_role(role_name):
                abort(401) # not authorized

            return f(*args, **kwargs)

        return authorize

    return decorator
