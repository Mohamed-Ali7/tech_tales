from api.v1 import db

class TokenBlacklist(db.Model):
    """
    Represents a black list that contains all the
    jti(s) of logged out users (jti is a unique identifer for each token)
    """

    __tablename__ = "token_blacklist"

    id = db.Column(db.Integer(), primary_key=True)
    jti = db.Column(db.String(100), nullable=False)

    def __init__(self, jti):
        self.jti = jti
