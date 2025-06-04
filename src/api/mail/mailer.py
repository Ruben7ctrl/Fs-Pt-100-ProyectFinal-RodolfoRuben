from flask_mail import Message
from api.mail.mail_config import mail
from flask import jsonify
import os


def send_mail(address, token):
    
    try:
        msg = Message("Reset your password",
                      recipients=[address])
        
        if os.getenv("FLASK_DEBUG") == "1":
            msg.html = f'''<a href= "https://zany-fortnight-4jv64j66gv992qg5r-3000.app.github.dev/reset-password?token={token}">Hola, sigue este vinculo para resetear tu contraseña</a>'''
        else:
            msg.html = f'''<a href= "{os.getenv("VITE_BACKEND_URL")}/reset-password?token={token}">Hola, sigue este vinculo para resetear tu contraseña</a>'''

        
        mail.send(msg)
        return {"success": True, "msg": "correo enviado exitosamente"}
    
    except Exception as e:
        return {"success": False, "msg": "error al enviar el correo" + str(e)}