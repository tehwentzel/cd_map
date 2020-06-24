class Constants():
    data_root = '../data/'
    
    STATE_FIPS = {
        'AL': '01',
        'AK': '02',
        'AZ': '04',
        'AR': '05',
        'CA': '06',
        'CO': '08',
        'CT': '09',
        'DE': '10',
        'DC': '11',
        'FL': '12',
        'GA': '13',
        'HI': '15',
        'ID': '16',
        'IL': '17',
        'IN': '18',
        'IA': '19',
        'KS': '20',
        'KY': '21',
        'LA': '22',
        'ME': '23',
        'MD': '24',
        'MA': '25',
        'MI': '26',
        'MN': '27',
        'MS': '28',
        'MO': '29',
        'MT': '30',
        'NE': '31',
        'NV': '32',
        'NH': '33',
        'NJ': '34',
        'NM': '35',
        'NY': '36',
        'NC': '37',
        'ND': '38',
        'OH': '39',
        'OK': '40',
        'OR': '41',
        'PA': '42',
        'RI': '44',
        'SC': '45',
        'SD': '46',
        'TN': '47',
        'TX': '48',
        'UT': '49',
        'VT': '50',
        'VA': '51',
        'WA': '53',
        'WV': '54',
        'WI': '55',
        'WY': '56',
        'AS': '60',
        'GU': '66',
        'MP': '69',
        'PR': '72',
        'VI': '78'
    }
    
    CD_FIPS = {
        'At-large': '00'
    }
    
    PARTIES = set(['democrat','republican','libertarian'])
    
    CD_KEYS = {
        'coordinates': 'coordinates',
        'geometry_type': 'geometry_type',
        'ALAND': 'land_area',
        'AWATER': 'water_area',
        'STATEFP': 'state_fips',
        'CD116FP': 'cd_fips',
        'State abbreviation': 'state',
        'State name': 'state_name',
        'Sex_Men_Percent of total': 'percent_male',
        'Sex_Women_Percent of total': 'percent_women',
        'Votes cast for congressional representative for the November 6, 2018 election1': 'votes_cast',
        'Citizen voting- age population2_Estimate': 'voting_age_population',
        'Poverty_Below poverty level_Percent of total': 'poverty_rate',
        "Educational attainment_Bachelor's degree or more_Percent of total": 'percent_bachelors',
        'Educational attainment_High school or more_Percent of total': 'percent_highschool',
        'Age_65 years old and older_Percent of total': 'percent_age_above_65',
        'Age_45-64 years old_Percent of total': 'percent_age_45_64',
        'Age_30-44 years old_Percent of total': 'percent_age_30_44',
        'Age_18-29 years old_Percent of total': 'percent_age_18_29',
    }
    
    COUNTY_KEYS = {
        'coordinates': 'coordinates',
        'geometry_type': 'geometry_type',
        'ALAND': 'land_area',
        'AWATER': 'water_area',
        'STATEFP': 'state_fips',
        'County Name': 'county_name',
        'State': 'state',
        'countyFIPS': 'county_fips',
        'stateFIPS': 'state_fips',
        'COUNTYFP': 'county_fips',
        'NAME': 'county_name'
    }
    
    COUNTY_DEMOGRAPHICS = ['trump16', 'clinton16', 'otherpres16', 
                        'repgov','demgov','othergov',
                        'cvap',
                        'white_pct', 'black_pct','hispanic_pct',
                        'foreignborn_pct',
                        'female_pct',
                        'age29andunder_pct','age65andolder_pct',
                        'median_hh_inc','clf_unemploy_pct',
                        'lesshs_pct','lesscollege_pct',
                        'rural_pct','ruralurban_cc'
                       ]