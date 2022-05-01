import unittest
import requests
import json

class TestAdmin(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestAdmin, self).__init__(*args, **kwargs)
        url="http://localhost:6011/api/admin/user/search"
        headers = { "Authorization": "Bearer y51VxtFNvnfA0sTm2mMUsyZTFL4HwOFeM0f5rMW1Ka" }
        data = { 
            "email": "", 
            "extraData": {
                "assignment": 1
            },
            "pagination__page": 1,
            "pagination__perPage": 5,
            "username": ""
        }
        self.url = url
        self.headers = headers
        self.data = data

    def test_get_admin_status(self):
        response = requests.post(self.url, headers=self.headers, json=self.data)
        self.assertEqual(response.status_code, 200)

    def test_get_admin_message(self):
        response = requests.post(self.url, headers=self.headers, json=self.data)
        response_dict = json.loads(response.text)
        self.assertEqual(response_dict["message"], "success")


if __name__ == '__main__':
    unittest.main(verbosity=2)