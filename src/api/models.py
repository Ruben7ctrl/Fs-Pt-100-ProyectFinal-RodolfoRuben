from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import List

db = SQLAlchemy()

class Users(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(350), nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True ,nullable=True)
    firstname: Mapped[str] = mapped_column(String(80), nullable=True)
    lastname: Mapped[str] = mapped_column(String(90), nullable=True)
    dateofbirth: Mapped[str] = mapped_column(nullable=True)
    phone: Mapped[str] = mapped_column(nullable=True)
    avatar_image: Mapped[str] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    favorite1: Mapped[List["Favorites"]] = relationship("Favorites", back_populates="user1", foreign_keys=lambda: [Favorites.user1_id])
    # favorite2: Mapped[List["Favorites"]] = relationship("Favorites", back_populates="user2", foreign_keys=lambda: [Favorites.user2_id])

    purchases: Mapped[List["Purchases"]] = relationship(back_populates="user_purchase")

    usercontact: Mapped[List["UserContacts"]] = relationship("UserContacts", back_populates="user_cont", foreign_keys="UserContacts.user_id")

    online_stats: Mapped[List["OnlineStats"]] = relationship(back_populates="user_stats")

    ia_sessions: Mapped[List["IAsessions"]] = relationship(back_populates="user_iasessions")

    owned_games: Mapped[list["OwnGames"]] = relationship(back_populates="user")


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "firstname": self.firstname if self.firstname else None,
            "lastname": self.lastname if self.lastname else None,
            "dateofbirth": self.dateofbirth if self.dateofbirth else None,
            "phone": self.phone if self.phone else None,
            "favorite1": [fav.serialize() for fav in self.favorite1],
            # "favorite2": [fav.serialize() for fav in self.favorite2],
            "usercontact": [cont.serialize() for cont in self.usercontact],
            "online_stats": [stats.serialize() for stats in self.online_stats],
            "ia_sessions": [ia.serialize() for ia in self.ia_sessions],
            "owned_games": [own.serialize() for own in self.owned_games],
        }
    

class OnlineGames(db.Model):
    __tablename__ = "onlinegames"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(70), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    difficulty_levels: Mapped[str] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)

    favourite: Mapped[List["Favorites"]] = relationship(back_populates="onlinegamesFav")

    online_stats: Mapped[List["OnlineStats"]] = relationship(back_populates="online_game_stats")


    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description if self.description else None,
            "difficulty_levels": self.difficulty_levels if self.difficulty_levels else None,
            "created_at": self.created_at.isoformat(),
            "favourite": [fav.serialize() for fav in self.favourite],
            "online_stats": [stats.serialize() for stats in self.online_stats]
        }
    

class Purchases(db.Model):
    __tablename__ = "purchases"
    id: Mapped[int] = mapped_column(primary_key=True)
    amount: Mapped[int] = mapped_column(nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=True)
    purchased_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user_purchase: Mapped["Users"] = relationship(back_populates="purchases")

    # storegame_id: Mapped[int] = mapped_column(ForeignKey(".id"), nullable=False)
    # storegamepay: Mapped["Users"] = relationship(back_populates="purchases")    


    def serialize(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "payment_method": self.payment_method,
            "status": self.status if self.status else None,
            "purchased_at": self.purchased_at.isoformat(),
            "user_purchase": self.user_purchase.username,
        }
    

class OnlineStats(db.Model):
    __tablename__ = "onlinestats"
    id: Mapped[int] = mapped_column(primary_key=True)
    sessions_played: Mapped[int] = mapped_column(nullable=False)
    wins: Mapped[int] = mapped_column(nullable=False)
    stalemate: Mapped[int] = mapped_column(nullable=False)
    losses: Mapped[int] = mapped_column(nullable=False)
    move_count: Mapped[int] = mapped_column(nullable=False, default=0)
    last_played: Mapped[datetime] = mapped_column(DateTime(), default=datetime.utcnow)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user_stats: Mapped["Users"] = relationship(back_populates="online_stats")

    online_game_id: Mapped[int] = mapped_column(ForeignKey("onlinegames.id"))
    online_game_stats: Mapped["OnlineGames"] = relationship(back_populates="online_stats")


    def serialize(self):
        return {
            "id": self.id,
            "sessions_played": self.sessions_played,
            "wins": self.wins if self.wins else None,
            "stalemate": self.stalemate if self.stalemate else None,
            "losses": self.losses if self.losses else None,
            "move_count": self.move_count,
            "last_played": self.last_played.isoformat(),
            "user_stats": self.user_stats.username,
            "online_game_stats": self.online_game_stats.name
        }
    

