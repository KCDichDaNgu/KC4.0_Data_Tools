from seeds.user import UserSeeder
from seeds.oauth2 import Oauth2Seeder
from seeds.domain import DomainSeeder
from seeds.para_sentence import ParaSentenceSeeder

from database.db import init_for_migrate

if __name__ == '__main__':

    init_for_migrate()

    UserSeeder.run()

    DomainSeeder.run()

    ParaSentenceSeeder.run()

    Oauth2Seeder.run()
