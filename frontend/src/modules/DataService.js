import * as constants from './Constants';
import Utils from './Utils.js';

export default class DataService {

    constructor(args){
        this.axios = require('axios');
        this.api = this.axios.create({
            baseURL: constants.API_URL
        })
        this.cache = {};
        this.counter = 0;

        //todo.  will implement fetching dates we have covid rates for
        this.availableDates = {
            [constants.COUNTY]: ['4/15/20', '4/29/20', '5/13/20', '5/27/20', '6/10/20'],
            [constants.DISTRICT]: []
        }
    }

    test(){
        this.api.get('/').then((res) => {
            console.log(res);
        })
    }

    getAvailableDates(topic){
        try{
            let dates = this.availableDates[topic];
            return dates;
        }
        catch{
            return []
        }
    }

    checkCache(topic,fields,covidFields,dates){
        //given query, check cache, and return loaded data + unloaded fields
        if(this.cache[topic] === undefined){
            return false
        }
        let subCache = this.cache[topic].postData;
        if(subCache.fields === undefined){
            return false
        }
        for(var field of fields){
            if(!subCache.fields.includes(field)){
                return false
            }
        }
        if(covidFields !== undefined){
            if(subCache.covid_fields === undefined){
                return false
            }
            for(var cField of covidFields){
                if(!subCache.covid_fields.includes(cField)){
                    return false
                }
            }
        }
        if(dates !== undefined){
            if(subCache.dates === undefined){
                return false
            }
            for(var date of dates){
                if(!subCache.dates.includes(date)){
                    return false
                }
            }
        }
        return true
    }

    updateCache(newData, postData){
        this.cache[postData.topic] = {} || this.cache[postData.topic];
        this.cache[postData.topic].data = newData;
        this.cache[postData.topic].postData = postData;
        this.cache[postData.topic].priority = this.counter;
        this.counter++;
        //maybe add something to remove cache items with a low priority here if I get that good enough.
    }

    async getFields(topic,fields,covidFields,dates){
        var isCached = this.checkCache(topic,fields,covidFields,dates);
        if(isCached){
            return this.cache[topic].data;
        }
        var postData = {
            topic: topic,
            fields: fields,
            covid_fields: covidFields,
            dates: dates
        }
        try {
            let response = await this.api.post('/get_fields', postData);
            var responseData = JSON.parse(response.data['results']);
            this.updateCache(responseData, postData);
            return responseData;
        } 
        catch(error) {
            console.log('whut')
            console.error(error);
        }
    }



}