"""This module handles users Posts apis"""

from flask import Blueprint, abort, jsonify, request, g
from api.v1 import db
from api.v1.models.user import User
from api.v1.models.post import Post
from flask_jwt_extended import jwt_required, get_jwt
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

    user = g.current_user
    if not user:
        abort(404, 'This user does not exist')

    new_post = Post(
        title=body.get('title'),
        content=body.get('content'),
        user_id=user.id
    )
    
    db.session.add(new_post)
    db.session.commit()

    serialized_post = new_post.to_dict()

    return jsonify(serialized_post), 201


@posts.route('/posts', strict_slashes=False)
def get_posts():
    """Return all posts"""

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=15, type=int)

    posts = Post.query.paginate(page = page, per_page=per_page)

    serialized_posts = []

    for post in posts:
        serialized_user = post.user.to_dict()
        post = post.to_dict()
        post['user'] = serialized_user
        serialized_posts.append(post)

    return jsonify({"posts": serialized_posts}), 200


@posts.route('/posts/<id>', methods=['GET'], strict_slashes=False)
def get_post(id):
    """Returns a specific post with a specific public_id"""
    post = Post.query.filter_by(id=id).first()
    if not post:
        abort(404, 'This post does not exist')

    serialized_post = post.to_dict()
    serialized_post['user'] = post.user.to_dict()

    return jsonify(serialized_post)


@posts.route('/posts/<id>', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_post(id):
    """Updates a specific post with a specific id"""

    user = g.current_user

    if not user:
        abort(404, 'This user does not exist')

    post = Post.query.filter_by(id=id).first()
    if not post:
        abort(404, 'This post does not exist')

    if user.id != post.user_id:
        abort(403, 'You are not authorized to perform this process (Update post)')

    try:
        body = request.get_json()
        if body is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    ignore = ['id', 'user_id', 'created_at', 'updated_at']

    for key, value in body.items():
        if key in ignore:
            continue
        setattr(post, key, value)

    post.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify(post.to_dict()), 200


@posts.route('/posts/<id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_post(id):
    """Deletes a specific post with a specific public_id"""

    user = g.current_user
    if not user:
        abort(404, 'This user does not exist')

    post = Post.query.filter_by(id=id).first()
    if not post:
        abort(404, 'This post does not exist')

    if user.id != post.user_id:
        abort(403, 'You are not authorized to perform this process (Delete post)')

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "The post has been deleted successfully"}), 200
