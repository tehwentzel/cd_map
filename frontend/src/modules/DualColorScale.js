import * as d3 from 'd3';
import CountyStats from './CountyStats';
import Utils from './Utils';
import textures from 'textures';
import { quantile, qunatileRank } from 'simple-statistics';

export default class DualColorScale {

    constructor(groupData, primaryVar, secondaryVar, date){
        this.activePrimary = primaryVar !== 'none';
        this.activeSecondary = secondaryVar !== 'none';
        this.primarySingleAccessor = CountyStats.getAccessor(primaryVar, date)
        this.secondarySingleAccessor = CountyStats.getAccessor(secondaryVar, date)
        this.primaryGroupAccessor = CountyStats.getGroupAccessor(primaryVar, date)
        this.secondaryGroupAccessor = CountyStats.getGroupAccessor(secondaryVar, date)
        this.scales = this._getDomain(groupData, this.primaryGroupAccessor, this.secondaryGroupAccessor);

        this.backupScale = this.getBackupScale(groupData, this.primaryGroupAccessor, primaryVar)
    }

    static getInterpolator(varType){
        switch(varType){
            case 'voting':
                return d3.interpolateRdBu;
            case 'cases':
            case 'casesPerCapita':
            case 'deaths':
            case 'deathsPerCapita':
                return d3.interpolateReds;
            case 'tweets':
                return d3.interpolateBuPu;
            default:
                return d3.interpolateGreys;
        }
    }

    getBackupScale(cgData, accessor, varType){
        var scaledAccessor = d => accessor(d)**.25;
        var vals = cgData.map(scaledAccessor);
        var extents = d3.extent(vals);
        var interpolator = DualColorScale.getInterpolator(varType)
        var scale = d3.scaleSequential()
            .domain(extents)
            .interpolator(interpolator)
        console.log('extents',extents, scale(-.5), scale(0), scale(.5))
        return d=> scale(d**.25)
    }

    _getDomain(cgData, primaryAccessor, secondaryAccessor){
        var domains = [];
        let primaryQuantiles = Utils.quantiles(cgData.map(primaryAccessor), 30);
        let secondaryQuantiles = Utils.quantiles(cgData.map(secondaryAccessor), 30);
        let pRange = Utils.arrange(0.1, 1, primaryQuantiles.length);
        let sRange = Utils.arrange(0.1, 1, secondaryQuantiles.length);
        console.log('quantiles', primaryQuantiles, pRange)

        let pScale = d3.scaleLinear()
            .domain(primaryQuantiles)
            .range(pRange)

        // let pScale = d3.scaleSequential
        //     .domain([0,1])
        //     .interpolator(pS);

        let sScale = d3.scaleLinear()
            .domain(secondaryQuantiles)
            .range(sRange)

        var scales = [pScale, sScale];
        return scales
    }

    interpolate(pVal, sVal){
        var rgb = d3.rgb(0, pVal*200, sVal*200);
        let color = d3.hsl(rgb);
        // color.s = color.s*(.5 + .5*pVal*sVal);
        color.l = .9 - .9*pVal*sVal;
        return color.toString()
    }

    getGroupColor(cgData){
        if(!this.activePrimary){
            return 'white'
        } else if(!this.activeSecondary){
            return this.backupScale(this.primaryGroupAccessor(cgData))
        }
        var primaryVal = this.scales[0](this.primaryGroupAccessor(cgData));
        var secondaryVal = this.scales[1](this.secondaryGroupAccessor(cgData));
        return this.interpolate(primaryVal, secondaryVal)
    }

    getCountyColor(data){
        if(!this.activePrimary){
            return 'white'
        } else if(!this.activeSecondary){
            return this.backupScale(this.primarySingleAccessor(data))
        }
        var primaryVal = this.scales[0](this.primarySingleAccessor(data));
        var secondaryVal = this.scales[1](this.secondarySingleAccessor(data));
        return this.interpolate(primaryVal, secondaryVal)
    }
}