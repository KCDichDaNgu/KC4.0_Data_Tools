from database.models.para_sentence import ParaSentence

class ParaSentenceSeeder():

    def __init__(self):

        pass

    @classmethod
    def run(cls):

        ParaSentence.objects.delete()

        print('Fake para sentences added!')
