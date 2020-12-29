from database.models.user import User
from flask_seeder import Seeder

class UserSeeder(Seeder):

    def __init__(self, db=None):
        
        super().__init__(db=db)

        self.priority = 1

    def run(self):

        User.query.delete()

        users = []

        users.append(
            User(
                username="admin",
                role="admin",
                password='12345678'
            )
        )

        for index in range(100):

            users.append(
                User(
                    username="user_{}".format(index),
                    role="member",
                    password='12345678'
                )
            )

        self.db.session.bulk_save_objects(users)

        print('Fake users added!')
