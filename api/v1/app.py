"""This module runs the flask app"""

from api.v1 import app, jwt
from api.v1 import error_handler
from api.v1.models.token_black_list import TokenBlacklist


@jwt.token_in_blocklist_loader
def tokens_blocklist(jwt_header, jwt_data):
    """
    Loader function called before each request
    to check if the JWT token is blockked
    """

    jti = jwt_data.get('jti')

    token = TokenBlacklist.query.filter_by(jti=jti).first()

    if token:
        return True
    
    return False

if __name__ == "__main__":
    app.run(debug=True)
