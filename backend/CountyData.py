import pandas as pd
import json
import numpy as np
from abc import ABC, abstractmethod
from collections.abc import Iterable
from Constants import Constants

class Region(ABC):
    
    def __init__(self, root = Constants.county_demographics_file, map_file = None):
        self.data = self.read_data(root, map_file)
        self.fields = set(self.data.columns)
        self.ids = set(self.get_all_ids())
        
    def read_data(self, root, map_file):
        return pd.read_json(root)
    
    def validate(self, id_list, axis = 0):
        if axis != 0 and axis != 1:
            return False
        if isinstance(id_list, str) or (not isinstance(id_list, Iterable)):
            id_list = [id_list]
        reference = self.ids if axis == 0 else self.fields
        return [i for i in id_list if i in reference]
    
    def get_all_ids(self):
        return self.data.index.values.astype(int).tolist()
    
    def defaults(self, ids, fields):
        if fields is None:
            fields = list(self.fields)
        else:
            fields = self.validate(fields, axis=1)
        if ids is None:
            ids = list(self.ids)
        else:
            ids = self.validate(ids)
        return ids, fields
    
    def get_fields(self, ids = None, fields = None, covid_fields = None, dates=None):
        ids,fields = self.defaults(ids,fields)
        return self.data.loc[ids,fields]
    
    
class Countys(Region):
    
    def __init__(self,
                 root=Constants.county_demographics_file, 
                 map_file = Constants.county_border_file,
                 premerge_covid = True,
                 **covid_kwargs):
        super().__init__(root=root)
        self.covid_data = CovidData(**covid_kwargs)
        self.premerge_covid = premerge_covid
        if premerge_covid:
            self.data = self.covid_data.add_fields(self.data)
        
    def read_data(self, root, map_file):    
        data = pd.read_json(root).T
        data.index.name = 'GEOID'
        data = data.drop(['dates','coordinates','geometry_type'],axis=1).sort_index()
        
        ids = data.index.values.astype(int).tolist()
        geojson = self.read_map_data(set(ids), map_file)
        geojson.index.name = "GEOID"
        data = data.merge(geojson,on='GEOID')
        return data
    
    def read_map_data(self, valid_geoids, map_file = None):
        if map_file is None:
            map_file = Constants.county_border_file
        with open(map_file,'r', encoding = 'latin1') as f:
            cg = json.load(f)
        
        valid_regions = []
        gids = []
        for region in cg['features']:
            props = region['properties']
            gid = int(props['STATE'] + props['COUNTY'])
            if gid not in valid_geoids:
                continue
            entry = {'geometry': region['geometry'], 'type': region['type']}
            entry['properies'] = {'GEOID': gid}
            valid_regions.append(entry)
            gids.append(gid)
        map_df = pd.DataFrame(index = gids)
        map_df['features'] = valid_regions
        return map_df
    
    def get_avaliable_dates(self):
        return self.covid_data.get_avaliable_dates()
    
    def get_fields(self,ids=None, fields=None, covid_fields = None, dates=None):
        ids, fields = self.defaults(ids,fields)
        if covid_fields is not None and self.premerge_covid:
            fields = fields + ['covid']
        subset = self.data.loc[ids,fields]
        if covid_fields is not None and not self.premerge_covid:
            subset = self.covid_data.add_fields(subset,dates=dates,fields=covid_fields)
        return subset
        
class Districts(Region):

    def __init__(self, root = Constants.congressional_district_file, map_file= Constants.district_border_file):
        super().__init__(root=root, map_file = map_file)
        
    def read_data(self, root, map_file):    
        data = pd.read_json(root).T
        data.index.name = 'GEOID'
        data = data.sort_index().drop(['coordinates','geometry_type'],axis=1)
        
        ids = data.index.values.astype(int).tolist()
        geojson = self.read_map_data(set(ids), map_file)
        geojson.index.name = "GEOID"
        data = data.merge(geojson,on='GEOID')
        return data
        
    def read_map_data(self, valid_geoids, map_file = None):
        if map_file is None:
            map_file = Constants.county_border_file
        with open(map_file,'r', encoding = 'latin1') as f:
            cg = json.load(f)
        
        valid_regions = []
        gids = []
        for region in cg['features']:
            props = region['properties']
            gid = int(props['GEOID'])
            if gid not in valid_geoids:
                continue
            entry = {'geometry': region['geometry'], 'type': region['type']}
            entry['properies'] = {'GEOID': gid}
            valid_regions.append(entry)
            gids.append(gid)
        map_df = pd.DataFrame(index = gids)
        map_df['features'] = valid_regions
        return map_df

class CovidData(Region):
    
    default_fields = ['cases','deaths']
    
    def __init__(self, root = Constants.covid_case_file):
        super().__init__(root = root, map_file=None) 
        
    def read_data(self, root, map_file):
        data = pd.read_csv(root).set_index('GEOID')
        return data
    
    def get_avaliable_dates(self):
        return sorted(np.unique(self.data.date))
    
    def add_fields(self, 
                   base_df = None,
                   ids = None, 
                   dates = None, 
                   fields = None, 
                   name = 'covid'):
        covid_dict ={}
        if fields is None:
            fields = CovidData.default_fields
        for i,v in self.data.groupby('GEOID'):
            if ids is not None and i not in ids:
                continue
            if dates is not None:
                v = v[v['date'].isin(dates)]
            d = v.loc[:,['date'] + fields].to_dict(orient='record')
            covid_dict[i] = {name: d}
        data = pd.DataFrame(covid_dict).T
        data.index.name = 'GEOID'
        if base_df is not None:
            return base_df.merge(data, on='GEOID')
        return data
    
    def by_date(self, date, ids = None, fields = None):
        if ids is None:
            ids = self.ids
        else:
            ids = self.validate(ids)
        if fields is None:
            fields = CovidData.default_fields
        else:
            fields = self.validate(fields,axis=1)
        if not isinstance(date, Iterable) or isinstance(date,str):
            subset = self.data[self.data.date == date]
        else:
            subset = self.data[self.data.date.isin(date)]
        return subset.loc[ids,fields]
    
def to_coords(df):
    n_coords = df.counter.sum()
    coords = np.zeros((n_coords, 2))
    pos = 0
    for dummy,row in df.iterrows():
        count = int(row.counter)
        coords[pos:pos+count,:] = row.loc[['long1','lat1']].values
        pos += count
    return coords

def load_tweet_coords(files = None, join = True, months = None):
    if files is None:
        files = Constants.tweet_files
    point_data = {}
    for key, file in files.items():
        if months is not None and key not in months:
            continue
        df = pd.read_csv(file).rename({'long1': 'lon', 'lat1': 'lat', 'counter': 'counts'},axis=1)
        point_data[key] = df.loc[:,['lon','lat','counts']].to_dict(orient='records')
    if join:
        joinedData = []
        for key, vals in point_data.items():
            joinedData.extend(vals)
        return joinedData
    return point_data

def load_tweets():
    with open(Constants.tweet_data,'r') as f:
        tweets = json.load(f)
        return tweets