import pandas as pd
import numpy as np 
import json
from Constants import Constants

def load_json(string):
    return json.loads(string.replace("\'", "\""))

def load_county_groups():
    county_groups = pd.read_csv(Constants.county_group_csv,index_col=1)
    county_groups.features = county_groups.features.apply(load_json)
    county_groups.county_features = county_groups.county_features.apply(load_json)
    county_groups.covid = county_groups.covid.apply(load_json)
    return county_groups

def df_to_json(df, precision=1):
    return df.reset_index().to_json(orient='records')