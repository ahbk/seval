from channels.generic.websocket import JsonWebsocketConsumer
from . import models
import json
import traceback

class TryoutConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive_json(self, content):
        content['ok'] = models.process(content, self.scope)

        self.send_json(content)
