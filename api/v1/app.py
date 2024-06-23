"""This module runs the flask app"""

from datetime import datetime
from api.v1 import app, jwt
from api.v1 import error_handler
from api.v1.models.token_black_list import TokenBlacklist
from api.v1.models.user import User
from flask import abort, g


@jwt.token_in_blocklist_loader
def tokens_blocklist(jwt_header, jwt_data):
    """
    Loader function called before each request
    to check if the JWT token is blockked
    """

    jti = jwt_data.get('jti')
    identity = jwt_data.get('sub')
    token_issue_time = datetime.fromisoformat(jwt_data.get('issued_at'))

    user = User.query.filter_by(email=identity).first()
    
    if not user:
        abort(404, 'This user does not exist')

    g.current_user = user

    token = TokenBlacklist.query.filter_by(jti=jti).first()

    if token or token_issue_time != user.token_issue_time:
        return True
    
    return False

if __name__ == "__main__":
    app.run(debug=True)
