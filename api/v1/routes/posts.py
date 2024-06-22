"""This module handles users Posts apis"""

from flask import Blueprint, abort, jsonify, request
from api.v1 import db
from api.v1.models.user import User
from api.v1.models.post import Post
from flask_jwt_extended import jwt_required, get_jwt
import uuid
from datetime import datetime

posts = Blueprint(name='posts', import_name=__name__, url_prefix='/api/v1')

@posts.route('/posts', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_post():
    """Creates a new post"""
    try:
        body = request.get_json()
        if body is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    if 'title' not in body:
        abort(400, description="Missing title")
    if 'content' not in body:
        abort(400, description="Missing content")

    current_user_public_id = get_jwt().get('public_id')
    user = User.query.filter_by(public_id=current_user_public_id).first()
    if not user:
        abort(400, 'This user does not exist')

    new_post = Post(
        public_id=uuid.uuid4(),
        title=body.get('title'),
        content=body.get('content'),
        user_id=user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.session.add(new_post)
    db.session.commit()

    return jsonify(new_post.to_dict()), 201

@posts.route('/posts/<public_id>', methods=['GET'], strict_slashes=False)
def get_post(public_id):
    """Returns a specific post with a specific public_id"""
    post = Post.query.filter_by(public_id=public_id).first()
    if not post:
        abort(400, 'This post does not exist')
    return jsonify(post.to_dict())

@posts.route('/posts/<public_id>', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_post(public_id):
    """Updates a specific post with a specific public_id"""
    current_user_public_id = get_jwt().get('public_id')
    user = User.query.filter_by(public_id=current_user_public_id).first()
    if not user:
        abort(400, 'This user does not exist')

    post = Post.query.filter_by(public_id=public_id, user_id=user.id).first()
    if not post:
        abort(400, 'This post does not exist or you are not authorized to update it')

    try:
        body = request.get_json()
        if body is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    ignore = ['id', 'public_id', 'user_id', 'created_at', 'updated_at']

    for key, value in body.items():
        if key in ignore:
            continue
        setattr(post, key, value)

    post.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify(post.to_dict()), 200

@posts.route('/posts/<public_id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_post(public_id):
    """Deletes a specific post with a specific public_id"""
    current_user_public_id = get_jwt().get('public_id')
    user = User.query.filter_by(public_id=current_user_public_id).first()
    if not user:
        abort(400, 'This user does not exist')

    post = Post.query.filter_by(public_id=public_id, user_id=user.id).first()
    if not post:
        abort(400, 'This post does not exist or you are not authorized to delete it')

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "The post has been deleted successfully"}), 200
