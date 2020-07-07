export const COUNTY = 'county';
export const DISTRICT = 'district';
export const COVID = 'covid';

export const COUNTY_FIELDS = ['features','trump16','clinton16','cvap','clf_unemploy_pct'];
export const DISTRICT_FIELDS = ['features','democrat_votes','republican_votes','libertarian_votes','poverty_rate'];
export const COVID_FIELDS = ['deaths','cases'];

export const COUNTY_MAP_VARS = ['voting','deathsPerCapita','deathsPerCase','unemployement','deaths','cases','casesPerCapita'];
export const DISTRICT_MAP_VARS = ['voting','unemployement']

export const API_URL = 'http://localhost:5000/';