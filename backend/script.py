
from pymongo import MongoClient
import random

mongo_db = MongoClient()

db = mongo_db.tool_nhap_lieu
collection = db.domain

domainList = [
    "dantri.com.vn",
    "dtinews.vn",
    "nhandan.com.vn",
    "thanhnienews.com",
    "tuoitrenews.com",
    "vnanet.vn",
    "vnexpress.net",
    "vov.vn",
    "vtv.vn"
]


def insertDomain():
    for item in domainList:
        domain = {
            "name": item,
            "user_id": 1,
            "created_time": random.randint(1606847896, 1608835096)
        }
        collection.insert_one(domain)


insertDomain()
