from seeds.user import UserSeeder
from seeds.oauth2 import Oauth2Seeder
from seeds.domain import DomainSeeder
from seeds.para_sentence import ParaSentenceSeeder
from seeds.data_field import DataFieldSeeder
from seeds.para_document import ParaDocumentSeeder
from seeds.setting import SettingSeeder
from utils.env import read_env_files

from database.db import init_for_migrate

from pymongo import MongoClient

env = read_env_files()

client = MongoClient(env['MONGODB_HOST'], int(env['MONGODB_PORT']))
client.drop_database(env['MONGODB_DB'])

print('Drop database successfully!')

if __name__ == '__main__':

    init_for_migrate()

    Oauth2Seeder.run()

    UserSeeder.run()

    SettingSeeder.run()

    DomainSeeder.run()

    DataFieldSeeder.run()

    ParaSentenceSeeder.run()

    ParaDocumentSeeder.run()
