from flask_mail import Mail
import os

mail = Mail()


def init_mail(app):
    app.config.update(
        MAIL_SERVER='smtp.gmail.com',
        MAIL_PORT=587,
        MAIL_USE_TLS=True,
        MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
        MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
        MAIL_DEFAULT_SENDER= ('RacerGameR', 'racegamer666@gmail.com'),
    )
    mail.init_app(app)

    
