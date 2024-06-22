"""This module initializes the Application when it starts for the first time"""

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask import Flask
from flask_cors import CORS


app = Flask(__name__)

cors = CORS(app, resources={r"/api/v1/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqldb://{}:{}@{}/{}'.format(
    "tech_dev", "12345678", "localhost:3306", "tech_tales_dev_db"
)
app.config['JWT_SECRET_KEY'] = 'ff08f3430ce7b694e8fc7f7867453f7e'
app.config['SQLALCHEMY_ECHO'] = True

db = SQLAlchemy(app)
app.app_context().push()

jwt = JWTManager(app)

from api.v1.routes.auth import auth
from api.v1.routes.users import users
from api.v1.routes.posts import posts
app.register_blueprint(auth)
app.register_blueprint(users)
app.register_blueprint(posts)

# importing the User class so the sqlalchemy can see it and create a table for it
from api.v1.models.user import User
from api.v1.models.token_black_list import TokenBlacklist
from api.v1.models.post import Post

db.create_all()
