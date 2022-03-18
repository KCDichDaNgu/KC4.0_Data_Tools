from database.models.data_field import DataField
from database.models.user import User

class DataFieldSeeder():

    def __init__(self):

        pass

    @classmethod
    def run(cls):

        DataField.objects.delete()

        admin = User.objects(roles__all=['admin']).first()

        data_fields = []

        data_fields.append(
            {
                "name": "Chung",
                "creator_id": admin.id
            }
        )

        data_field_instances = [DataField(**data_field_data) for data_field_data in data_fields]

        DataField.objects.insert(data_field_instances)

        print('Fake data fields added!')
