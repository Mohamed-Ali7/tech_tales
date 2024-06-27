"""This module handles comments APIs"""
from api.v1 import db
from flask import Blueprint, jsonify, abort, request, g
from api.v1.models.post import Post
from api.v1.models.comment import Comment
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime

comments = Blueprint(name='comments', import_name=__name__, url_prefix='/api/v1')


@comments.route('/posts/<post_id>/comments', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_comment(post_id):
    """Create a comment for a specific post"""

    try:
        comment_payload = request.get_json()
        if comment_payload is None:
            abort(400, description="Not a JSON")
    except Exception as ex:
        abort(400, description="Not a JSON")

    if 'content' not in comment_payload:
        abort(400, description="Missing comment content")

    post = Post.query.filter_by(id=post_id).first()

    if not post:
        abort(404, 'This post does not exist')    

    user = g.current_user

    if not post:
        abort(404, 'This post does not exist')

    new_comment = Comment(
        content=comment_payload['content'],
        user_id=user.id,
        post_id=post.id,
        public_user_id=user.public_id,
        user_name = "{} {}".format(user.first_name, user.last_name)
        )    

    db.session.add(new_comment)
    db.session.commit()

    serialized_comment = new_comment.to_dict()

    return jsonify(serialized_comment), 201


@comments.route('/posts/<post_id>/comments', strict_slashes=False)
def get_post_comments(post_id):
    """Returns the comments of a specific post using the post id"""

    post = Post.query.filter_by(id=post_id).first()

    if not post:
        abort(404, 'This post does not exist')

    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)

    post_comments = Comment.query.filter_by(post_id=post.id)\
    .order_by(Comment.created_at).paginate(page=page, per_page=per_page)

    serialized_comments = []

    for comment in post_comments:
        serialized_comments.append(comment.to_dict())

    return jsonify({'comments': serialized_comments}), 200


@comments.route('/posts/<post_id>/comments/<comment_id>', strict_slashes=False)
def get_comments(post_id, comment_id):
    """Returns the comments of a specific post using the post id"""

    post = Post.query.filter_by(id=post_id).first()

    if not post:
        abort(404, 'This post does not exist')

    comment = Comment.query.filter_by(id=comment_id).first()

    if not comment:
        abort(404, 'This comment does not exist')

    if comment.post.id != post.id:
        abort(404, 'There is no such comment for this post')

    return jsonify(comment.to_dict()), 200


@comments.route('/posts/<post_id>/comments/<comment_id>',
                methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_post(post_id, comment_id):
    """Updates a specific comment for a post"""

    user = g.current_user

    if not user:
        abort(404, 'This user does not exist')

    post = Post.query.filter_by(id=post_id).first()
    if not post:
        abort(404, 'This post does not exist')

    comment = Comment.query.filter_by(id=comment_id).first()

    if not comment:
        abort(404, 'This comment does not exist')

    if comment.post.id != post.id:
        abort(404, 'There is no such comment for this post')

    if user.id != comment.user_id:
        abort(403, 'You are not authorized to perform this process (Update comment)')

    try:
        comment_payload = request.get_json()
        if comment_payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    ignore = ['id', 'user_id', 'created_at', 'updated_at', 'post_id', 'user_public_id']

    for key, value in comment_payload.items():
        if key in ignore:
            continue
        setattr(comment, key, value)

    comment.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify(comment.to_dict()), 200


@comments.route('/posts/<post_id>/comments/<comment_id>',
                methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_post(post_id, comment_id):
    """Deletes a specific comment for a post"""

    user = g.current_user

    if not user:
        abort(404, 'This user does not exist')

    post = Post.query.filter_by(id=post_id).first()
    if not post:
        abort(404, 'This post does not exist')

    comment = Comment.query.filter_by(id=comment_id).first()

    if not comment:
        abort(404, 'This comment does not exist')

    if comment.post.id != post.id:
        abort(404, 'There is no such comment for this post')

    if user.id != comment.user_id:
        abort(403, 'You are not authorized to perform this process (DELETE comment)')

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "The comment has been deleted successfully"}), 200
