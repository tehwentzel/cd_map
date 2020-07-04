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
    
    def get_fields(self, ids = None, fields = None):
        if fields is None:
            fields = list(self.fields)
        else:
            fields = self.validate(fields, axis=1)
        if ids is None:
            ids = list(self.ids)
        else:
            ids = self.validate(ids)
        return self.data.loc[ids,fields]
    
    
class Countys(Region):
    
    def __init__(self,root=Constants.county_demographics_file, map_file = Constants.county_border_file):
        super().__init__(root=root, map_file = map_file)
        
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
                print(props)
                continue
            entry = {'geometry': region['geometry'], 'type': region['type']}
            entry['properies'] = {'GEOID': gid}
            valid_regions.append(entry)
            gids.append(gid)
        map_df = pd.DataFrame(index = gids)
        map_df['features'] = valid_regions
        return map_df
    
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
                print(props)
                continue
            entry = {'geometry': region['geometry'], 'type': region['type']}
            entry['properies'] = {'GEOID': gid}
            valid_regions.append(entry)
            gids.append(gid)
        map_df = pd.DataFrame(index = gids)
        map_df['features'] = valid_regions
        return map_df

class CovidData(Region):
    
    def __init__(self, root = Constants.covid_case_file):
        super().__init__(root = root, map_file=None) 
        
    def read_data(self, root, map_file):
        data = pd.read_csv(root).set_index('GEOID')
        return data
    
    def get_avaliable_dates(self):
        return sorted(np.unique(self.data.date))
    
    def by_date(self, date, ids = None, fields = None):
        if ids is None:
            ids = self.ids
        else:
            ids = self.validate(ids)
        if fields is None:
            fields = ['cases','deaths']
        else:
            fields = self.validate(fields,axis=1)
        if not isinstance(date, Iterable) or isinstance(date,str):
            subset = self.data[self.data.date == date]
        else:
            subset = self.data[self.data.date.isin(date)]
        return subset.loc[ids,fields]