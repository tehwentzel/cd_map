import * as constants from './Constants';
import Utils from './Utils.js';

export default class DataService {

    constructor(args){
        this.axios = require('axios');
        this.api = this.axios.create({
            baseURL: constants.API_URL,
        })
        this.cache = {};
        this.preloadCache()
    }

    test(){
        this.api.get('/').then((res) => {
            console.log(res);
        })
    }

    async getAvailableDates(useCache){
        if(!useCache || this.cache['availableDates'] === undefined){
            var availableDates = await this.api.get('/available_dates');
            this.cache.availableDates = availableDates.data.results;
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




}