import unittest
import requests
import json

class TestPairOfSentences(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestPairOfSentences, self).__init__(*args, **kwargs)
        url="http://localhost:6011/api/para-sentence"
        headers = { "Authorization": "Bearer y51VxtFNvnfA0sTm2mMUsyZTFL4HwOFeM0f5rMW1Ka" }
        params = { "rating": "all", "lang1": "vi", "page": 1 }
        self.url = url
        self.headers = headers
        self.params = params

    def test_get_para_sentence_status(self):
        response = requests.get(self.url, params=self.params, headers=self.headers)
        self.assertEqual(response.status_code, 200)
    
    def test_get_para_sentence_message(self):
        response = requests.get(self.url, params=self.params, headers=self.headers)
        response_dict = json.loads(response.text)
        self.assertEqual(response_dict["message"], "success")


if __name__ == '__main__':
    unittest.main(verbosity=2)