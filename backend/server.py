from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restplus_patched import Api, Namespace, Resource, ModelSchema

# Extensions initialization
# =========================
app = Flask(__name__)
db = SQLAlchemy(app)
api = Api(app)


# Database table definition (SQLAlchemy)
# ======================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)


# Serialization/Deserialization schema definition
# ===============================================
class UserSchema(ModelSchema):
    class Meta:
        model = User


# "Users" resource RESTful API definitions
# ========================================
users_api = Namespace('users')
api.add_namespace(users_api)

@users_api.route('/')
class UsersList(Resource):

    @users_api.response(UserSchema(many=True))
    def get(self):
        return User.query.all()


@users_api.route('/<int:user_id>')
@users_api.resolve_object('user', lambda kwargs: User.query.get_or_404(kwargs.pop('user_id')))
class UserByID(Resource):

    @users_api.response(UserSchema())
    def get(self, user):
        return user


# Run the RESTful API server
# ==========================
if __name__ == '__main__':
    db.create_all()
    with db.session.begin(nested=True):
        db.session.add(User(name='user1'))
        db.session.add(User(name='user2'))
    app.run()