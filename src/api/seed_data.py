from faker import Faker
from api.models import Users, OnlineGames, OnlineStats, IAsessions, IAevents, Favorites, UserContacts, GamePurchase, StoreItem
from werkzeug.security import generate_password_hash
import random

faker = Faker()

def seed_users():
    users = []
    for _ in range(10):
        user = Users(
            email=faker.unique.email(),
            password=generate_password_hash("password123"),
            username=faker.user_name(),
            firstname=faker.first_name(),
            lastname=faker.last_name(),
            dateofbirth=str(faker.date_of_birth(minimum_age=18, maximum_age=45)),
            phone=faker.phone_number(),
            avatar_image=None,
            is_active=True
        )
        users.append(user)
    return users

# def seed_online_games():
#     games = []
#     for _ in range(10):
#         game = OnlineGames(
#             name=faker.word().capitalize(),
#             description=faker.text(max_nb_chars=200),
#             difficulty_levels=random.choice(["Easy", "Medium", "Hard"])
#         )
#         games.append(game)
#     return games
def seed_online_games():
    games = [
        OnlineGames(name='Ajedrez', description='Sumérgete en el clásico juego de estrategia con Ajedrez Online, una experiencia multijugador diseñada para jugadores de todos los niveles. Enfréntate a la inteligencia artificial avanzada, perfecciona tus habilidades, y sigue tu progreso en estadísticas detalladas.', difficulty_levels='Hard'),
        OnlineGames(name='Tres en Raya', description='Tres en Raya es el clásico juego de lógica y estrategia que nunca pasa de moda. El objetivo es sencillo: alinea tres símbolos iguales en una fila, columna o diagonal antes que tu oponente. Juega contra la inteligencia artificial o desafía a tus amigos en partidas rápidas, ideales para momentos de ocio.', difficulty_levels='Easy'),
        OnlineGames(name='Hundir la flota', description='	Hundir la flota, también conocido como Battleship, es un juego clásico de estrategia naval para dos jugadores. El objetivo del juego es localizar y hundir todos los barcos del oponente antes de que él hunda los tuyos.', difficulty_levels='Medium')
    ]

    return games

# def seed_purchases(users):
#     purchases = []
#     for _ in range(10):
#         purchase = Purchases(
#             amount=random.randint(5, 100),
#             payment_method=random.choice(["Credit Card", "PayPal", "Crypto"]),
#             status=random.choice(["Completed", "Pending", "Failed"]),
#             user_purchase=random.choice(users)
#         )
#         purchases.append(purchase)
#     return purchases

# def seed_online_stats(users, games):
#     stats = []
#     for _ in range(10):
#         stat = OnlineStats(
#             sessions_played=random.randint(1, 20),
#             wins=random.randint(0, 10),
#             stalemate=random.randint(0, 5),
#             losses=random.randint(0, 10),
#             user_stats=random.choice(users),
#             online_game_stats=random.choice(games)
#         )
#         stats.append(stat)
#     return stats

def seed_ia_sessions(users):
    sessions = []
    for _ in range(5):
        session = IAsessions(
            title=faker.sentence(nb_words=3),
            description=faker.text(),
            genre=random.choice(["Fantasy", "Sci-Fi", "Mystery"]),
            difficulty_levels=random.choice(["Easy", "Medium", "Hard"]),
            character_name=faker.first_name(),
            character_class=random.choice(["Warrior", "Mage", "Rogue"]),
            experience_gained=random.randint(0, 1000),
            story_branch=faker.sentence(),
            result=random.choice(["Victory", "Defeat", "Neutral"]),
            user_iasessions=random.choice(users)
        )
        sessions.append(session)
    return sessions

def seed_ia_events(sessions):
    events = []
    for session in sessions:
        for _ in range(1):  # 1 evento por sesión
            event = IAevents(
                chapter_number=random.randint(1, 5),
                decision=faker.sentence(),
                description=faker.text(),
                outcome=random.choice(["Success", "Failure"]),
                session=session
            )
            events.append(event)
    return events

def seed_favorites(users, games):
    favorites = []
    for _ in range(10):
        user1 = random.choice(users)
        # game_api_id = random.choice(games)
        # user2 = random.choice(users)
        # while user1.id == user2.id:
        #     user2 = random.choice(users)
        fav = Favorites(
            user1=user1,
            # user2=user2,
            game_api_id=faker.random_element(g.id for g in games),
            onlinegamesFav=random.choice(games),
            game_type=random.choice(["videogames", "boardgames"])
        )
        favorites.append(fav)
    return favorites

def seed_user_contacts(users):
    contacts = []
    for _ in range(10):
        user = random.choice(users)
        contact = random.choice(users)
        while user.id == contact.id:
            contact = random.choice(users)
        user_contact = UserContacts(
            user_cont=user,
            contact_user_id=contact.id
        )
        contacts.append(user_contact)
    return contacts

def seed_game_purchases():
    game_purchases = []
    for _ in range(10):
        purchase = GamePurchase(
            game_api_id=random.randint(1, 1000),
            name=faker.word().capitalize(),
            stripe_price_id=f"price_{faker.lexify(text='??????')}",
            amount_paid=random.randint(10, 60),
            currency=random.choice(["eur", "usd"]),
            purchased_at=faker.date_time_this_year()
        )
        game_purchases.append(purchase)
    return game_purchases

# def seed_own_games(users, game_purchases):
#     own_games = []
#     for _ in range(10):
#         user = random.choice(users)
#         purchase = random.choice(game_purchases)
#         own = OwnGames(
#             user_id=user.id,
#             purchase_id=purchase.id,
#             acquired_at=faker.date_time_between(start_date=purchase.purchased_at)
#         )
#         own_games.append(own)
#     return own_games

def seed_store_items():
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
    return store_items