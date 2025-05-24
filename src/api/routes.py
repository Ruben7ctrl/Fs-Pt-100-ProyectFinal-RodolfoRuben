"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, OnlineGames, Favorites, OnlineStats, Purchases, UserContacts, IAsessions, IAevents
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select, or_
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


# @api.route('/hello', methods=['POST', 'GET'])
# def handle_hello():

#     response_body = {
#         "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
#     }

#     return jsonify(response_body), 200


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
            email = data["email"],
            password = hashed_password,
            username = data.get("username"),
            firstname = data.get("firstname", None) ,
            lastname = data.get("lastname", None),
            dateofbirth = data.get("dateofbirth", None),
            phone = data.get("phone", None),
            avatar_image = data.get("avatar_image", None),
            is_active = True
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
        
        stmt = select(Users).where(or_(Users.email == data["identify"], Users.username == data["identify"]))
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

# @api.route('/users', methods=['POST'])
# def create_user():
#     data = request.get_json()
#     if not data or "email" not in data or "password" not in data or "username" not in data:
#         return jsonify({"error": "Missing Data"}), 404
    

#     new_user = Users(
#         email = data["email"],
#         password = data["password"],
#         username = data["username"],
#         firstname = data.get("firstname", None) ,
#         lastname = data.get("lastname", None),
#         dateofbirth = data.get("dateofbirth", None),
#         phone = data.get("phone", None),
#         avatar_image = data.get("avatar_image", None),
#         is_active = True
#     )

#     db.session.add(new_user)
#     db.session.commit()
#     return jsonify(new_user.serialize()), 201


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
def get_online_games():

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
        user_stats = db.session.execute(stmt).scalar_one_or_none()
        if user_stats is None:
            return jsonify({"error": "User stats not Found"}), 400

        return jsonify(user_stats.serialize()), 200
    
    except Exception as e:
        print(e)
        return jsonify({"error": "somthing went wrong with user stats"})


@api.route('/onlinegames/<int:id>/stats', methods=['GET'])
@jwt_required()
def get_game_stats(id):
    try:
        
        stmt = select(OnlineStats).where(OnlineStats.online_game_id == id)
        onlinegame_stats = db.session.execute(stmt).scalar_one_or_none()
        if onlinegame_stats is None:
            return jsonify({"error": "User stats not Found"}), 400

        return jsonify(onlinegame_stats.serialize()), 200
    
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
        if not data or "character_class" not in data or "character_name" not in data or "user_id" not in data:
            return jsonify({"error": "Missing data"}), 400

        new_ia_session = IAsessions(
            title=data.get("title", None),
            description=data.get("description", None),
            genre=data.get("genre", None),
            difficulty_levels=data.get("difficulty_levels", None),
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
        ia_session.description = data.get("description", ia_session.description)
        ia_session.genre = data.get("genre", ia_session.genre)
        ia_session.difficulty_levels = data.get(
            "difficulty_levels", ia_session.difficulty_levels)
        ia_session.character_name = data.get(
            "character_name", ia_session.character_name)
        ia_session.character_class = data.get(
            "character_class", ia_session.character_class)
        ia_session.experience_gained = data.get(
            "experience_gained", ia_session.experience_gained)
        ia_session.story_branch = data.get("story_branch", ia_session.story_branch)
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


@api.route('/ia_sessions/<int:id>/events', methods=['GET'])
@jwt_required()
def get_ia_events(id):
    try:

        stmt = select(IAevents).where(IAevents.sessions_id == id)
        ia_events = db.session.execute(stmt).scalar().all()
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


@api.route('/ia_sessions/<int:id>/events', methods=['POST'])
@jwt_required()
def create_ia_events(id):
    try:

        data = request.get_json()
        if not data or "decision" not in data or "description" not in data or "outcome" not in data:
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

        ia_events.chapter_number = data.get("chapter_number", ia_events.chapter_number)
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


@api.route('/purchases', methods=['GET'])
@jwt_required()
def get_purchases():
    try:

        stmt = select(Purchases)
        purchases = db.session.execute(stmt).scalars().all()
        return jsonify([money.serialize() for money in purchases]), 200
    
    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong get purchases"})


@api.route('/purchases/<int:id>', methods=['GET'])
@jwt_required()
def get_one_purchases(id):
    try:

        stmt = select(Purchases).where(Purchases.id == id)
        purchases = db.session.execute(stmt).scalar_one_or_none()
        if purchases is None:
            return jsonify({"error": "Purchases not found"}),  400
        
        return jsonify(purchases.serialize()), 200
    
    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong purchase"})


@api.route('/purchases', methods=['POST'])
@jwt_required()
def create_purchases():
    try:

        data = request.get_json()
        if not data or "amount" not in data or "payment_method" not in data or "user_id" not in data:
            return jsonify({"error": "Missing data"}), 400
        
        new_purchases = Purchases(
            amount = data["amount"],
            payment_method = data["payment_method"],
            status = data.get("status", None),
            user_id= data["user_id"]
        )

        db.session.add(new_purchases)
        db.session.commit()

        return jsonify(new_purchases.serialize()), 201
    
    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong create purchase"})


@api.route('/users/<int:id>/purchases', methods=['GET'])
@jwt_required()
def get_user_purchases(id):
    try:

        stmt = select(Purchases).where(Purchases.user_id == id)
        user_purchases = db.session.execute(stmt).scalars().all()
        if user_purchases is None:
            return jsonify({"error": "Purchases not found"}),  400
        
        return jsonify([user.serialize() for user in user_purchases]), 200
    
    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong user purchases"})


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
        user2_id = data.get('user2_id')
        onlinegame_id = data.get('onlinegame_id')
        if not user1_id or not user2_id or not onlinegame_id:
            return jsonify({"error": "User1 ID, User2 ID or OnlineGAme ID is required"}), 404
        
        user1 = db.session.get(Users, user1_id)
        if not user1:
            return jsonify({"error": "User1 not found"}), 404

        user2 = db.session.get(Users, user2_id)
        if not user2:
            return jsonify({"error": "User2 not found"}), 404
        
        onlinegame = db.session.get(OnlineGames, onlinegame_id)
        if not onlinegame:
            return jsonify({"error": "Online Game not found"}), 404
        
        new_favorite = Favorites(
            user1_id = user1_id,
            user2_id = user2_id,
            onlinegame_id = onlinegame_id,
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