from database.models.setting import Setting, DEFAULT_SETTING_CONTENT

class SettingSeeder():

    def __init__(self):

        pass

    @classmethod
    def run(cls):

        Setting.objects.delete()

        setting = Setting(
            content={
                'min_words_of_vietnamese_sentence': DEFAULT_SETTING_CONTENT['min_words_of_vietnamese_sentence']
            }
        )

        setting.save()

        print('Fake domains added!')
