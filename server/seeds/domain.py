from database.models.domain import Domain

class DomainSeeder():

    def __init__(self):

        pass

    @classmethod
    def run(cls):

        Domain.objects.delete()

        print('Fake domains added!')
