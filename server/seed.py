from database.models.user import User

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
