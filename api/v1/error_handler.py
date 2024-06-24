"""This module handles response errors"""

from api.v1 import app, jwt
from flask import jsonify


@app.errorhandler(400)
def bad_request_handler(exc):
    """
    Handles the response error when the response status code is 400
    which means a bad request, for example when the request body the was sent
    by the front-end client is not in a JSON format
    """

    return {
        "status_code": exc.code,
        "message": exc.description
        }, exc.code


@app.errorhandler(401)
def unauthorized_handler(exc):
    """
    Handles the response error when the response status code is 401
    which means that the user in not authenticated to access protected resources
    """

    return {
        "status_code": exc.code,
        "message": exc.description
    }, exc.code


@app.errorhandler(403)
def forbidden_handler(exc):
    """
    Handles the response error when the response status code is 403
    which means that the user is authenticated but not authorized
    to access a specific resource or perform a specific process
    """

    return jsonify({
        "status_code": exc.code,
        "message": exc.description
    }), exc.code


@app.errorhandler(404)
def not_found_handler(exc):
    """
    Handles the response error when the response status code is 404
    which means that the resource that the user is looking for doesn't exist
    """

    return {
        "status_code": exc.code,
        "message": exc.description if exc.description else
        "The page you are looking for not found"
    }, exc.code


@app.errorhandler(Exception)
def internal_server_handler(exc):
    """
    Handles the response error when the response status code is 500
    which means an internal error happened in the server
    """

    return {
        "status_code": 500,
        "message": str(exc)
        }, 500


@jwt.unauthorized_loader
def unauthorized_token(error):
    """
    Loader function that invoked when the (Authorization) header is
    not provided
    """

    return jsonify({
        "status_code": 401,
        "message": "Missing Authorization Header"
        }), 401


@jwt.invalid_token_loader
def invalid_token(error):
    """Loader function that invoked when the provided jwt token is invalid"""

    return jsonify({
        "status_code": 401,
        "message": "Invalid JWT token"
        }), 401


@jwt.expired_token_loader
def expired_token(jwt_header, jwt_data):
    """Loader function that invoked when the provided jwt token is expired"""

    return jsonify({
        "status_code": 401,
        "message": "JWT token has expired"
        }), 401
