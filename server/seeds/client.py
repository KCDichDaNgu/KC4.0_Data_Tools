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

        admin = User.query.filter_by(role='admin').first()

        OAuth2Client.query.delete()

        client_id = '12345678'
        client_id_issued_at = int(time.time())

        client = OAuth2Client(
            client_id=client_id,
            client_id_issued_at=client_id_issued_at,
            user_id=admin.id,
        )

        client_metadata = {
            "client_name": 'auth',
            "client_uri": 'http://example.com',
            "grant_types": [
                'password',
                'refresh_token'
            ],
            "redirect_uris": [
                'http://example.com'
            ],
            "scope": 'profile',
            "token_endpoint_auth_method": 'client_secret_basic'
        }

        client.set_client_metadata(client_metadata)

        if client_metadata['token_endpoint_auth_method'] == 'none':
            client.client_secret = ''
        else:
            client.client_secret = '12345678'

        self.db.session.add(client)
        self.db.session.commit()

        print('Fake client added!')
