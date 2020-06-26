import pandas as pd

class Countys():
    
    def __init__(self, root = 'merged_county_data.json'):
        self.data = pd.read_json(root).T
        self.data.index.name = 'GEOID'
        self.data = self.data.sort_index()
    
    def get_all_ids(self):
        return self.data.index.values.astype(int).tolist()