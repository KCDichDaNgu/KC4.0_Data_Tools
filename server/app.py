import os
from flask import Flask, jsonify
from database.db import db
from oauth2 import config_oauth

from api.client.views import client_bp
from api.auth.views import auth_bp
from api.ml_model.views import ml_model_bp
from api.content.views import content_bp
from api.admin.content.views import content_bp as admin_content_bp

import argparse

import json
import torch
from decouple import config

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from flask_seeder import FlaskSeeder
from flask_cors import CORS

os.environ['AUTHLIB_INSECURE_TRANSPORT'] = 'true'

migrate = None


def create_app(
    device='cpu',
    model_path='gpt2',
    SECRET_KEY='secret',
    OAUTH2_REFRESH_TOKEN_GENERATOR=True,
    SQLALCHEMY_TRACK_MODIFICATIONS=False
):
    app = Flask(
        __name__,
        static_url_path='',
        static_folder='public'
    )

    CORS(app)

    # load default configuration
    app.config.from_object('config')

    # load environment configuration
    if 'WEBSITE_CONF' in os.environ:
        app.config.from_envvar('WEBSITE_CONF')

    if torch.cuda.is_available() and device != 'cpu':
        app.config['device'] = device
    else:
        app.config['device'] = 'cpu'

    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['OAUTH2_REFRESH_TOKEN_GENERATOR'] = OAUTH2_REFRESH_TOKEN_GENERATOR
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{}:{}@{}:{}/{}'.format(
        config('DB_USER'),
        config('DB_PASSWORD'),
        config('DB_HOST'),
        config('DB_PORT'),
        config('DB_NAME'),
    )

    setup_app(app)

    return app


def setup_app(app):
    # Create tables if they do not exist already
    @app.before_first_request
    def create_tables():
        db.create_all()

    db.init_app(app)

    seeder = FlaskSeeder()
    seeder.init_app(app, db)

    config_oauth(app)

    migrate = Migrate(app, db)

    app.register_blueprint(client_bp, url_prefix='/client')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(ml_model_bp, url_prefix='/api')
    app.register_blueprint(content_bp, url_prefix='/api')
    app.register_blueprint(admin_content_bp, url_prefix='/api/admin/content')

    @app.route('/<path:filename>')  
    
    def send_file(filename):  
        return send_from_directory(app.static_folder, filename)


# parser = argparse.ArgumentParser()

# parser.add_argument(
#     '--model_path',
#     type=str,
#     default='gpt2',
#     help='Name of folder that contains checkpoint of text generation model'
# )

# parser.add_argument(
#     '--device',
#     type=str,
#     default='cpu',
#     help='cpu or cuda...'
# )

# parser.add_argument(
#     '--debug',
#     type=bool,
#     default=False,
#     help='Debug type'
# )

# parser.add_argument(
#     '--port',
#     type=str,
#     default='6011',
#     help='Port server'
# )

# args = parser.parse_args()

# model_path = args.model_path

# debug = args.debug

# device = args.device
model_path = 'gpt2'
device = 'cpu'

app = create_app(
    model_path=model_path,
    device=device,
    SECRET_KEY='secret',
    OAUTH2_REFRESH_TOKEN_GENERATOR=True,
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)


def success_handle(code, error_message,  status, mimetype='application/json'):
    # return Response(json.dumps({"code": code, "message": error_message, "status": status}), mimetype=mimetype)
    return jsonify(code=code, message=error_message, status=status)


@app.route('/api', methods=['GET'])
def homepage():
    print('ahihihihi', flush=True)
    return success_handle(1, "OK", "OK")


if __name__ == '__main__':

    app.run(
        host='0.0.0.0',
        port=6011
        # debug=debug
    )
