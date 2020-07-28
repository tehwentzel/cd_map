import numpy as np
import pandas as pd

def records_to_array(record_list,keys = None):
	#should take a list of dicts from json stuff
	#[{x0: 1, x1: 1...},{x0: 0...}...] -> np.array([[x0,x1,x2...],[ x0...]...]
	if keys is None:
		keys = record_list[0].keys()
	keys=set(keys)
	records = [[v for k,v in entry.items() if k in keys] for entry in record_list]
	return np.array(records)