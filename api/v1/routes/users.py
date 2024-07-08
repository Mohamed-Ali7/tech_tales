"""This module handles users APIs"""

from api.v1 import db, mail, app
from api.v1.models.user import User
from api.v1.models.post import Post
from api.v1.models.password_reset_token import PasswordResetToken
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt, decode_token, create_access_token
from datetime import datetime, timedelta
from flask_bcrypt import bcrypt
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer


users = Blueprint('users', __name__, url_prefix='/api/v1')


@users.route('/users', strict_slashes=False)
@jwt_required()
def get_users():
    """Return all the registerd users"""

    if not get_jwt().get('admin'):
        abort(403, 'You are not authorized to access this resouce')

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=15, type=int)

    users = User.query.paginate(page = page, per_page=per_page)

    serialized_users = []

    for user in users:
        user = user.to_dict()
        if 'id' in user:
            del user['id']
        serialized_users.append(user)

    return jsonify({"users": serialized_users}), 200

@users.route('/users/<public_id>', strict_slashes=False)
def get_user(public_id):
    """Returns a specific user with a specific public_id"""

    user = User.query.filter_by(public_id = public_id).first()

    if not user:
        abort(404, 'This user does not exist')

    serialized_user = user.to_dict()

    if 'id' in serialized_user:
        del serialized_user['id']

    return jsonify(serialized_user), 200


@users.route('/users/<public_id>', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_user(public_id):
    """Updates a specific user with a specific public_id"""

    current_user_public_id = get_jwt().get('public_id')

    # Control access by ensuring that the current authenticated user
    # is the same user whose data will be updated
    if current_user_public_id != public_id:
        abort(403, 'You are not authorized to perform this process')

    user = User.query.filter_by(public_id = public_id).first()
    if not user:
        abort(404, 'This user does not exist')

    try:
        user_payload = request.get_json()
        if user_payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    # Control access by ensuring that the user cannot update the following data
    # Note that the changing password will have it's own API
    ignore = ['id', 'public_id', 'email', 'joined_at', 'updated_at', 'password']

    for key, value in user_payload.items():
        if key in ignore:
            continue
        setattr(user, key, value)

    user.updated_at = datetime.utcnow()

    db.session.commit()

    serialized_user = user.to_dict()

    if 'id' in serialized_user:
        del serialized_user['id']

    return jsonify(serialized_user), 200


@users.route('/users/<public_id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_user(public_id):
    """Deletes a specific user with a specific public_id"""

    current_user_public_id = get_jwt().get('public_id')
    is_admin = get_jwt().get('admin')

    # Control access by ensuring that the current authenticated user
    # is the same user will be deleted or a user that has admin privilages
    if current_user_public_id != public_id and not is_admin:
        abort(403, 'You are not authorized to perform this process')

    user = User.query.filter_by(public_id = public_id).first()
    if not user:
        abort(404, 'This user does not exist')

    db.session.delete(user)

    db.session.commit()

    return jsonify({"messege": "The user has been deleted successfully"}), 200


@users.route('/users/<public_id>/posts', strict_slashes=False)
def get_user_posts(public_id):
    """Get all the posts of a specific user"""

    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        abort(404, 'This user does not exist')

    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=3, type=int)

    user_posts = Post.query.filter_by(user_id=user.id)\
        .order_by(db.desc(Post.created_at)).paginate(page=page, per_page=per_page)

    serialized_user_posts = []

    for post in user_posts:
        post = post.to_dict()
        serialized_user_posts.append(post)

    return jsonify({"posts": serialized_user_posts}), 200


@users.route('/users/<user_public_id>/edit/password', methods=['PUT'],
             strict_slashes=False)
@jwt_required()
def change_password(user_public_id):
    """
    Changes the password of the user

    Expected data:
        old_password (srt): The current password of the user

        new_password (str): The new password that the user want to use

        confirm_new_password (str): to confirm the new password
        that the user want to use
    """

    current_user_public_id = get_jwt().get('public_id')

    # Control access by ensuring that the current authenticated user
    # is the same user will be deleted
    if current_user_public_id != user_public_id:
        abort(403, description='You are not authorized to perform this process')

    email = get_jwt().get('sub')
    user = User.query.filter_by(email = email).first()
    if not user:
        abort(404, 'This user does not exist')

    try:
        payload = request.get_json()
        if payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")
    
    if 'old_password' not in payload:
        abort(400, 'The user must provide his old password')
    if 'new_password' not in payload:
        abort(400, 'The user must provide his new password')
    if 'confirm_new_password' not in payload:
        abort(400, 'The user must confirm his new password')

    old_password = payload.get('old_password')
    new_password = payload.get('new_password')
    confirm_new_password = payload.get('confirm_new_password')

    if new_password != confirm_new_password:
        abort(400, 'The new password and confirm password do not match')

    if not bcrypt.checkpw(old_password.encode('utf-8'), user.password.encode('utf-8')):
        abort(400, 'Incorrect password')

    salt = bcrypt.gensalt()
    new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)

    user.password = new_hashed_password

    user.updated_at = datetime.utcnow()
    user.token_issue_time = datetime.utcnow()

    db.session.commit()

    return jsonify({"Success": "The password has changed successfully"})


