from app import app
from api.models import db
from seed_data import (
    seed_users, seed_online_games, seed_purchases, seed_online_stats,
    seed_ia_sessions, seed_ia_events, seed_favorites, seed_user_contacts
)
# from api import api

with app.app_context():
    # Borra y recrea las tablas (opcional en desarrollo)
    db.drop_all()
    db.create_all()

    users = seed_users()
    db.session.add_all(users)
    db.session.commit()

    games = seed_online_games()
    db.session.add_all(games)
    db.session.commit()

    purchases = seed_purchases(users)
    db.session.add_all(purchases)
    db.session.commit()

    stats = seed_online_stats(users, games)
    db.session.add_all(stats)
    db.session.commit()

    ia_sessions = seed_ia_sessions(users)
    db.session.add_all(ia_sessions)
    db.session.commit()

    ia_events = seed_ia_events(ia_sessions)
    db.session.add_all(ia_events)
    db.session.commit()

    favorites = seed_favorites(users, games)
    db.session.add_all(favorites)
    db.session.commit()

    contacts = seed_user_contacts(users)
    db.session.add_all(contacts)
    db.session.commit()

    print("✅ Datos de prueba generados exitosamente.")
