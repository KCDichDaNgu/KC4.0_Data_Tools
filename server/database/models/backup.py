import time
from blinker import Signal

from database.db import db
from database.models.user import User
from constants.common import STATUS_CODES, BACKUP_USER_DIR, BACKUP_SERVER_DIR

import subprocess
import os

from mongoengine.signals import pre_save, post_save, post_delete

def create_backup(name='auto-backup', user_id=None, type='by_server'):
    created_at = time.time()

    if type == Backup.BACKUP_TYPES['by_server']:
        backup = Backup(
            name=name,
            type=Backup.BACKUP_TYPES['by_server'],
            hash_name=str(created_at),
            created_at=created_at
        )
        backup.save()

        # find old backups and delete
        # make sure new backup was created
        backup_path = f"{BACKUP_SERVER_DIR}/{backup.hash_name}"
        if not backup_path.endswith(".gz"):
            backup_path = backup_path + ".gz"

        if os.path.isfile(backup_path):
            old_backups = Backup.objects.filter(__raw__={
                'type': Backup.BACKUP_TYPES['by_server'],
                'created_at': {
                    '$lt': created_at
                }
            })
            old_backups.delete()
        else:
            print('file not created!!!')
    else:
        
        backup = Backup(
            name=name,
            type=Backup.BACKUP_TYPES[type],
            creator_id=user_id,
            hash_name=str(created_at),
            created_at=created_at
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
    after_delete = Signal()

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
        if not document.hash_name.endswith(".gz"):
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

    @classmethod
    def post_delete(cls, sender, document, **kwargs):
        if document.creator_id is None:
            backup_dir = BACKUP_SERVER_DIR
        else:
            backup_dir = BACKUP_USER_DIR

        backup_path = f"{backup_dir}/{document.hash_name}"

        os.remove(backup_path)

        cls.after_delete.send(document)

pre_save.connect(Backup.pre_save, sender=Backup)
post_delete.connect(Backup.post_delete, sender=Backup)
