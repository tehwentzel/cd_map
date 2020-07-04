import * as d3 from 'd3';

export default class Utils {

    static signedLog(x){
        return Math.sign(x)*Math.log(Math.abs(x));
    }

}