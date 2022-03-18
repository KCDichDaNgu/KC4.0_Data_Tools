import pymongo
from pymongo import UpdateMany

import time

if __name__ == "__main__":
    
    client = pymongo.MongoClient("localhost", 27017)

    db = client['data-tool']

    for item in db.my_collection.find():

        print(item)
