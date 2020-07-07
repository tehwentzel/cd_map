from flask import Flask, request, jsonify
from flask_cors import CORS
from Constants import Constants
from Utils import *
from CountyData import *

app = Flask(__name__)
CORS(app)
counties = Countys()
districts = Districts()

@app.route('/')
def hello_world():
    return 'hello world'

@app.route('/county_ids', methods=['GET'])
def county_ids():
    county_list = counties.get_all_ids()
    return jsonify(results = county_list)

@app.route('/get_fields',methods=['POST'])
def get_fields():
    d = request.get_json()
    topic=d.get('topic','county')
    fields = d.get('fields',None)
    geoids = d.get('geoids',None)
    covid_fields = d.get('covid_fields',None)
    dates = d.get('dates', None)
    if topic == 'district':
        db = districts
    else:
        db = counties
    output = db.get_fields(ids=geoids,fields=fields,covid_fields = covid_fields,dates=dates)
    return jsonify(results=df_to_json(output))

@app.route('/test_geojson',methods=['GET'])
def get_geojson():
    with open(Constants.test_json, 'r') as f:
        geojson = json.load(f)
        return jsonify(results=geojson)