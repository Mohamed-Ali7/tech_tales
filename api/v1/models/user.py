from datetime import datetime
from api.v1 import db
from api.v1.models.base_model import BaseModel


class User(db.Model, BaseModel):
    """Rerpresents a user"""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(128), nullable=False, unique=True)
    email = db.Column(db.String(128), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(128), nullable=True)
    last_name = db.Column(db.String(128), nullable=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    admin = db.Column(db.Boolean, default=False)
    token_issue_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
