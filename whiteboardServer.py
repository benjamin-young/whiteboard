#!/usr/bin/env python

import asyncio
import json
import logging
import websockets

logging.basicConfig()

USERS = set()

VALUE = 0
dataNum = 0
whiteboardData = []

def users_event():
    print(len(USERS))
    return json.dumps({"type": "users", "count": len(USERS)})

def value_event():
    return json.dumps({"type": "value", "value": VALUE})

async def counter(websocket):
    global USERS, VALUE, dataNum
    try:
        # Register user
        USERS.add(websocket)
        websockets.broadcast(USERS, users_event())
        # Send current state to user
        await websocket.send(value_event())
        # Manage state changes
        async for message in websocket:
            dataNum+=1
            event = json.loads(message)
            if event["action"] == "minus":
                VALUE -= 1
                websockets.broadcast(USERS, value_event())
            elif event["action"] == "plus":
                VALUE += 1
                websockets.broadcast(USERS, value_event())
            elif event["action"] == "text":
                print(dataNum)
                print(message)
                whiteboardData.append(message)
            elif event["action"] == "draw":
                #print("hello")
                #print(event)
                print(dataNum)
                print(message)
                whiteboardData.append(message)
                websockets.broadcast(USERS, json.dumps({"action": "broadcast",
                                                        "x_1": event["x_1"], 
                                                        "y_1": event["y_1"],
                                                        "x_2": event["x_2"], 
                                                        "y_2": event["y_2"],}))
            
            else:
                logging.error("unsupported event: %s", event)
    finally:
        # Unregister user
        USERS.remove(websocket)
        websockets.broadcast(USERS, users_event())

async def main():
    async with websockets.serve(counter, "localhost", 6789):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
