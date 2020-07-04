import * as constants from './Constants';

export default class DataService {

    constructor(args){
        this.axios = require('axios');
        this.api = this.axios.create({
            baseURL: constants.API_URL
        })
        // this.preloadData();
    }

    test(){
        this.api.get('/').then((res) => {
            console.log(res);
        })
    }

    async getFields(topic,fields,dates){
        let post_data = {
            'topic': topic,
            'fields': fields,
            'dates': dates
        }
        try {
            let response = await this.api.post('/get_fields', post_data);
            var responseData = JSON.parse(response.data['results'])
            return responseData;
        } 
        catch(error) {
            console.error(error);
        }
    }

    // async preloadData(){
    //     //loads a bunch of county distrcit and covid data?
    //     var newData = {}
    //     newData[constants.COUNTY] = await this.get_region_data(constants.COUNTY,constants.COUNTY_FIELDS);
    //     newData[constants.DISTRICT] =  await this.get_region_data(constants.DISTRICT,constants.DISTRICT_FIELDS);
    //     newData[constants.COVID] = await this.get_region_data(constants.COVID,constants.COVID_FIELDS);
    //     this.data = newData;
    // }

}