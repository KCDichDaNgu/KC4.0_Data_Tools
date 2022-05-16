import unittest
import requests
import json
from server.utils.env import read_env_files

class TestPairOfText(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestPairOfText, self).__init__(*args, **kwargs)
        env_dict = read_env_files()

        url="http://localhost:6011/api/document"
        headers = { "Authorization": "Bearer " + env_dict['BEAR_TOKEN'] }
        params = { "rating": "all", "lang1": "vi", "page": 1 }
        self.url = url
        self.headers = headers
        self.params = params

    def test_get_document_status(self):
        response = requests.get(self.url, params=self.params, headers=self.headers)
        self.assertEqual(response.status_code, 200)

    def test_get_document_message(self):
        response = requests.get(self.url, params=self.params, headers=self.headers)
        response_dict = json.loads(response.text)
        self.assertEqual(response_dict["message"], "success")


if __name__ == '__main__':
    unittest.main(verbosity=2)