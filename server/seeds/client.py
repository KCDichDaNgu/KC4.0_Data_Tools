from database.models.oauth2_client import OAuth2Client

from database.models.user import User 
import time

def split_by_crlf(s):
    return [v for v in s.splitlines() if v]

class ClientSeeder():

    def __init__(self):
        
        pass

    @classmethod
    def run(cls):
        
        admin = User.objects(roles__all=['admin']).first()
        
        OAuth2Client.objects.delete()

        client_name = 'auth'
        client_id = '12345678'
        client_id_issued_at = int(time.time())

        client = OAuth2Client.objects.create(
            name=client_name,
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
            secret='12345678'
        )

        print('Fake client added!')
