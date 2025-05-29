from faker import Faker
from api.models import Users, OnlineGames, Purchases, OnlineStats, IAsessions, IAevents, Favorites, UserContacts
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

def seed_online_games():
    games = []
    for _ in range(10):
        game = OnlineGames(
            name=faker.word().capitalize(),
            description=faker.text(max_nb_chars=200),
            difficulty_levels=random.choice(["Easy", "Medium", "Hard"])
        )
        games.append(game)
    return games

def seed_purchases(users):
    purchases = []
    for _ in range(10):
        purchase = Purchases(
            amount=random.randint(5, 100),
            payment_method=random.choice(["Credit Card", "PayPal", "Crypto"]),
            status=random.choice(["Completed", "Pending", "Failed"]),
            user_purchase=random.choice(users)
        )
        purchases.append(purchase)
    return purchases

def seed_online_stats(users, games):
    stats = []
    for _ in range(10):
        stat = OnlineStats(
            sessions_played=random.randint(1, 20),
            wins=random.randint(0, 10),
            stalemate=random.randint(0, 5),
            losses=random.randint(0, 10),
            user_stats=random.choice(users),
            online_game_stats=random.choice(games)
        )
        stats.append(stat)
    return stats

def seed_ia_sessions(users):
    sessions = []
    for _ in range(10):
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
        user2 = random.choice(users)
        while user1.id == user2.id:
            user2 = random.choice(users)
        fav = Favorites(
            user1=user1,
            user2=user2,
            onlinegamesFav=random.choice(games)
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
