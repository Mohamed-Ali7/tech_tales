from datetime import datetime
from api.v1 import db
from api.v1.models.base_model import BaseModel


class Post(db.Model, BaseModel):
    """Represents a user's post"""

    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comments = db.relationship('Comment', backref='post',
                               cascade='all, delete-orphan', lazy=True)