class IAsessions(db.Model):
    __tablename__ = "iasessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(60), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    genre: Mapped[str] = mapped_column(String(60), nullable=True)
    difficulty_levels: Mapped[str] = mapped_column(String(60), nullable=True)
    character_name: Mapped[str] = mapped_column(String(60), nullable=False)
    character_class: Mapped[str] = mapped_column(String(60), nullable=False)
    experience_gained: Mapped[int] = mapped_column(nullable=True)
    story_branch: Mapped[str] = mapped_column(String(200), nullable=True)
    result: Mapped[str] = mapped_column(String(60), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)
    ended_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user_iasessions: Mapped["Users"] = relationship(back_populates="ia_sessions")

    # inspiration_game_id: Mapped[int] = mapped_column(ForeignKey(".id"), nullable=False)
    # inspiration_game: Mapped["StoreGames"] = relationship(back_populates="ia_sessions")

    ia_events: Mapped[List["IAevents"]] = relationship(back_populates="session")


    def serialize(self):
        return {
            "id": self.id,
            "title": self.title if self.title else None,
            "description": self.description if self.description else None,
            "genre": self.genre if self.genre else None,
            "difficulty_levels": self.difficulty_levels if self.difficulty_levels else None,
            "character_name": self.character_name if self.character_name else None,
            "character_class": self.character_class,
            "experience_gained": self.experience_gained if self.experience_gained else None,
            "story_branch": self.story_branch if self.story_branch else None,
            "result": self.result if self.result else None,
            "started_at": self.started_at.isoformat(),
            "ended_at": self.ended_at.isoformat(),
            "user_IAsesions": self.user_iasessions.username,
            "ia_events": [ia.serialize() for ia in self.ia_events],
        }
    

class IAevents(db.Model):
    __tablename__ = "iaevents"
    id: Mapped[int] = mapped_column(primary_key=True)
    chapter_number: Mapped[int] = mapped_column(nullable=True)
    decision: Mapped[str] = mapped_column(String(400), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    outcome: Mapped[str] = mapped_column(String(400), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)

    sessions_id: Mapped[int] = mapped_column(ForeignKey("iasessions.id"), nullable=False)
    session: Mapped["IAsessions"] = relationship(back_populates="ia_events")

    def serialize(self):
        return {
            "id": self.id,
            "chapter_number": self.chapter_number,
            "decision": self.decision,
            "description": self.description,
            "outcome": self.outcome,
            "created_at": self.created_at.isoformat(),
            "character_name": self.session.character_name if self.session else None,
        }


class Favorites(db.Model):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(primary_key=True)
    user1_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    # user2_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    onlinegame_id: Mapped[int] = mapped_column(ForeignKey("onlinegames.id"), nullable=True)
    game_api_id: Mapped[int] = mapped_column(nullable=True)


    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)

    user1: Mapped["Users"] = relationship(back_populates="favorite1", foreign_keys=[user1_id])
    # user2: Mapped["Users"] = relationship(back_populates="favorite2", foreign_keys=[user2_id])
    onlinegamesFav: Mapped["OnlineGames"] = relationship(back_populates="favourite")
    # storegamesFAv: Mapped[""] = relationship(back_populates="favourite")


    def serialize(self):
        return {
            "id": self.id,
            "user1_id": self.user1_id,
            # "user2_id": self.user2_id,
            "game_api_id": self.game_api_id,
            "onlinegame_id": self.onlinegame_id,
            # "storegames_id": self.storegames_id,
            "user1": self.user1.username if self.user1 else None,
            # "user2": self.user2.username if self.user2 else None,
            "onlinegamesFav": self.onlinegamesFav.name if self.onlinegamesFav else None,
            # "storegamesFav": self.storegamesFav.name if self.storegamesFav.name else None,
            "created_at": self.created_at.isoformat(),
        }
    

class UserContacts(db.Model):
    __tablename__ = "usercontacts"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    contact_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    user_cont: Mapped["Users"] = relationship("Users", back_populates="usercontact", foreign_keys=[user_id])


    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "contact_user_id": self.contact_user_id,
            "created_at": self.created_at.isoformat(),
        }
    

class GamePurchase(db.Model):
    __tablename__ = "game_purchase"
    id: Mapped[int] = mapped_column(primary_key=True)
    game_api_id: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    stripe_price_id: Mapped[str] = mapped_column(String(100), nullable=False)
    amount_paid: Mapped[int] = mapped_column(nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="eur")
    purchased_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.utcnow)


    owners: Mapped[list["OwnGames"]] = relationship(back_populates="purchase")


    def serialize(self):
        return {
            "id": self.id,
            "game_api_id": self.game_api_id,
            "name": self.name,
            "stripe_price_id": self.stripe_price_id,
            "amount_price": self.amount_paid,
            "currency": self.currency,
            "purchased_at": self.purchased_at.isoformat()
        }
    
    
class StoreItem(db.Model):
    __tablename__ = "store_item"
    id: Mapped[int] = mapped_column(primary_key=True)
    game_api_id: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    stripe_price_id: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[int] = mapped_column(nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="eur")


    def serialize(self):
        return {
            "id": self.id,
            "game_api_id": self.game_id,
            "name": self.name,
            "stripe_price_id": self.stripe_price_id,
            "price": self.price,
            "currency": self.currency,
        }
    

class OwnGames(db.Model):
    __tablename__ = "owngames"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    purchase_id: Mapped[int] = mapped_column(ForeignKey("game_purchase.id"), nullable=False)
    acquired_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.utcnow)

    
    user: Mapped["Users"] = relationship(back_populates="owned_games")
    purchase: Mapped["GamePurchase"] = relationship(back_populates="owners")


    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "purchase": self.purchase,
            "acquired_at": self.acquired_at.isoformat()
        }
