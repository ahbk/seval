from django.conf.urls import url
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack
from . import consumers


application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(SessionMiddlewareStack(
        URLRouter(
            [
                url(r'^tryout/$', consumers.TryoutConsumer),
            ]
        )
    ))
})
