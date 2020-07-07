import * as constants from './Constants';

export default class Utils {

    static signedLog(x){
        return Math.sign(x)*Math.log(Math.abs(x));
    }

    static emptyObject(obj){
        //checks if something is == {}, bascially
        return (obj.constructor === Object && Object.keys(obj).length === 0)
    }

    static itemInArray(item, targetArray){
        for(let target of targetArray){
            console.log(item, target)
            if(item === target){
                return true
            }
        }
        return false
    }

    static validMapVars(mapType){
        return (mapType === constants.COUNTY)? constants.COUNTY_MAP_VARS : constants.DISTRICT_MAP_VARS;
    }

    static arrayUnions(...arrays){
        //should, in theory, join a list of arrays.  May not work
        var newArray = [];
        if(arrays.length === 1){
            return arrays[0];
        }
        for(var arr in arrays){
            newArray.concat( arr[1].filter(x => (!newArray.includes(x)) ));
        }
        return newArray
    }

    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    static unCamelCase(string){
        //converts camelCase to Camel Case.  For like, showing names
        //taken from https://stackoverflow.com/a/6229124
        try{
            var newString = string.replace(/([a-z])([A-Z])/g, '$1 $2')  //insert spaces
                .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3') //space before last upper in a sequence fellowed by lower
                .replace(/^./, function(str){ return str.toUpperCase(); });  //uppercase first character
            return newString
        }catch{
            return ''
        }
    }

    static unSnakeCase(string){
        //should convert snake-case to Snake Case.  untested. based on unCamelCase
        try{
            var newString = string.toLowerCase()
                .replace(/([a-z])-([a-z])/g, '$1 $2') 
                .replace(/^./, function(str){ return str.toUpperCase(); });
            return newString;
        } catch{
            return '';
        }
    }

    static markify(stringArray){
        //converts array of things to a discrete format to use in sliders and maybe other stuff
        let stepSize = 100/(stringArray.length - 1);
        let currStep = 0;
        var markArray = [];
        for(var val in stringArray){
            let newEntry = {
                value: val,
                label: stringArray[val]
            }
            markArray.push(newEntry)
            currStep = currStep + stepSize;
        }
        return markArray;
    }
}