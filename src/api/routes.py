"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, OnlineGames, Favorites, OnlineStats, UserContacts, IAsessions, IAevents, GamePurchase, StoreItem, Cart, CartItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select, or_
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from api.mail.mailer import send_mail
from flask import current_app
from datetime import datetime
import os


import stripe

api = Blueprint('api', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET')

# Allow CORS requests to this API
CORS(api)


FRONT = 'https://zany-fortnight-4jv64j66gv992qg5r-3000.app.github.dev/'


@api.route('/users', methods=['GET'])
def get_users():

    stmt = select(Users)
    users = db.session.execute(stmt).scalars().all()
    return jsonify([user.serialize() for user in users]), 200


@api.route('/users/<int:id>', methods=['GET'])
def get_oneUser(id):

    stmt = select(Users).where(Users.id == id)
    user = db.session.execute(stmt).scalar_one_or_none()
    if user is None:
        return jsonify({"error": "User not found"}), 400

    return jsonify(user.serialize()), 200


@api.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data["email"] or not data["password"]:
            raise Exception({"error": "Missing Data"})

        stmt = select(Users).where(Users.email == data["email"])
        existing_user = db.session.execute(stmt).scalar_one_or_none()

        if existing_user:
            raise Exception({"error": "Existing email, try to SignIn"})

        hashed_password = generate_password_hash(data["password"])

        new_user = Users(
            email=data["email"],
            password=hashed_password,
            username=data.get("username"),
            firstname=data.get("firstname", None),
            lastname=data.get("lastname", None),
            dateofbirth=data.get("dateofbirth", None),
            phone=data.get("phone", None),
            avatar_image=data.get("avatar_image", None),
            is_active=True
        )

        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.serialize()), 201

    except Exception as e:
        print(e)

        db.session.rollback()
        return jsonify({"error": "somthing went wrong"}), 400


@api.route('/signin', methods=['POST'])
def signin():
    try:
        data = request.get_json()

        if not data.get("password") or not data.get("identify"):
            return jsonify({"error": "missing data"})

        stmt = select(Users).where(
            or_(Users.email == data["identify"], Users.username == data["identify"]))
        user = db.session.execute(stmt).scalar_one_or_none()

        if not user:
            raise Exception({"error": "Email/Username not found"})

        if not check_password_hash(user.password, data["password"]):
            return jsonify({"success": False, "error": "wrong email/password"})

        token = create_access_token(identity=str(user.id))

        return jsonify({"success": True, "token": token, "msg": "SignIn OK", "user": user.serialize()}), 201

    except Exception as e:
        print(e)

        db.session.rollback()
        return jsonify({"error": "somthing went wrong"}), 400


@api.route('/mailer/<address>', methods=['POST'])
def handle_mail(address):
    return send_mail(address)


@api.route('/token', methods=['GET'])
@jwt_required()
def check_jwt():
    user_id = get_jwt_identity()
    users = Users.query.get(user_id)

    if users:
        return jsonify({"success": True, "user": users.serialize()}), 200
    return jsonify({"success": False, "msg": "Bad token"}), 401


@api.route('/forgot-password', methods=['POST'])
def forgot_password():

    try:
        data = request.get_json()

        user = db.session.query(Users).filter_by(email=data["email"]).first()
        if not user:
            return jsonify({"success": False, "error": "Email no encontrado"}), 404

        token = create_access_token(identity=str(user.id))
        result = send_mail(data["email"], token)
        print(result)

        return jsonify({"success": True, "token": token, "email": data["email"]}), 200

    except Exception as e:
        print("Error enviando correo:", str(e))
        return jsonify({"success": False, 'msg': 'Error enviando email', 'error': str(e)}), 500


@api.route('/reset-password', methods=['PUT'])
@jwt_required()
def reset_password():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        print("Datos recibidos", data)
        print("password:", data.get("password"))

        if not data or not data.get("password"):
            return jsonify({"success": False, "msg": "PAssword is required"}), 422

        user = Users.query.get(user_id)
        print("user_id", user_id)

        if not user:
            return jsonify({"success": False, "msg": "User not found"}), 404

        hashed_password = generate_password_hash(data["password"])
        user.password = hashed_password
        db.session.commit()

        return jsonify({"success": True, "msg": "Contraseña actualizada"}), 200
    except Exception as e:
        db.session.rollback()
        print("Error al modificar password: {str(e)}")
        return jsonify({"success": False, "msg": f"Error al modificar password: {str(e)}"})

# ruta para crear una session de pago con stripe


@api.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        body = request.get_json()
        if not body or 'items' not in body:
            return jsonify({"error": "Invalid request, 'items' is required"}), 400

        session = stripe.checkout.Session.create(
            ui_mode='embedded',
            line_items=body['items'],
            mode='payment',
            return_url=FRONT + 'return?session_id={CHECKOUT_SESSION_ID}',
        )
    except Exception as e:
        return jsonify({"error": str(e)})

    return jsonify({"clientSecret": session.client_secret})


