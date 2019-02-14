from channels.generic.websocket import JsonWebsocketConsumer
from . import models
import json

class TryoutConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive_json(self, content):
        if not self.scope['session'].session_key:
            self.scope['session'].create()

        content['ok'] = str(self.scope['session'].session_key)
        self.send_json(content)
