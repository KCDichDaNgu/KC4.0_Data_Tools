from seeds.user import UserSeeder
from seeds.client import ClientSeeder

from database.db import init_for_migrate

if __name__ == '__main__':

    init_for_migrate()

    UserSeeder.run()

    ClientSeeder.run()
