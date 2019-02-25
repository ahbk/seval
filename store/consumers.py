from channels.generic.websocket import JsonWebsocketConsumer
from . import models

class TryoutConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()


    def disconnect(self, close_code):
        pass


    def receive_json(self, content):
        fn = models
        for p in content['fn'].split('.'):
            fn = getattr(fn, p)

        content['ok'] = fn(content, self.scope)
        self.send_json(content)
