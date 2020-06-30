import pandas as pd
import json
import numpy as np
from abc import ABC, abstractmethod
from collections.abc import Iterable
from Constants import Constants

class Region(ABC):
    
    def __init__(self, root = Constants.county_demographics_file):
        self.data = self.read_data(root)
        self.fields = set(self.data.columns)
        self.ids = set(self.get_all_ids())
        
    def read_data(self, root):
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
    
    def __init__(self,root=Constants.county_demographics_file):
        super().__init__(root=root)
        
    def read_data(self, root):    
        data = pd.read_json(root).T
        data.index.name = 'GEOID'
        data = data.drop('dates',axis=1).sort_index()
        return data
    
    def get_boundaries(self, ids = None):
        return self.get_fields(ids, 'coordinates')
    
class Districts(Region):

    def __init__(self, root = Constants.congressional_district_file):
        super().__init__(root=root)
        
    def read_data(self, root):    
        data = pd.read_json(root).T
        data.index.name = 'GEOID'
        data = data.sort_index()
        return data

class CovidData(Region):
    
    def __init__(self, root = Constants.covid_case_file):
        super().__init__(root = root) 
        
    def read_data(self, root):
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