@users.route('/users/password-reset-request', methods=['POST'], strict_slashes=False)
def password_reset_request():
    """
    This function request a password reset session
    which will return a link to the password reset form with the
    password reset token embedded in this like as a query parameter

    Expected data:
        email (str): The email of the user that wants to reset his/her password
    """

    try:
        user_payload = request.get_json()
        if user_payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    if 'email' not in user_payload:
        abort(400, 'The user must provide his registered email address')

    user = User.query.filter_by(email=user_payload.get('email')).first()

    if not user:
        abort(400, 'This email is not associated with any account')

    serializer = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])
    token = serializer.dumps({'email':user.email})
    reset_link = f'http://localhost:5500/templates/password_reset.html?token={token}'
    msg = Message(subject='Password Reset Request', sender='noreply@techtales.com',
                  recipients=[user.email])
    msg.html = f"""
    <h2>Hi {user.first_name},</h2>

    <p>We received a request to reset your password. Click the link below to reset it:</p>

    <a href={reset_link}>Your link to reset your password</a>

    <p>If you didn't request a password reset, please ignore this email.</p>

    <p>Thanks,</p>
    <p>The TechTales Team</p>
    """

    mail.send(msg)
    db.session.add(PasswordResetToken(token=token, user_id=user.id))
    db.session.commit()
    return jsonify({'message': 'request link has sent successfully'}), 200



@users.route('/users/password-reset', methods=['POST'], strict_slashes=False)
def password_reset():

    """
    Resets the password of the user

    Expected data:
        password_reset_token (srt): The generated password_reset_token that has been sent to the user

        new_password (str): The new password that the user want to use

        confirm_new_password (str): to confirm the new password
        that the user want to use
    """

    try:
        password_payload = request.get_json()
        if password_payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")
    
    if 'password_reset_token' not in password_payload:
        abort(400, 'Password_reset_token is missing')
    if 'new_password' not in password_payload:
        abort(400, 'The user must provide his new password')
    if 'confirm_new_password' not in password_payload:
        abort(400, 'The user must provide his confirm new password')
    

    token = password_payload.get('password_reset_token')
    new_password = password_payload.get('new_password')
    confirm_new_password = password_payload.get('confirm_new_password')

    serializer = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])

    try:
        token_payload = serializer.loads(token, max_age=3600)
    except Exception:
        abort(400, 'Password Reset token is invalid or expired')

    password_token = PasswordResetToken.query.filter_by(token = token).first()
    if not password_token:
        abort(400, 'This password reset token does not exist')

    if new_password != confirm_new_password:
        abort(400, 'The new password and confirm password do not match')

    salt = bcrypt.gensalt()
    new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)

    user = password_token.user

    user.password = new_hashed_password

    user.updated_at = datetime.utcnow()
    user.token_issue_time = datetime.utcnow()

    db.session.delete(password_token)
    db.session.commit()

    return jsonify({"message": "The password has been successfully reset"}), 200
