from database.models.user import User
from flask_seeder import Seeder

class UserSeeder(Seeder):

    def __init__(self, db=None):
        
        super().__init__(db=db)
        
        self.priority = 1

    def run(self):
        
        User.objects.delete()

        users = []

        users.append(
            {
                "username": "admin",
                "email": "admin@gmail.com"
                "role": [ "admin" ],
                "password": '12345678',
                "first_name": "admin#firstname",
                "last_name": "admin#lastname"
            }
        )

        for index in range(100):

            users.append(
                {
                    "username": "user_{}".format(index),
                    "email": "user_{}@gmail.com".format(index)
                    "role": [ "member" ],
                    "password": '12345678',
                    "first_name": "user_{}#firstname".format(index),
                    "last_name": "user_{}#lastname".format(index)
                }
            )

        User.objects.insert(users)

        print('Fake users added!')
