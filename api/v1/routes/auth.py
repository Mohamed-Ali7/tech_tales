"""This module handles users authentication and logging out"""

from flask import Blueprint, abort, jsonify, request
from api.v1 import db, mail, app
from api.v1.models.user import User
from flask_bcrypt import bcrypt
from flask_jwt_extended import (create_access_token,
                                create_refresh_token,
                                jwt_required,
                                get_jwt,
                                decode_token)
import uuid
from api.v1.models.token_black_list import TokenBlacklist
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Message


auth = Blueprint('auth', __name__, url_prefix='/api/v1/auth')


@auth.route('/register', methods=['POST'], strict_slashes=False)
def register_user():
    """
    Register a new user and add to the database

    Expected data:
        email (str): User's email address
        password (str): User's password
        first_name (str): User's first name
        last_name (str) (optional): User's last name
    """

    try:
        user_payload = request.get_json()
        if user_payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    if 'email' not in user_payload:
        abort(400, description="Missing email")
    if 'password' not in user_payload:
        abort(400, description="Missing password")
    if 'confirm_password' not in user_payload:
        abort(400, description="Missing confirm password")
    if 'first_name' not in user_payload:
        abort(400, description="User at least must provide his/her first name")

    confirm_password = user_payload.get('confirm_password')

    if user_payload['password'] != confirm_password:
        abort(400, 'The password and confirm password do not match')

    del user_payload['confirm_password']

    user = User.query.filter_by(email=user_payload['email']).first()

    if user:
        abort(400, description="This email address is already in use")

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(
        user_payload['password'].encode('utf-8'),
        salt
        )

    new_user = User(**user_payload)
    new_user.public_id = uuid.uuid4()

    if new_user.email == 'admin@techtales.com':
        new_user.admin = True

    token_serializer = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])
    verify_email_token = token_serializer.dumps({'email': new_user.email})

    new_user.password = hashed_password
    send_email_verfication_mail(verify_email_token, new_user)

    db.session.add(new_user)
    db.session.commit()

    serialized_user = new_user.to_dict()
    if 'id' in serialized_user:
        del serialized_user['id']


    return jsonify(serialized_user), 201


@auth.route("/login", methods=["POST"], strict_slashes=False)
def login():
    """
    Authenticate the user using username (email in our case) and password
    and returns JWT access and refresh tokens
    if the provided credentials are true valid

    Expected data:
        email (str): User's email address
        password (str): User's password
    """

    try:
        user_payload = request.get_json()
        if user_payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    email = user_payload.get("email")
    password = user_payload.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(password.encode('utf-8'),
                                      user.password.encode('utf-8')):
        abort(401, description="Invalid email or password")

    if not user.is_active:
        abort(400, 'Your email is not verified')

    access_token = create_access_token(
        identity=user.email,
        additional_claims={
            "public_id": user.public_id,
            "admin": user.admin,
            "issued_at": user.token_issue_time.isoformat()
            }
        )
    refresh_token = create_refresh_token(
        identity=user.email,
        additional_claims={
            "public_id": user.public_id,
            "admin": user.admin,
            "issued_at": user.token_issue_time.isoformat()
            }
        )

    return jsonify({"tokens": {
        "access_token": access_token,
        "refresh_token": refresh_token,
    }}), 200


@auth.route("/refresh")
@jwt_required(refresh=True)
def refresh_access():
    """
    Refreshes the access token when it is expired
    and return a new access tokken
    """

    jwt = get_jwt()
    identity = jwt.get('sub')
    public_id = jwt.get('public_id')
    is_admin = jwt.get('admin')
    token_issue_time = jwt.get('issued_at')

    new_access_token = create_access_token(
        identity=identity,
        additional_claims={
            "public_id": public_id,
            "admin": is_admin,
            "issued_at": token_issue_time
            }
        )

    return jsonify({"access_token": new_access_token}), 200


@auth.route("/logout", methods=['POST'], strict_slashes=False)
@jwt_required()
def logout():
    """
    Logs the user out of the application
    by adding the jti (a unique id for each jwt token) of his
    JWT access and refresh tokens to a black list table in database

    Expected data:
        tokens (dict): A dict that contains the user's access and refresh tokens
        that are defined with (access_token) and (refresh_token) keys
    """

    try:
        jwt_tokens = request.get_json().get('tokens')
        if jwt_tokens is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    blacklisted_tokens = []

    for token in jwt_tokens.values():
        # decode the token to access it's data
        decoded_token = decode_token(token)
        token_jti = decoded_token.get('jti')
        blacklisted_tokens.append(TokenBlacklist(jti=token_jti))

    db.session.bulk_save_objects(blacklisted_tokens)
    db.session.commit()
    return jsonify({"messege": "User has logged out successfully"}), 200


@auth.route('/email-verification/<token>', strict_slashes=False)
def email_verification(token):
    """Verifies user's email address to activate user's account"""

    serializer = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])

    try:
        payload = serializer.loads(token, max_age=86400)
    except Exception:
        abort(400, 'Email verifcation token is invalid or expired')

    user = User.query.filter_by(email=payload.get('email')).first()

    if not user:
        abort(404, 'This user does not exist')

    user.is_active = True

    db.session.commit()

    return jsonify({'message': 'Your email has been successfully verified'}), 200


@auth.route('/email-verification', methods=['POST'], strict_slashes=False)
def ask_for_email_verification_mail():
    """
    Sends an email verification mail to the user registed email addrss

    Expected data:
        email (str): user's registerd email to the mail to
    """

    try:
        user_payload = request.get_json()
        if user_payload is None:
            abort(400, description="Not a JSON")
    except Exception as e:
        abort(400, description="Not a JSON")

    email = user_payload.get("email")

    token_serializer = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])
    verify_email_token = token_serializer.dumps({'email': email})

    user = User.query.filter_by(email=email).first()

    if not user:
        abort(404, 'This email is not associated with any account')

    if user.is_active:
        abort(400, 'Your email has been already verified')

    send_email_verfication_mail(verify_email_token, user)

    db.session.commit()

    return jsonify({'message': 'Verification mail has send successfully'}), 200


def send_email_verfication_mail(token, user):
    """
    Sends an email to the user that contains a link to verify his/her email address
    and activate his/her account
    """

    msg = Message(subject='Verify Your Email Address', sender='noreply@techtales.com',
                  recipients=[user.email])
    link = f"http://localhost:5500/templates/verify_email.html?token={token}"
    msg.html = f"""
    <h2>Hi {user.first_name},</h2>
    
    <p>Thank you for registering with TechTales. Please verify your email address by clicking the link below:</p>
    
    <a href={link}>Verify your email</a>
    
    <p>If you did not create an account with us, please ignore this email.</p>
    
    <p>Thanks,</p>
    
    <p>The TechTales Team</p>
    """

    mail.send(msg)
