from database.models.para_document import ParaDocument, NewestParaDocument, OriginalParaDocument, ParaDocumentText
from api.document.utils import hash_para_document
from database.models.user import User
from database.models.data_field import DataField
from faker import Faker
import random
import time

class ParaDocumentSeeder():

    def __init__(self):

        pass

    @classmethod
    def run(cls):

        ParaDocument.objects.delete()

        fake = Faker()

        user = User.objects(username="admin").first()
        creator_id = user.id

        data_field = DataField.objects(name="Chung").first()

        for i in range(20):
            text1 = fake.text()
            text2 = fake.text()
            lang1 = "vi"
            lang2 = "km"
            score = random.uniform(0, 1)

            hash = hash_para_document(text1, text2, lang1, lang2)

            para_document = ParaDocument(
                newest_para_document=NewestParaDocument(
                    text1=ParaDocumentText(
                        content=text1,
                        lang=lang1
                    ),
                    text2=ParaDocumentText(
                        content=text2,
                        lang=lang2
                    ),
                    hash_content=hash
                ),
                original_para_document=OriginalParaDocument(
                    text1=ParaDocumentText(
                        content=text1,
                        lang=lang1
                    ),
                    text2=ParaDocumentText(
                        content=text2,
                        lang=lang2
                    ),
                    hash_content=hash
                ),
                score={ "docAlign": float(score) },
                creator_id=creator_id,
                data_field_id=data_field.id,
                created_at=time.time(),
                updated_at=time.time()
            )

            para_document.save()

        print('Fake para documents added!')
