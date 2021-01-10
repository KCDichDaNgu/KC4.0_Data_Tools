from database.models.user import User

class UserSeeder():

    def __init__(self):

        pass

    @classmethod
    def run(cls):
        
        User.objects.delete()

        users = []

        users.append(
            {
                "username": "admin",
                "email": "admin@gmail.com",
                "roles": [ "admin" ],
                "password": '12345678',
                "first_name": "admin#firstname",
                "last_name": "admin#lastname",
                "status": User.USER_STATUS['active']
            }
        )

        for index in range(100):

            users.append(
                {
                    "username": "user_{}".format(index),
                    "email": "user_{}@gmail.com".format(index),
                    "roles": [ "member" ],
                    "password": '12345678',
                    "first_name": "user_{}#firstname".format(index),
                    "last_name": "user_{}#lastname".format(index),
                    "status": User.USER_STATUS['active']
                }
            )

        for index in range(5):

            users.append(
                {
                    "username": "reviewer_{}".format(index),
                    "email": "reviewer_{}@gmail.com".format(index),
                    "roles": [ "reviewer" ],
                    "password": '12345678',
                    "first_name": "reviewer_{}#firstname".format(index),
                    "last_name": "reviewer_{}#lastname".format(index),
                    "status": User.USER_STATUS['active']
                }
            )

        user_instances = [User(**user_data) for user_data in users]

        User.objects.insert(user_instances)

        print('Fake users added!')
