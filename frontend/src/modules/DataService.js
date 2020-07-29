import * as constants from './Constants';
import CountyStats from './CountyStats';
// import Utils from './Utils.js';

export default class DataService {

    constructor(args){
        this.axios = require('axios');
        this.api = this.axios.create({
            baseURL: constants.API_URL,
        })
        this.cache = {maxCovid: {}};
        this.preloadCache()
    }

    test(testData){
        if(testData == undefined){
            this.api.get('/').then((res) => {
                console.log(res);
            })
        } 
        else{
            //this.api.post('/test_post')
        }
        
    }

    async getAvailableDates(useCache){
        if(!useCache || this.cache['availableDates'] === undefined){
            var availableDates = await this.api.get('/available_dates')
            availableDates = availableDates.data.results;
            availableDates.sort((a,b) => Date.parse(a) - Date.parse(b));
            this.cache.availableDates = availableDates;
            // console.log('dates', this.cache.availableDates)
            return this.cache.availableDates
        } else{
            return this.cache.availableDates
        }
        
    }

    async getMapData(useCache){
        if(!useCache || this.cache['mapData'] === undefined){
            var mapData = await this.api.get('/county_data');
            this.cache.mapData = mapData.data.results;
            return this.cache.mapData
        } else{
            return this.cache.mapData
        }
    }

    async preloadCache(){
        this.getMapData(false).then(res => {
            this.getAvailableDates(false);
        });
    }

    maxGroupCovid(groupData, key, useCache = true){
        if(this.cache.availableDates === undefined){
            return 0
        }
        if(this.cache.maxCovid[key] === undefined || !useCache){
            var covidPerCapita = function(d,key,date){
                let covid = CountyStats.groupCovidData(d,key,date);
                return covid/CountyStats.countyGroupPopulation(d)
            }
            let dates = this.cache.availableDates;
            var maxVal = 0;
            for(const date of dates){
                let covidValues = groupData.map(d=>covidPerCapita(d,key,date));
                for(var value of covidValues){
                    maxVal = (value > maxVal)? value: maxVal;
                }
            }
            this.cache.maxCovid[key] = maxVal
        } 
        console.log('max', this.cache.maxCovid[key])
        return this.cache.maxCovid[key]
    }

}