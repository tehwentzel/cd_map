from flask import Flask, request, jsonify
from flask_cors import CORS
from Constants import Constants
from Utils import *
from CountyData import *

app = Flask(__name__)
CORS(app)
counties = Countys()
districts = Districts()
covid_data = CovidData()

@app.route('/')
def hello_world():
    return 'hello world'

@app.route('/county_ids', methods=['GET'])
def county_ids():
    county_list = counties.get_all_ids()
    return jsonify(results = county_list)

@app.route('/covid_dates', methods=['GET'])
def covid_dates():
    dates = covid_data.get_avaliable_dates()
    return jsonify(results = dates)

@app.route('/get_fields',methods=['GET','POST'])
def get_fields():
    if request.method == 'POST':
        d = request.get_json()
        topic=d.get('topic','county')
        fields = d.get('fields',None)
        geoids = d.get('geoids',None)
    else:
        topic = request.args.get('topic','county')
        fields = request.args.get('fields',None)
        geoids = request.args.get('geoids',None)
    if topic == 'district':
        db = districts
    elif topic == 'covid':
        db = covid_data
    else:
        db = counties
    output = db.get_fields(ids=geoids,fields=fields)
    return jsonify(results=df_to_json(output))

@app.route('/test_geojson',methods=['GET'])
def get_geojson():
    with open(Constants.test_json, 'r') as f:
        geojson = json.load(f)
        return jsonify(results=geojson)

@app.route('/covid_rates',methods=['GET','POST'])
def covid_rates():
    if request.method == 'POST':
        d = request.get_json()
        date = d.get('date')
        fields = d.get('fields',None)
        geoids = d.get('geoids',None)
    else:
        date = request.args.get('date')
        fields = request.args.get('fields',None)
        geoids = request.args.get('geoids',None)        
    output = covid_data.by_date(date,ids=geoids,fields=fields)
    return jsonify(results=df_to_json(output))