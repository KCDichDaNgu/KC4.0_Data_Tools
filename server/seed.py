from database.models.user import User
from database.models.oauth2_client import OAuth2Client

from database.db import init_for_migrate

if __name__ == '__main__':

    init_for_migrate()

    admin = User(**{
        "username": "admin",
        "email": "admin@gmail.com",
        "roles": [ "admin" ],
        "password": '12345678',
        "first_name": "admin#firstname",
        "last_name": "admin#lastname",
        "status": User.USER_STATUS['active']
    })    

    admin.save()

    print('Admin added!')

    client = OAuth2Client.objects.create(
        name='auth',
        owner=admin,
        grant_types=[
            'password',
            'refresh_token',
            # 'authorization_code'
        ],
        scope='profile',
        response_types=['code'],
        redirect_uris=[
            'http://example.com'
        ],
        client_id='12345678',
        secret='12345678'
    )

    client.save()
    
    print('Oauth2 client added!')
