## from [] import []
## from [] import []
import os
from flask import Flask, jsonify, render_template, request, make_response
from flask_pymongo import PyMongo
import requests
import json
import pandas as pd


app = Flask(__name__)

@app.route("/")
def index():

    return render_template("index.html")
    





