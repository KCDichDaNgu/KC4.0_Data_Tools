import requests
import json
import unittest2
import os
# nhom 15
def read(URL):
    response = requests.get(URL, stream= True)
    if response.status_code != 200:
        try:
            response.raise_for_status()
        except requests.HTTPError as exception:
            return None, response.status_code, exception
    return response, response.status_code, "OK"
class TestAPIPairText(unittest2.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestAPIPairText, self).__init__(*args, **kwargs)
        self.host_url = "http://localhost:3005/sentence"
        self.response = requests.get(self.host_url)

    def test_response_status_code(self):
        self.assertEqual(self.response.status_code, 200, "Faild to connecet url:".format(self.host_url))

    def test_header_of_response(self):
        self.assertEqual(self.response.headers.get("Content-Type"), "application/json", 
        "Content Type Error")

    def test_valid_requests(self):
        url = "http://localhost:3005/sentence"
        response, status_code, message = read(url)
        self.assertEqual(status_code, 404, "Faild at status code")
        self.assertEqual(str(message), "404 Client Error: Not Found for url: {}".format(url), "Message error")

if __name__ == "__name__":
    unittest2.main(verbosity=2) 