#### Overview
This directory contains resources for county and district-level borders and demographics in a format that should be easier to write d3 code around.

Both files are json files where each index is a FIPS code.  County-level data uses a 5 digit FIPS code that is the concatenation of the state (2 digits) and county (2 digits), while congressional districts use a 4 digit code (2 digit state + 2 digit congressional district).  All codes should be unique.

#### Shared Fields
Shared fields are based on border data taken from [2018 Census data](https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html)
 * coordinates : a set of 1 or more lists of lat/longitude coordinates taken from the geojson file of district/county borders.  Shapes have been simplified to save size
 * geometry_type : either 'Polygon' if coordinates contains a single set of coordinates, or 'Multipolygon' if coordinates contains of list of polygons to plot.
 * land_area: Total area of the bordered region that is land (TODO: figure out units)
 * water_area: Total area that is water
 * state_fips : 2-digit FIPS code for containing state
 * state : 2-letter abbreviation of the state
 * 
#### congressional_district_data.json
This mainly contains voting data taken from the us 2018 midterm elections.  Demographics are taken from [census data](https://www.census.gov/data/tables/time-series/demo/voting-and-registration/congressional-voting-tables.html) while actual votes are taken from [MIT's data lab](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/IG0UN2)
##### Fields
 * state_name : full name of containing state
 * cd_fips : 2 digit FIPS code for the district
 * totalvotes : estimated number of votes counted
 * democrat_votes : total votes for a democratic candidate
 * republican_votes
 * libertarian_votes : included as they have a small representation in congress
 * other_votes : votes for anyone not listed as a democrat/republican or libertarian.
 * votes_cast : number of votes cast for a congressional representative on Nov 6, 2018
 * voting_age_population
 * poverty_rate : % people below poverty level
 * percent_male : % of population that is (says sex/men which is a little vague)
 * percent_women : I named these inconsistently.  
 * percent_bachelors : people with at least a bachelors
 * percent_highschool : people with at least highschool level education
 * percent_age_above_65
 * percent_age_45_64 : population of people 45-64
 * percent_age_30_44 : people age 30-44
 * percent_age _18_29 :people age 18-28

#### county_2018.json
This contains unofficial voting data which was compiled from [MIT's dataverse](https://github.com/MEDSL/2018-elections-unoffical/blob/master/election-context-2018.md) on per-county voting data on 2016 presidential election results, governer elections, and some demographic data.  Covid data on reported cases and reported deaths are taken from [usafacts.org](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/).  If not otherwise states, most demographics were compiled from ACS 5 year estimates from 2012-2016.

##### Fields
* ##### date_data : a dictionary of date-index (eg '2/03/2018') dates with two sub-keys: deaths and cases.  Data is taken (as of writing) starting 4/1 in two-week intervals (to conserve space).
	* deaths : usafacts confirmed covid-related deaths
	* cases : confirmed covid cases
* trump16 : votes for trump in 2016.  taken from [MIT election data lab](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ)
* clinton16 : votes for hillary clinton
* otherpres16 : votes for anyone else
* repgov : votes for the governer in 2016, or 2014 if 2016 data is unavaliable.  sometimes missing.  Taken from [Stephen pettigrew dataverse](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/MLLQDH)
* demgov 
* othergov
* cvap : voting age population in 2016 election
* white_pct
* black_pct
* hispanic_pct
* foreignborn_pct
* femlae_pct
* age29andunder_pct
* age65andolder_pct
* median_hh_inc : median household income (2-16 inflation adjusted dollars)
* clf_unemploy_pct : unemployed population in percentage
* lesshs_pct : population without a highschool degree
* lesscollege : population without a college degree
* rural_pct : rural population
* ruralurban_cc : rural-urban continuum codes (2013) from the [USDA Economic Research service](https://www.ers.usda.gov/data-products/rural-urban-continuum-codes/).  1 is very city, 9 is most rural.
