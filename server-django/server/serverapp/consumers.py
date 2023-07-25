import json
from channels.generic.websocket import AsyncWebsocketConsumer
""" class LastTradedPriceConsumer(AsyncWebsocketConsumer):
     async def websocket_connect(self, event):
        await self.send({
            "type": "websocket.accept",
        })

     async def websocket_receive(self, event):
        await self.send({
            "type": "websocket.send",
            "text": event["text"],
        }) """
class LastTradedPriceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        

    