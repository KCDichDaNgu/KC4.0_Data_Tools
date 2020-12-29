from ..db import db 
from .user import User
import datetime
import pandas as pd
import os, shutil
from flask import current_app, send_from_directory

def delete_all_old_files(folder):

    for filename in os.listdir(folder):

        file_path = os.path.join(folder, filename)

        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))

class UserContent(db.Model):

    __tablename__ = 'user_content'

    id = db.Column(db.Integer, primary_key=True)
    
    creator_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.id', ondelete='CASCADE')
    )

    creator = db.relationship('User')

    content = db.Column(db.JSON, nullable=False)

    model_name = db.Column(db.Text)
    
    created_at = db.Column(
        db.DateTime, 
        default=datetime.datetime.utcnow, 
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime, 
        default=datetime.datetime.utcnow, 
        onupdate=datetime.datetime.utcnow,
        nullable=False
    )

    def dump_datetime(self, value):
        """Deserialize datetime object into string form for JSON processing."""
        if value is None:
            return None

        return [value.strftime("%Y-%m-%d"), value.strftime("%H:%M:%S")]

    @classmethod
    def get_download_link(cls, model_name):

        _file_path = ''

        _all_user_content = UserContent.query \
            .join(User, UserContent.creator_id == User.id) \
            .filter(UserContent.model_name == model_name) \
            .add_columns(
                UserContent.id,
                UserContent.model_name,
                UserContent.created_at,
                UserContent.updated_at,
                UserContent.content,
                User.username
            )\
            .all()
        
        _serialized_user_content = cls.serialize_data_by_model(model_name, _all_user_content)
        
        df = pd.DataFrame.from_dict(_serialized_user_content)

        formatted_date = datetime.datetime.now().strftime("%d-%m-%Y__%H-%M-%S")

        _file_path = '{}/all_data-{}.csv'.format(cls.get_csv_dir(model_name), formatted_date)

        if not os.path.exists(cls.get_csv_dir(model_name)):

            os.makedirs(cls.get_csv_dir(model_name))

        delete_all_old_files(cls.get_csv_dir(model_name))

        df.to_csv(_file_path, index=False)

        return 'user-content/{}/all_data-{}.csv'.format(model_name, formatted_date)

    @classmethod
    def serialize_data_by_model(cls, model_name, all_user_content = []):
        
        if model_name == 'gpt2-walmart':
            _serialized_user_content = {
                'id': [],
                'creator': [],
                'new_content': [],
                'original_content': [],
                'model_name': [],
                'created_at': [],
                'updated_at': [],
                'meta_data': [],
            }

            for _u_content in all_user_content:
            
                _serialized_user_content['id'].append(_u_content.id)
                _serialized_user_content['creator'].append(_u_content.username)
                _serialized_user_content['model_name'].append(_u_content.model_name)
                _serialized_user_content['created_at'].append(_u_content.created_at)
                _serialized_user_content['updated_at'].append(_u_content.updated_at)
                _serialized_user_content['meta_data'].append(_u_content.content)

                _content = _u_content.content

                _content.sort(key=lambda c: c.get('order'))

                _serialized_user_content['new_content'].append(' '.join(list(map(lambda c: c['new_content'] , _content))))
                _serialized_user_content['original_content'].append(' '.join(list(map(lambda c: c['original_content'] , _content))))

        elif model_name == 'paraphrase/substitute_word_by_ppdb_synonym':
            _serialized_user_content = {
                'id': [],
                'creator': [],
                'model_name': [],
                'original_content': [],
                'model_content': [],
                'is_reasonable': [],
                'user_content': [],
                'created_at': [],
                'updated_at': [],
                'meta_data': [],
            }

            for _u_content in all_user_content:
            
                _serialized_user_content['id'].append(_u_content.id)
                _serialized_user_content['creator'].append(_u_content.username)
                _serialized_user_content['model_name'].append(_u_content.model_name)
                _serialized_user_content['created_at'].append(_u_content.created_at)
                _serialized_user_content['updated_at'].append(_u_content.updated_at)
                _serialized_user_content['meta_data'].append(_u_content.content)

                _serialized_user_content['original_content'].append(_u_content.content['original_content'])
                _serialized_user_content['model_content'].append(_u_content.content['model_content'])
                _serialized_user_content['is_reasonable'].append(_u_content.content['is_reasonable'])
                _serialized_user_content['user_content'].append(_u_content.content['user_content'])

        elif model_name == 'paraphrase/rewrite_by_gpt2':
            _serialized_user_content = {
                'id': [],
                'creator': [],
                'model_name': [],
                'original_content': [],
                'model_content': [],
                'is_reasonable': [],
                'user_content': [],
                'created_at': [],
                'updated_at': [],
                'meta_data': [],
            }

            for _u_content in all_user_content:
            
                _serialized_user_content['id'].append(_u_content.id)
                _serialized_user_content['creator'].append(_u_content.username)
                _serialized_user_content['model_name'].append(_u_content.model_name)
                _serialized_user_content['created_at'].append(_u_content.created_at)
                _serialized_user_content['updated_at'].append(_u_content.updated_at)
                _serialized_user_content['meta_data'].append(_u_content.content)

                _serialized_user_content['original_content'].append(_u_content.content['original_content'])
                _serialized_user_content['model_content'].append(_u_content.content['model_content'])
                _serialized_user_content['is_reasonable'].append(_u_content.content['is_reasonable'])
                _serialized_user_content['user_content'].append(_u_content.content['user_content'])

        elif model_name == 'paraphrase/insert_word_by_contextual_word_embeddings':
            _serialized_user_content = {
                'id': [],
                'creator': [],
                'model_name': [],
                'original_content': [],
                'model_content': [],
                'is_reasonable': [],
                'user_content': [],
                'created_at': [],
                'updated_at': [],
                'meta_data': [],
            }

            for _u_content in all_user_content:
            
                _serialized_user_content['id'].append(_u_content.id)
                _serialized_user_content['creator'].append(_u_content.username)
                _serialized_user_content['model_name'].append(_u_content.model_name)
                _serialized_user_content['created_at'].append(_u_content.created_at)
                _serialized_user_content['updated_at'].append(_u_content.updated_at)
                _serialized_user_content['meta_data'].append(_u_content.content)

                _serialized_user_content['original_content'].append(_u_content.content['original_content'])
                _serialized_user_content['model_content'].append(_u_content.content['model_content'])
                _serialized_user_content['is_reasonable'].append(_u_content.content['is_reasonable'])
                _serialized_user_content['user_content'].append(_u_content.content['user_content'])

        return _serialized_user_content

    @classmethod
    def get_csv_dir(cls, model_name):
        return os.path.abspath('./public/user-content/{}'.format(model_name))

    @property
    def serialize(self):
        
        return {
           'id': self.id,
           'creator_id': self.creator_id,
           'content': self.content,
           'created_at': self.created_at,
           'updated_at': self.updated_at
        }
    