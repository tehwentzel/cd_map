from flask import Flask, request, jsonify
from CountyData import Countys

app = Flask(__name__)
counties = Countys()

@app.route('/')
def hello_world():
    return 'hello world'

@app.route('/county_ids', methods=['GET'])
def county_ids():
    county_list = counties.get_all_ids()
    return jsonify(results = county_list)