# ruta que se encarga de recibir el id de la session y devolver el estado del pago
@api.route('/session-status', methods=['GET'])
def session_status():
    session = stripe.checkout.Session.retrieve(request.args.get('session_id'))

    return jsonify(status=session.status, customer_email=session.customer_details.email)


@api.route('/store-purchase', methods=['POST'])
def store_purchase():
    try:
        data = request.get_json()

        session_id = data.get("session_id")
        user_id = data.get("user_id")
        game_api_id = data.get("game_api_id")
        game_name = data.get("game_name")

        if not all([session_id, user_id, game_api_id, game_name]):
            return jsonify({"error": "Missing required fields"}), 400

        session = stripe.checkout.Session.retrieve(
            session_id, expand=['line_items'])
        if session.payment_status != "paid":
            return jsonify({"error": "Payment not complete"}), 400

        amount = session.amount_total
        currency = session.currency
        stripe_price_id = session.line_items.data[
            0].price.id if session.line_items and session.line_items.data else "unknown"

        new_purchase = GamePurchase(
            game_api_id=game_api_id,
            name=game_name,
            stripe_price_id=stripe_price_id,
            amount_paid=amount,
            currency=currency
        )

        db.session.add(new_purchase)
        db.session.commit()

        return jsonify({"message": "Purchase store successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/items', methods=['GET'])
def get_store_items():

    stmt = select(StoreItem)
    items = db.session.execute(stmt).scalars().all()

    return jsonify([item.serialize() for item in items]), 200


@api.route('/items', methods=['POST'])
def create_store_item():
    data = request.get_json()

    game_api_id = data.get("game_api_id")
    name = data.get("name")
    stripe_price_id = data.get("stripe_price_id")
    price = data.get("price")
    currency = data.get("currency", "eur")

    if not all([game_api_id, name, stripe_price_id, price, currency]):
        return jsonify({"error": "Missing required fields"}), 400

    new_item = StoreItem(
        game_api_id=game_api_id,
        name=name,
        stripe_price_id=stripe_price_id,
        price=price,
        currency=currency,
    )

    db.session.add(new_item)
    db.session.commit()

    return jsonify(new_item.serialize()), 200


@api.route('/items/<int:item_id>', methods=['DELETE'])
def delete_store_item(item_id):

    stmt = select(StoreItem).where(StoreItem.id == item_id)
    storegame = db.session.execute(stmt).scalar_one_or_none()
    if storegame is None:
        return jsonify({"error": "Store Game not found"}), 400

    db.session.delete(storegame)
    db.session.commit()

    return jsonify({"msg": "Store Game delete"}), 200


@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:

        id = get_jwt_identity()

        stmt = select(Users).where(Users.id == id)
        user_profile = db.session.execute(stmt).scalar_one_or_none()

        if not user_profile:
            return jsonify({"msg": "Profile is not working"})

        return jsonify(user_profile.serialize()), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "somthing go very bad"}), 400


