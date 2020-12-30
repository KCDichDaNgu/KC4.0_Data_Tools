from database.models.oauth2_client import OAuth2Client
from flask_seeder import Seeder
from database.models.user import User 
import time

def split_by_crlf(s):
    return [v for v in s.splitlines() if v]

class ClientSeeder(Seeder):

    def __init__(self, db=None):
        
        super().__init__(db=db)

        self.priority = 2

    def run(self):

        admin = User.objects(role__in='admin').first()

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
            response_types=response_types,
            redirect_uris=[
                'http://example.com'
            ],
            secret='12345678'
        )

        print('Fake client added!')
