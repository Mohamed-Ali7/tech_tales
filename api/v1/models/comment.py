from datetime import datetime
from api.v1 import db
from api.v1.models.base_model import BaseModel


class Comment(db.Model, BaseModel):
    """Represents a comment"""

    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_name = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    public_user_id = db.Column(db.String(128), nullable=False)
    post_id =  db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
