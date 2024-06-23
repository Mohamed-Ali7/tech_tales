"""This module handles users APIs"""

from api.v1 import db
from api.v1.models.user import User
from api.v1.models.post import Post
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime
from flask_bcrypt import bcrypt


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
        serialized_users.append(user.to_dict())

    return jsonify({"users": serialized_users}), 200

@users.route('/users/<public_id>', strict_slashes=False)
def get_user(public_id):
    """Returns a specific user with a specific public_id"""

    user = User.query.filter_by(public_id = public_id).first()

    if not user:
        abort(404, 'This user does not exist')

    return jsonify(user.to_dict())


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

    return jsonify(user.to_dict())


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

    return jsonify({"user_posts": serialized_user_posts}), 200


@users.route('/users/<user_public_id>/edit/password', methods=['PUT'],
             strict_slashes=False)
@jwt_required()
def change_password(user_public_id):
    """
    Changes the password if the user

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
    if 'confirm_password' not in payload:
        abort(400, 'The user must confirm his new password')

    old_password = payload.get('old_password')
    new_password = payload.get('new_password')
    confirm_password = payload.get('confirm_password')

    if new_password != confirm_password:
        abort(400, 'The new password and confirm password do not match')

    if not bcrypt.checkpw(old_password.encode('utf-8'), user.password.encode('utf-8')):
        abort(400, 'Incorrect password: Old password does not match your current password')

    salt = bcrypt.gensalt()
    new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)

    user.password = new_hashed_password

    user.updated_at = datetime.utcnow()
    user.token_issue_time = datetime.utcnow()

    db.session.commit()

    return jsonify({"Success": "The password has changed successfully"})
