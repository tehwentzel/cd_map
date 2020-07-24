import * as constants from './Constants';
import Utils from './Utils';

export default class CountyStats {

    constructor(props){
        this.props = props
    }

    static getAccessor(key, date){
        var accessor;

        switch(key){
            case 'none':
                accessor = d=>0;
                break;
            case 'voting':
                accessor = CountyStats.getNetDemVotes;
                break;
            case 'income':
                accessor = CountyStats.getMedianIncome;
                break;
            case 'tweetsPerCapita':
                accessor = function(d){
                    var tweets = CountyStats.getTweetCount(d);
                    var pop = CountyStats.getCountyPopulation(d);
                    return tweets/pop;
                };
                break;
            case 'casesPerCapita':
                var accessor = function(d){
                    let val = CountyStats.covidData(d,'cases',date)
                    var pop = CountyStats.getCountyPopulation(d);
                    return 100*val/pop
                }.bind(date);
                break;
            case 'deathsPerCapita':
                var accessor = function(d){
                    let val = CountyStats.covidData(d,'deaths',date)
                    var pop = CountyStats.getCountyPopulation(d);
                    return 100*val/pop
                }.bind(date);
                break
        }
        return accessor
    }
    
    static getCountyPopulation(data){
        return parseInt(data.cvap)
    }

    static getNetDemVotes(data){
        var netClinton = parseFloat(data.net_dem_president_votes);
        var netDemGov = parseFloat(data.net_dem_gov_votes);
        var votes = 0;
        if(!isNaN(netClinton)){
            votes = netClinton;
        }
        else if(!isNaN(netDemGov)){
            votes = netDemGov;
        }
        return votes
    }

    static getMedianIncome(d){
        return parseInt(d.median_hh_inc)
    }

    static getTweetCount(d){
        return parseInt(d.tweet_users)
    }

    static covidData(d, key, date){
        let covid = d.covid[date]
        return covid[key]
    }

    static groupCovidData(cgData, key, date){
        var total = 0;
        for(var countyPoint of cgData.counties){
            total += CountyStats.covidData(countyPoint, key, date);
        }
        return total
    }

    static countyGroupPopulation(cgData){
        var totalCVAP = 0;
        var nCounties = cgData.counties.length
        for(var countyPoint of cgData.counties){
            totalCVAP += CountyStats.getCountyPopulation(countyPoint);
        }
        return totalCVAP
    }

    static countyGroupMedianIncome(cgData){
        var income = cgData.counties.map(CountyStats.getMedianIncome)
        return Utils.mean(income).toFixed(0)
    }

    static countyGroupTweetCount(cgData){
        var tweets = cgData.counties.map(CountyStats.getTweetCount);
        return Utils.sum(tweets)
    }

    static groupNetDemVotes(cgData){
        var netVotes = cgData.counties.map(CountyStats.getNetDemVotes)
        return Utils.sum(netVotes)
    }

    static addToolTipStats(startString, cgData){
        var counties = Utils.countyGroupStats(cgData);
        return startString + '</br>' + 'Total Pop: ' + counties.totalCVAP;
    }

    static getSingleCountyToolTip(data, mapVar, date){
        var population = CountyStats.getCountyPopulation(data);
        var cases = CountyStats.covidData(data, 'cases', date);
        var deaths = CountyStats.covidData(data, 'deaths', date);
        var tweets = CountyStats.getTweetCount(data);
        var netDemVotes = CountyStats.getNetDemVotes(data);
        var income = CountyStats.getMedianIncome(data);

        return CountyStats.formatTTips(population,cases,deaths,tweets,netDemVotes,income);
    }

    static getGroupToolTip(data, mapVar, date){
        var population = CountyStats.countyGroupPopulation(data);
        var cases = CountyStats.groupCovidData(data, 'cases', date);
        var deaths = CountyStats.groupCovidData(data, 'deaths', date);
        var tweets = CountyStats.countyGroupTweetCount(data);
        var netDemVotes = CountyStats.groupNetDemVotes(data);
        var income = CountyStats.countyGroupMedianIncome(data);

        return CountyStats.formatTTips(population,cases,deaths,tweets,netDemVotes,income);
    }

    static formatTTips(population,cases,deaths,tweets,netDemVotes,income){
        var format = function(d,digits){ return Utils.numberWithCommas(d) + '(' + (100*d/population).toFixed(digits) + '%)'}.bind(population);
        var string = 'Population: ' + Utils.numberWithCommas(population);
        string += '</br>';
        string += 'Cases: ' + format(cases,1);
        string += '</br>';
        string += 'Deaths: ' + format(deaths,1);
        string += '</br>';
        string += 'Tweets: ' + format(tweets,1);
        string += '</br>';
        if(netDemVotes > 0){
            string += 'Votes(D): ' + format(netDemVotes,1);
        } else{
            string += 'Votes(R): ' + format(Math.abs(netDemVotes),1);
        }
        string += '</br>';
        string += 'Median Income: $' + Utils.numberWithCommas(income);
        return string;
    }

}
