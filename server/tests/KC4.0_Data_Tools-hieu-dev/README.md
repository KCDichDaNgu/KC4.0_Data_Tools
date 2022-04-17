# Các gói cần cài đặt
* MongoDB
* virtualenv
* Nodejs

# Cài đặt
1. cd /data-tool
2. virtualenv ./.env
3. source ./.env/bin/activate
4. pip install -r requirements.txt
5. cd ./client
6. npm i + npm start
7. cd ./server
8. sudo systemctl start mongod
9. python seed_for_demo.py
10. python app.py
