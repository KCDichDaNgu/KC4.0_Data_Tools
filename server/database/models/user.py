from ..db import db 
from passlib.hash import bcrypt

import enum

class UserRole(enum.Enum):
    ADMIN = 'admin'
    MEMBER = 'member'

class User(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    role = db.Column(
        db.Enum(
            UserRole, 
            values_callable=lambda obj: [e.value for e in obj]
        ),
        nullable=False,
        default=UserRole.MEMBER.value,
        server_default=UserRole.MEMBER.value
    )

    username = db.Column(db.String(40), unique=True)
    encrypted_password = db.Column(db.String(300), nullable=False)

    def __init__(self, username, password, role):
        self.username = username
        self.role = role
        self.encrypted_password = bcrypt.encrypt(password)

    def validate_password(self, password):
        return bcrypt.verify(password, self.encrypted_password)

    def __str__(self):
        return self.username

    def get_user_id(self):
        return self.id

    def has_role(self, role_name):
        return self.role.value == role_name

    @property
    def serialize(self):
        
        return {
           'id': self.id,
           'role': self.role.value,
           'username': self.username
        }
