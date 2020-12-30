
# setup environment
conda create -p .env/ python=3.7
pip install -r requirements.txt

# import data oauth
psql -U postgres gene < data-tool-nhaplieu.pgsql

# import data sentences
python para_sentence_insert_script.py

# run backend
export FLASK_CONFIG=development
invoke app.run
