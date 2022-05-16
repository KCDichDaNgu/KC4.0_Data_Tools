import unittest
import requests
import json
from utils.env import read_env_files

class TestPairOfSentencesStatistics(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestPairOfSentencesStatistics, self).__init__(*args, **kwargs)
        env_dict = read_env_files()

        url="http://localhost:6011/api/report/unrated-count"
        headers = { "Authorization": "Bearer " + env_dict['BEAR_TOKEN'] }
        self.url = url
        self.headers = headers

    def test_get_para_sentence_statistics_status(self):
        response = requests.get(self.url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
    
    def test_get_para_sentence_statistics_message(self):
        response = requests.get(self.url, headers=self.headers)
        response_dict = json.loads(response.text)
        self.assertEqual(response_dict["message"], "success")

    def test_get_para_sentence_statistics_lao_language(self):
        response = requests.get(self.url, headers=self.headers)
        response_dict = json.loads(response.text)
        self.assertEqual(response_dict["data"]["lo"], 8)


if __name__ == '__main__':
    unittest.main(verbosity=2)