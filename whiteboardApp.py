from flask import Flask
from flask import render_template,jsonify
import random
import asyncio
import json
import logging
import websockets


app=Flask(__name__,template_folder='template')

links = {}

USERS = set()

@app.route("/")
def index(name=None):
    return render_template('index.html')

@app.route("/getLink")
def genlink(name=None):
    linkNum = random.randint(0,100)
    links.update({linkNum:1})
    print(links)
    return jsonify({"url": str(linkNum)})


@app.route("/<int:num>")
def whiteboard(num):
    print(num)
    if(num in links):
        return render_template('whiteboard.html')
    else:
        return render_template('404.html')


def users_event():
    print(len(USERS))
    return json.dumps({"type": "users", "count": len(USERS)})

