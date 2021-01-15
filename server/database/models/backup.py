import time
from blinker import Signal

from database.db import db
from database.models.user import User
from constants.common import STATUS_CODES, BACKUP_USER_DIR, BACKUP_SERVER_DIR

import subprocess
import os

from mongoengine.signals import pre_save, post_save

def create_backup(name='auto-backup', user_id=None, type='by_server'):
    backup = Backup(
        name=name,
        type=Backup.BACKUP_TYPES[type],
        creator_id=user_id,
        hash_name=str(time.time())
    )
    backup.save()
    return backup

class Backup(db.Document):
    BACKUP_TYPES = {
        "by_server": "by_server",
        "by_user": "by_user"
    }

    name = db.StringField()
    type = db.StringField(
        choices=BACKUP_TYPES.values()
    )
    creator_id = db.ReferenceField(User)
    hash_name = db.StringField()
    created_at = db.FloatField(default=time.time(), required=True)

    before_save = Signal()

    @property
    def serialize(self):
        
        return {
           'id': str(self.id),
           'name': self.name,
           'type': self.type,
           'creator': {
               'id': str(self.creator_id.id) if self.creator_id is not None else None,
               'username': self.creator_id.username if self.creator_id is not None else None
           },
           'hash_name': self.hash_name,
           'created_at': self.created_at
        }

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        document.hash_name = f"{document.hash_name}.gz" # add extension

        if document.creator_id is None:
            backup_dir = BACKUP_SERVER_DIR
        else:
            backup_dir = BACKUP_USER_DIR

        if not os.path.isdir(backup_dir):
            os.makedirs(backup_dir)

        command = ['mongodump', '--db=data-tool', '--gzip',
            f'--archive={backup_dir}/{document.hash_name}']
        result = subprocess.run(
            command, 
            # stdout=subprocess.PIPE, 
            # stderr=subprocess.PIPE
        )
        print(result)
        
        document.create_at = time.time()

        cls.before_save.send(document)

pre_save.connect(Backup.pre_save, sender=Backup)