@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        data = request.get_json()
        id = get_jwt_identity()

        stmt = select(Users).where(Users.id == id)
        user = db.session.execute(stmt).scalar_one_or_none()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        user.email = data.get("email", user.email)
        user.password = data.get("password", user.password)
        user.username = data.get("username", user.username)
        user.firstname = data.get("firstname", user.firstname)
        user.lastname = data.get("lastname", user.lastname)
        user.dateofbirth = data.get("dateofbirth", user.dateofbirth)
        user.phone = data.get("phone", user.phone)
        db.session.commit()

        return jsonify(user.serialize()), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Somthing you can`t update"})


# @api.route('/users/<int:id>', methods=['PUT'])
# def update_user(id):
#     data = request.get_json()
#     stmt = select(Users).where(Users.id == id)
#     user = db.session.execute(stmt).scalar_one_or_none()

#     if user is None:
#         return jsonify({"error": "User not found"}), 404

#     user.email = data.get("email", user.email)
#     user.password = data.get("password", user.password)
#     user.username = data.get("username", user.username)
#     user.firstname = data.get("firstname", user.firstname)
#     user.lastname = data.get("lastname", user.lastname)
#     user.dateofbirth = data.get("dateofbirth", user.dateofbirth)
#     user.phone = data.get("phone", user.phone)
#     db.session.commit()

#     return jsonify(user.serialize()), 200


@api.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_profile():
    try:

        id = get_jwt_identity()

        stmt = select(Users).where(Users.id == id)
        profile = db.session.execute(stmt).scalar_one_or_none()

        if profile is None:
            return jsonify({"error": "Profile not found"}), 404

        db.session.delete(profile)
        db.session.commit()

        return jsonify({"message": "Profile delete"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Somthing went wrong, not delete the profile"})


# @api.route('/users/<int:id>', methods=['DELETE'])
# def delete_user(id):

#     stmt = select(Users).where(Users.id == id)
#     user = db.session.execute(stmt).scalar_one_or_none()

#     if user is None:
#         return jsonify({"error": "User not found"}), 404

#     db.session.delete(user)
#     db.session.commit()

#     return jsonify({"message": "User delete"}), 200


@api.route('/onlinegames', methods=['GET'])
@jwt_required()
def get_online_games():

    current_user = get_jwt_identity()

    stmt = select(OnlineGames)
    online = db.session.execute(stmt).scalars().all()
    return jsonify([games.serialize() for games in online]), 200


@api.route('/onlinegames/<int:id>', methods=['GET'])
def get_oneGame(id):

    stmt = select(OnlineGames).where(OnlineGames.id == id)
    onlinegame = db.session.execute(stmt).scalar_one_or_none()
    if onlinegame is None:
        return jsonify({"error": "Online Game not found"}),  400

    return jsonify(onlinegame.serialize()), 200


@api.route('/onlinegames', methods=['POST'])
@jwt_required()
def create_game():

    data = request.get_json()

    if not data or "name" not in data:
        return jsonify({"error": "Missing data"}), 400

    new_online_game = OnlineGames(
        name=data["name"],
        description=data.get("description", None),
        difficulty_levels=data.get("difficulty_levels", None),
    )

    db.session.add(new_online_game)
    db.session.commit()

    return jsonify(new_online_game.serialize()), 201


@api.route('/onlinegames/<int:id>', methods=['PUT'])
@jwt_required()
def edit_game(id):
    try:

        data = request.get_json()
        # id = get_jwt_identity()

        stmt = select(OnlineGames).where(OnlineGames.id == id)
        on_game = db.session.execute(stmt).scalar_one_or_none()
        if on_game is None:
            return jsonify({"error": "Game not found"}), 404

        on_game.name = data.get("name", on_game.name)
        on_game.description = data.get("description", on_game.description)
        on_game.difficulty_levels = data.get(
            "difficulty_levels", on_game.difficulty_levels)
        db.session.commit()

        return jsonify(on_game.serialize()), 200

    except Exception as e:
        print(e)

        return jsonify({"error": "somthing went wrong with update"}), 400


@api.route('/onlinegames/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_game(id):
    try:
        # id = get_jwt_identity()

        stmt = select(OnlineGames).where(OnlineGames.id == id)
        onlinegame = db.session.execute(stmt).scalar_one_or_none()
        if onlinegame is None:
            return jsonify({"error": "Game Online not found"}), 400

        db.session.delete(onlinegame)
        db.session.commit()

        return jsonify({"msg": "Online Game delete"}), 200

    except Exception as e:
        print(e)

        return jsonify({"error": "something went wrong with delete"})


@api.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:

        stmt = select(OnlineStats)
        onlinestats = db.session.execute(stmt).scalars().all()

        return jsonify([stats.serialize() for stats in onlinestats]), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong with get stats"})


@api.route('/users/<int:id>/stats', methods=['GET'])
@jwt_required()
def get_user_stats(id):
    try:
        # id = get_jwt_identity()

        stmt = select(OnlineStats).where(OnlineStats.user_id == id)
        user_stats = db.session.execute(stmt).scalars().all()
        if user_stats is None:
            return jsonify({"error": "User stats not Found"}), 400

        return jsonify([stats.serialize() for stats in user_stats]), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "somthing went wrong with user stats"})


@api.route('/onlinegames/<int:id>/stats', methods=['GET'])
@jwt_required()
def get_game_stats(id):
    try:

        stmt = select(OnlineStats).where(OnlineStats.online_game_id == id)
        onlinegame_stats = db.session.execute(stmt).scalars().all()
        if onlinegame_stats is None:
            return jsonify({"error": "User stats not Found"}), 400

        return jsonify([stats.serialize() for stats in onlinegame_stats]), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "somthing went wrong with online game stats"})


@api.route('/stats', methods=['POST'])
@jwt_required()
def create_stats():
    try:

        data = request.get_json()
        if not data or "sessions_played" not in data or "wins" not in data or "stalemate" not in data or "losses" not in data or "user_id" not in data or "online_game_id" not in data:
            return jsonify({"error": "Missing data"}), 404

        new_stats = OnlineStats(
            sessions_played=data["sessions_played"],
            wins=data["wins"],
            stalemate=data["stalemate"],
            losses=data["losses"],
            user_id=data["user_id"],
            online_game_id=data["online_game_id"]
        )

        db.session.add(new_stats)
        db.session.commit()

        return jsonify(new_stats.serialize()), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "somthing went wrong with stats"})


@api.route('/stats/update_results', methods=['POST'])
@jwt_required()
def update_result():
    try:
        data = request.get_json()
        print("Datos recibidos para update_result:", data)
        user_id = data.get("user_id")
        game_id = data.get("online_game_id")
        result = data.get("result")
        move_count = data.get("move_count")

        if not user_id or not game_id or result not in ["win", "loss", "stalemate"] or move_count is None:
            return jsonify({"error": "Missing or invalid data"}), 400

        stmt = select(OnlineStats).where(OnlineStats.user_id ==
                                         user_id, OnlineStats.online_game_id == game_id)
        stat = db.session.execute(stmt).scalar_one_or_none()

        if stat is None:
            stat = OnlineStats(
                user_id=user_id,
                online_game_id=game_id,
                sessions_played=1,
                wins=1 if result == "win" else 0,
                losses=1 if result == "loss" else 0,
                stalemate=1 if result == "stalemate" else 0,
                move_count=move_count,
                last_played=datetime.utcnow()
            )
            db.session.add(stat)
        else:
            stat.sessions_played += 1
            if result == "win":
                stat.wins += 1
            elif result == "loss":
                stat.losses += 1
            elif result == "stalemate":
                stat.stalemate += 1
            stat.move_count += move_count
            stat.last_played = datetime.utcnow()

        db.session.commit()
        return jsonify(stat.serialize()), 200

    except Exception as e:
        print("Error actualizado stats:", e)
        return jsonify({"error": "Something went wrong"}), 500


@api.route('/stats/<int:id>', methods=['PUT'])
@jwt_required()
def edit_stats(id):

    data = request.get_json()
    stmt = select(OnlineStats).where(OnlineStats.id == id)
    stats = db.session.execute(stmt).scalar_one_or_none()
    if stats is None:
        return jsonify({"error": "Stats not found"}), 400

    stats.sessions_played = data.get("sessions_played", stats.sessions_played)
    stats.wins = data.get("wins", stats.wins)
    stats.stalemate = data.get("stalemate", stats.stalemate)
    stats.losses = data.get("losses", stats.losses)

    db.session.commit()
    return jsonify(stats.serialize()), 200


@api.route('/stats/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_stats(id):
    try:

        stmt = select(OnlineStats).where(OnlineStats.id == id)
        stats = db.session.execute(stmt).scalar_one_or_none()
        if stats is None:
            return jsonify({"error": "Stats not found"}), 400

        db.session.delete(stats)
        db.session.commit()
        return jsonify({"msg": "Stats delete"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "somthing went wrong delete stats"})


@api.route('/ia_sessions', methods=['GET'])
@jwt_required()
def get_iasessions():
    try:

        stmt = select(IAsessions)
        iasessions = db.session.execute(stmt).scalars().all()
        return jsonify([ia.serialize() for ia in iasessions]), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong with ia"})


@api.route('/ia_sessions/<int:id>', methods=['GET'])
@jwt_required()
def get_one_IaSession(id):
    try:

        stmt = select(IAsessions).where(IAsessions.id == id)
        iaSesion = db.session.execute(stmt).scalar_one_or_none()
        if iaSesion is None:
            return jsonify({"error": "IA Sesion not found"}),  400

        return jsonify(iaSesion.serialize()), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong with one ia"})


@api.route('/ia_sessions', methods=['POST'])
@jwt_required()
def create_ia_sesion():
    try:

        data = request.get_json()
        print(data)
        if not data or "character_class" not in data or "character_name" not in data or "user_id" not in data:
            return jsonify({"error": "Missing data"}), 400

        new_ia_session = IAsessions(
            title=data.get("title", None),
            description=data.get("description", None),
            genre=data.get("genre", None),
            difficulty_levels=data.get("difficulty_level", None),
            character_name=data["character_name"],
            character_class=data["character_class"],
            experience_gained=data.get("experience_gained", None),
            story_branch=data.get("story_branch", None),
            result=data.get("result", None),
            user_id=data["user_id"]
        )

        db.session.add(new_ia_session)
        db.session.commit()

        return jsonify(new_ia_session.serialize()), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "somthing went wrong post ia"})


@api.route('/ia_sessions/<int:id>', methods=['PUT'])
@jwt_required()
def edit_iaSession(id):
    try:

        data = request.get_json()
        stmt = select(IAsessions).where(IAsessions.id == id)
        ia_session = db.session.execute(stmt).scalar_one_or_none()
        if ia_session is None:
            return jsonify({"error": "Sesion not found"}), 404

        ia_session.title = data.get("title", ia_session.title)
        ia_session.description = data.get(
            "description", ia_session.description)
        ia_session.genre = data.get("genre", ia_session.genre)
        ia_session.difficulty_levels = data.get(
            "difficulty_levels", ia_session.difficulty_levels)
        ia_session.character_name = data.get(
            "character_name", ia_session.character_name)
        ia_session.character_class = data.get(
            "character_class", ia_session.character_class)
        ia_session.experience_gained = data.get(
            "experience_gained", ia_session.experience_gained)
        ia_session.story_branch = data.get(
            "story_branch", ia_session.story_branch)
        ia_session.result = data.get("result", ia_session.result)

        db.session.commit()

        return jsonify(ia_session.serialize()), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "somthing went wrong with update"})


@api.route('/ia_sessions/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_ia_sesion(id):
    try:

        stmt = select(IAsessions).where(IAsessions.id == id)
        ia_sesion = db.session.execute(stmt).scalar_one_or_none()
        if ia_sesion is None:
            return jsonify({"error": "IA Sesion not found"}), 400

        db.session.delete(ia_sesion)
        db.session.commit()

        return jsonify({"msg": "IA Sesion delete"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong delete ia"})


@api.route('/ia_sessions/<int:id>/ia_events', methods=['GET'])
@jwt_required()
def get_ia_events(id):
    try:

        stmt = select(IAevents).where(IAevents.sessions_id == id)
        ia_events = db.session.execute(stmt).scalars().all()
        if ia_events is None:
            return jsonify({"error": "IA Events not found"}), 400

        return jsonify([events.serialize() for events in ia_events]), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong get events"})


@api.route('/ia_events/<int:id>', methods=['GET'])
@jwt_required()
def get_IaEvents(id):
    try:

        stmt = select(IAevents).where(IAevents.id == id)
        iaEvents = db.session.execute(stmt).scalar_one_or_none()
        if iaEvents is None:
            return jsonify({"error": "IA Events not found"}),  400

        return jsonify(iaEvents.serialize()), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong events"})


@api.route('/ia_sessions/<int:id>/ia_events', methods=['POST'])
@jwt_required()
def create_ia_events(id):
    try:

        data = request.get_json()
        print('data ', data)
        if not data or "decision" not in data or "description" not in data or "outcome" not in data or "chapter_number" not in data:
            return jsonify({"error": "Missing data"}), 400

        new_ia_events = IAevents(
            chapter_number=data["chapter_number"],
            decision=data.get("decision", None),
            description=data.get("description", None),
            outcome=data.get("outcome", None),
            sessions_id=id
        )

        db.session.add(new_ia_events)
        db.session.commit()

        return jsonify(new_ia_events.serialize()), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong post events"})


@api.route('/ia_events/<int:id>', methods=['PUT'])
@jwt_required()
def edit_iaEvents(id):
    try:

        data = request.get_json()
        stmt = select(IAevents).where(IAevents.id == id)
        ia_events = db.session.execute(stmt).scalar_one_or_none()
        if ia_events is None:
            return jsonify({"error": "Events not found"}), 404

        ia_events.chapter_number = data.get(
            "chapter_number", ia_events.chapter_number)
        ia_events.decision = data.get("decision", ia_events.decision)
        ia_events.description = data.get("description", ia_events.description)
        ia_events.outcome = data.get("outcome", ia_events.outcome)

        db.session.commit()

        return jsonify(ia_events.serialize()), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong update events"})


@api.route('/ia_events/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_events(id):
    try:

        stmt = select(IAevents).where(IAevents.id == id)
        ia_event = db.session.execute(stmt).scalar_one_or_none()
        if ia_event is None:
            return jsonify({"error": "IA Event not found"}), 400

        db.session.delete(ia_event)
        db.session.commit()

        return jsonify({"msg": "IA Event delete"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong delete events"})


# @api.route('/purchases', methods=['GET'])
# @jwt_required()
# def get_purchases():
#     try:

#         stmt = select(Purchases)
#         purchases = db.session.execute(stmt).scalars().all()
#         return jsonify([money.serialize() for money in purchases]), 200

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "something went wrong get purchases"})


# @api.route('/purchases/<int:id>', methods=['GET'])
# @jwt_required()
# def get_one_purchases(id):
#     try:

#         stmt = select(Purchases).where(Purchases.id == id)
#         purchases = db.session.execute(stmt).scalar_one_or_none()
#         if purchases is None:
#             return jsonify({"error": "Purchases not found"}),  400

#         return jsonify(purchases.serialize()), 200

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "something went wrong purchase"})


# @api.route('/purchases', methods=['POST'])
# @jwt_required()
# def create_purchases():
#     try:

#         data = request.get_json()
#         if not data or "amount" not in data or "payment_method" not in data or "user_id" not in data:
#             return jsonify({"error": "Missing data"}), 400

#         new_purchases = Purchases(
#             amount=data["amount"],
#             payment_method=data["payment_method"],
#             status=data.get("status", None),
#             user_id=data["user_id"]
#         )

#         db.session.add(new_purchases)
#         db.session.commit()

#         new_own = OwnGames(
#             user_id=data["user_id"],
#             purchase_id=new_purchases.id
#         )

#         return jsonify({"purchase": new_purchases.serialize(), "own_game": new_own.serialize()}), 201

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "something went wrong create purchase"})


# @api.route('/users/<int:id>/purchases', methods=['GET'])
# @jwt_required()
# def get_user_purchases(id):
#     try:

#         stmt = select(Purchases).where(Purchases.user_id == id)
#         user_purchases = db.session.execute(stmt).scalars().all()
#         if user_purchases is None:
#             return jsonify({"error": "Purchases not found"}),  400

#         return jsonify([user.serialize() for user in user_purchases]), 200

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "something went wrong user purchases"})


@api.route('/users/<int:id>/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites(id):
    try:

        stmt = select(Favorites).where(Favorites.user1_id == id)
        user_favorites = db.session.execute(stmt).scalars().all()
        if user_favorites is None:
            return jsonify({"error": "Favorites not found"}), 400

        return jsonify([favs.serialize() for favs in user_favorites]), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong user favorites"})


@api.route('/favorites', methods=['POST'])
@jwt_required()
def create_favorites():
    try:

        data = request.get_json()

        user1_id = data.get('user1_id')
        # user2_id = data.get('user2_id')
        game_api_id = data.get('game_api_id')
        onlinegame_id = data.get('onlinegame_id')
        game_type = data.get('game_type')
        if not user1_id:
            return jsonify({"error": "User1 ID is required"}), 404
        if not (onlinegame_id or game_api_id) or not game_type:
            return jsonify({"error": "At least one of the onlinegame_id or game_api_id or game_type is required"})

        user1 = db.session.get(Users, user1_id)
        if not user1:
            return jsonify({"error": "User1 not found"}), 404

        # user2 = db.session.get(Users, user2_id)
        # if not user2:
        #     return jsonify({"error": "User2 not found"}), 404

        # onlinegame = db.session.get(OnlineGames, onlinegame_id)
        # if not onlinegame:
        #     return jsonify({"error": "Online Game not found"}), 404

    #  Verificar si ya existe un favorito idéntico
        existing_fav = Favorites.query.filter_by(
            user1_id=user1_id,
            game_api_id=game_api_id,
            game_type=game_type
        ).first()

        if existing_fav:
            return jsonify({"message": "Este juego ya está en tus favoritos"}), 409

        new_favorite = Favorites(
            user1_id=user1_id,
            # user2_id=user2_id,
            game_api_id=game_api_id,
            onlinegame_id=onlinegame_id,
            game_type=game_type,
        )

        db.session.add(new_favorite)
        db.session.commit()

        return jsonify(new_favorite.serialize()), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong create favorite"})


@api.route('/favorites/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_favorites(id):
    try:

        stmt = select(Favorites).where(Favorites.id == id)
        favorite = db.session.execute(stmt).scalar_one_or_none()
        if favorite is None:
            return jsonify({"error": "Favorite not found"}), 400

        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"msg": "Favorite delete"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong delete favorite"})


@api.route('/users/<int:id>/contacts', methods=['GET'])
@jwt_required()
def get_user_contacts(id):
    try:

        stmt = select(UserContacts).where(UserContacts.id == id)
        user_contacts = db.session.execute(stmt).scalars().all()
        if user_contacts is None:
            return jsonify({"error": "Contacts not found"}), 400

        return jsonify([favs.serialize() for favs in user_contacts]), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong user Contacts"})


@api.route('/contacts', methods=['POST'])
@jwt_required()
def create_contacts():
    try:

        data = request.get_json()

        user_id = data.get('user_id')
        contact_user_id = data.get('contact_user_id')
        if not user_id or not contact_user_id:
            return jsonify({"error": "User ID, Contact User ID is required"}), 404

        user = db.session.get(Users, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        contact_user = db.session.get(Users, contact_user_id)
        if not contact_user:
            return jsonify({"error": "Contact User not found"}), 404

        new_contact = UserContacts(
            user_id=user_id,
            contact_user_id=contact_user_id,
        )

        db.session.add(new_contact)
        db.session.commit()

        return jsonify(new_contact.serialize()), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong create contact"})


@api.route('/contacts/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_contacts(id):
    try:

        stmt = select(UserContacts).where(UserContacts.id == id)
        contact = db.session.execute(stmt).scalar_one_or_none()
        if contact is None:
            return jsonify({"error": "Contact not found"}), 400

        db.session.delete(contact)
        db.session.commit()

        return jsonify({"msg": "Contact delete"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong delete contact"})


@api.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    try:

        data = request.get_json()
        user_id = data.get('user_id')
        game_api_id = data.get('game_api_id')
        stripe_price_id = data.get('stripe_price_id')
        quantity = data.get('quantity', 1)
        game_type = data.get('game_type')
        if not user_id or not game_api_id or not stripe_price_id or not game_type:
            return jsonify({"error": "Missing required fields"}), 400

        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()

        store_item = StoreItem.query.filter_by(game_api_id=game_api_id, stripe_price_id=stripe_price_id).first()
        if not store_item:
            return jsonify({"error": "StoreItem not found"}), 404
            # store_item = StoreItem(
            #     cart_id=cart.id,
            #     game_api_id=game_api_id,
            #     name=name,
            #     stripe_price_id=stripe_price_id,
            #     price=price,
            #     currency=currency,
            # )
            # db.session.add(store_item)
            # db.session.commit()

        existing_cart_item = CartItem.query.filter_by(
            cart_id=cart.id, storeItem_id=store_item.id).first()
        if existing_cart_item:
            existing_cart_item.quantity += quantity
        else:
            new_cart_item = CartItem(
                cart_id=cart.id,
                storeItem_id=store_item.id,
                quantity=quantity,
                game_type=game_type
            )
            db.session.add(new_cart_item)

        db.session.commit()

        return jsonify(new_cart_item.serialize()), 200

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    try:

        cart = Cart.query.filter_by(user_id=user_id).first()
        print("Carrito:", cart)
        if cart:
            print("Items en carrito:", cart.items)
            for i in cart.items:
                print(i.serialize())
        if not cart:
            return jsonify({"items": []}), 200

        print("Carrito encontrado:", cart.serialize())
        return jsonify({"items": [item.serialize() for item in cart.items]}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@api.route('/cart/item/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    try:

        item = CartItem.query.get(item_id)
        if not item:
            return jsonify({"error": "Item not found"}), 404

        db.session.delete(item)
        db.session.commit()

        return jsonify({"msg": "Item eliminado del carrito"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/cart/clear/<int:user_id>', methods=['DELETE'])
def delete_cart(user_id):
    try:

        cart_items = CartItem.query.filter_by(user_id=user_id).all()
        if not cart_items:
            return jsonify({"msg": "Cart ya vacio"}), 200

        for item in cart_items:
            db.session.delete(item)

        db.session.commit()

        return jsonify({"msg": "Cart vaciado"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error en delete_cart:", e)
        return jsonify({"error": str(e)}), 500



@api.route('/seed', methods=['GET'])
def seed_info():
    games = [
        OnlineGames(name='Ajedrez', description='Sumérgete en el clásico juego de estrategia con Ajedrez Online, una experiencia multijugador diseñada para jugadores de todos los niveles. Enfréntate a la inteligencia artificial avanzada, perfecciona tus habilidades, y sigue tu progreso en estadísticas detalladas.', difficulty_levels='Hard'),
        OnlineGames(name='Tres en Raya', description='Tres en Raya es el clásico juego de lógica y estrategia que nunca pasa de moda. El objetivo es sencillo: alinea tres símbolos iguales en una fila, columna o diagonal antes que tu oponente. Juega contra la inteligencia artificial o desafía a tus amigos en partidas rápidas, ideales para momentos de ocio.', difficulty_levels='Easy'),
        OnlineGames(name='Hundir la flota', description='	Hundir la flota, también conocido como Battleship, es un juego clásico de estrategia naval para dos jugadores. El objetivo del juego es localizar y hundir todos los barcos del oponente antes de que él hunda los tuyos.', difficulty_levels='Medium')
    ]
    store_items = [
        StoreItem(game_api_id= 3498, name="Grand Theft Auto V", stripe_price_id= 'price_1RY4zfREEOIw4cHy4wMUusKY', price= 49.95, currency= 'eur'),
        StoreItem(game_api_id= 3328, name="The Witcher 3: Wild Hunt", stripe_price_id= 'price_1RY50VREEOIw4cHy7Y8pn7CT', price= 45.99, currency= 'eur'),
        StoreItem(game_api_id= 5286, name="Tomb Rider (2013)", stripe_price_id= 'price_1RY513REEOIw4cHyzXoKfq3K', price= 39.99, currency= 'eur'),
        StoreItem(game_api_id= 28, name="Red Dead Redemption 2", stripe_price_id= 'price_1RY55MREEOIw4cHy6IHu8WGd', price= 54.99, currency= 'eur'),
        StoreItem(game_api_id= 58175, name="God of War (2018)", stripe_price_id= 'price_1RY569REEOIw4cHyBno1XA50', price= 39.95, currency= 'eur'),
        StoreItem(game_api_id= 5679, name="The Elder Scrolls V: Skyrim", stripe_price_id= 'price_1RY571REEOIw4cHyhwJzwkpq', price= 29.99, currency= 'eur'),
        StoreItem(game_api_id= 32, name="Destiny 2", stripe_price_id= 'price_1RY57RREEOIw4cHyJ8x6Eag4', price= 35.95, currency= 'eur'),
        StoreItem(game_api_id= 3439, name="Life is Strange", stripe_price_id= 'price_1RY582REEOIw4cHyMnNxB6Iv', price= 25.95, currency= 'eur'),
        StoreItem(game_api_id= 1030, name="Limbo", stripe_price_id= 'price_1RY58UREEOIw4cHyd5rjtXnt', price= 19.99, currency= 'eur'),
        StoreItem(game_api_id= 19487, name="Alan Wake", stripe_price_id= 'price_1RY597REEOIw4cHyJIymevwP', price= 22.95, currency= 'eur'),
        StoreItem(game_api_id= 50738, name="Death Standing", stripe_price_id= 'price_1RY59aREEOIw4cHyqaOz6LBg', price= 45.95, currency= 'eur'),
        StoreItem(game_api_id= 1450, name="INSIDE", stripe_price_id= 'price_1RY5A5REEOIw4cHy8edJCXrG', price= 19.95, currency= 'eur'),
        StoreItem(game_api_id= 3486, name="Syberia", stripe_price_id= 'price_1RY5ATREEOIw4cHyLm0iIRMk', price= 22.95, currency= 'eur'),
        StoreItem(game_api_id= 3474, name="Lara Croft and the Temple of Osiris", stripe_price_id= 'price_1RY5BhREEOIw4cHyhFDp6vXm', price= 29.95, currency= 'eur'),
        StoreItem(game_api_id= 4291, name="Counter-Strike: Global Offensive", stripe_price_id= 'price_1RY5E1REEOIw4cHynpGK3vNn', price= 25.99, currency= 'eur'),
        StoreItem(game_api_id= 3251, name="F1 2015", stripe_price_id= 'price_1RY5ERREEOIw4cHySKQg26H9', price= 22.95, currency= 'eur'),
        StoreItem(game_api_id= 36, name="Tekken 7", stripe_price_id= 'price_1RY5F4REEOIw4cHyI0bVlAWS', price= 49.95, currency= 'eur'),
        StoreItem(game_api_id= 715, name="Steep", stripe_price_id= 'price_1RY5HZREEOIw4cHyOsFCY9w3', price= 35.95, currency= 'eur'),
        StoreItem(game_api_id= 11147, name="ARK: Survival of the Fittest", stripe_price_id= 'price_1RY5XsREEOIw4cHyAiCT9j7f', price= 25.95, currency= 'eur'),
        StoreItem(game_api_id= 5525, name="Brutal Legend", stripe_price_id= 'price_1RY5YhREEOIw4cHylUOa8Kw8', price= 19.95, currency= 'eur'),
        StoreItem(game_api_id= 1256, name="XCOM 2", stripe_price_id= 'price_1RY5aXREEOIw4cHylbi5iXDI', price= 29.95, currency= 'eur'),
        StoreItem(game_api_id= 41494, name="CyberPunk 2077", stripe_price_id= 'price_1RY5b5REEOIw4cHyXxTqq3Dl', price= 39.95, currency= 'eur'),
        StoreItem(game_api_id= 278, name="Horizon Zero Dawn", stripe_price_id= 'price_1RY5brREEOIw4cHyHpyMDKAN', price= 45.95, currency= 'eur'),
        StoreItem(game_api_id= 58753, name="Forza Horizon 4", stripe_price_id= 'price_1RY5cWREEOIw4cHyUFmv2YZv', price= 35.95, currency= 'eur'),
        StoreItem(game_api_id= 364806, name="Need for Speed Heat", stripe_price_id= 'price_1RY5d8REEOIw4cHygzXNCulu', price= 29.95, currency= 'eur'),
        StoreItem(game_api_id= 4003, name="Grid 2", stripe_price_id= 'price_1RY5dgREEOIw4cHydWjiGzQO', price= 19.90, currency= 'eur'),
        StoreItem(game_api_id= 12668, name="Get Smart", stripe_price_id= 'price_1RYmpyREEOIw4cHyF1UIkDpN', price= 15.95, currency= 'eur'),
        StoreItem(game_api_id= 401011, name="I would f*ck Hitler", stripe_price_id= 'price_1RZFp1REEOIw4cHyReeNhmQG', price= 19.95, currency= 'eur'),
        StoreItem(game_api_id= 34734, name="Grabsch", stripe_price_id= 'price_1RZFqcREEOIw4cHyzuE1EUJ2', price= 15.95, currency= 'eur'),
        StoreItem(game_api_id= 2136, name="Parchisi", stripe_price_id= 'price_1RZFrGREEOIw4cHyqjiDNdaR', price= 22.95, currency= 'eur'),
        StoreItem(game_api_id= 6956, name="Creeps' Castle", stripe_price_id= 'price_1RZFs7REEOIw4cHyBdESVyRm', price= 25.99, currency= 'eur'),
        StoreItem(game_api_id= 295293, name="The Thing: The Boardgame", stripe_price_id= 'price_1RZFtKREEOIw4cHy6qA2c9HO', price= 17.95, currency= 'eur'),
        StoreItem(game_api_id= 179601, name="A Game of Thrones: The Card Game (Second Edition) – Taking the Black", stripe_price_id= 'price_1RZFu8REEOIw4cHy87NbhQoo', price= 29.95, currency= 'eur'),
        StoreItem(game_api_id= 13166, name="Let's Go Fishin'", stripe_price_id= 'price_1RZFv0REEOIw4cHyksLfbupN', price= 12.95, currency= 'eur'),
        StoreItem(game_api_id= 259342, name="Luxantis", stripe_price_id= 'price_1RZFw0REEOIw4cHyHSukuWoJ', price= 18.95, currency= 'eur'),
        StoreItem(game_api_id= 3717, name="Rasslefest", stripe_price_id= 'price_1RZFwwREEOIw4cHydM3MdZ5y', price= 15.95, currency= 'eur'),
    ]
    db.session.add_all(games)
    db.session.add_all(store_items)
    db.session.commit()

    return jsonify ({"msg": "okey"})