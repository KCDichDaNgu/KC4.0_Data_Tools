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
                "last_name": "admin#lastname"
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
                    "last_name": "user_{}#lastname".format(index)
                }
            )

        user_instances = [User(**user_data) for user_data in users]

        User.objects.insert(user_instances)

        print('Fake users added!')
