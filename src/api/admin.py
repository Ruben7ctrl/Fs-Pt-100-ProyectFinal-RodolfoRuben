  
import os
from flask_admin import Admin
from .models import db, Users, OnlineGames, Favorites, OnlineStats, UserContacts, IAsessions, IAevents, GamePurchase, StoreItem
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(Users, db.session))
    admin.add_view(ModelView(OnlineGames, db.session))
    admin.add_view(ModelView(Favorites, db.session))
    # admin.add_view(ModelView(Purchases, db.session))
    admin.add_view(ModelView(OnlineStats, db.session))
    admin.add_view(ModelView(UserContacts, db.session))
    admin.add_view(ModelView(IAsessions, db.session))
    admin.add_view(ModelView(IAevents, db.session))
    admin.add_view(ModelView(GamePurchase, db.session))
    # admin.add_view(ModelView(OwnGames, db.session))
    admin.add_view(ModelView(StoreItem, db.session))

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))