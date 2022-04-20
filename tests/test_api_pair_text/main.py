

from email import header
from urllib import response
import requests
import json
import unittest2
import os

class TestAPIPairText(unittest2.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestAPIPairText, self).__init__(*args, **kwargs)
        self.host_url = "http://localhost:3005/document"
        self.header = {  "X-Powered-By": "Express", 
            "Accept-Ranges": "bytes",
            "Content-Type": "application/json; charset=UTF-8",
            "Vary": "Accept-Encoding",
            "Content-Encoding": "gzip",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked"}
        self.response = requests.get(self.host_url)

    def test_response_status_code(self):
        self.assertEqual(self.response.status_code, 200, "Faild to connecet url:".format(self.host_url))
        print("Ok")
    
    def test_header_of_response(self):
        self.assertEqual(self.response.headers.get("Content-Type"), "application/json", 
        "Content Type Error")
    

if __name__ == "__name__":
    unittest2.main(verbosity=2)