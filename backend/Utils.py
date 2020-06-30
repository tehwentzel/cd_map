import pandas as pd
import numpy as np 

def df_to_json(df):
    return df.reset_index().to_json(orient='records')