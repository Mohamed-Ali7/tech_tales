"""This module contains PasswordRestToken class"""

from api.v1 import db

class PasswordResetToken(db.Model):
    """Represent a password reset token"""

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', lazy=True)
