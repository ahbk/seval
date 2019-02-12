from channels.generic.websocket import WebsocketConsumer
import json

class TryoutConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        self.send(text_data=json.dumps(text_data_json))
