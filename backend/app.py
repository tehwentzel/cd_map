from flask import Flask, request, jsonify
from flask_cors import CORS
from Constants import Constants
from Utils import *
from Stats import *

app = Flask(__name__)
CORS(app)

county_groups = load_county_groups()
with open(Constants.county_group_geojson, 'r') as f:
    county_group_json = json.load(f)
    
@app.route('/')
def hello_world():
    return 'hello world'

@app.route('/county_data',methods=['GET'])
def get_geojson():
    return jsonify(results=county_group_json)
    # geojson = df_to_json(county_groups)
    # return jsonify(results=geojson)

@app.route('/available_dates',methods=['GET'])
def get_available_dates():
    dates = [key for key in county_groups.covid.iloc[0][0].keys()]
    return jsonify(results=dates)
    
@app.route('/test_post',methods=['POST'])
def log_post():
    data = request.get_json()
    print('posted json', data)