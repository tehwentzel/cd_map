import React from "react";
import * as d3 from "d3";
import Map from './Map';
import './Map.css';
import '../App.css'
import Utils from '../modules/Utils.js';
import CountyStats from '../modules/CountyStats';
// import * as constants from '../modules/Constants.js';

export default class MapContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: {},
        dataAccessor: d=>d.GEOID,
        dataAggregator: Utils.mean,
        dataScaler: (d=>d),
        mapColorProps: {},
        spikeColors: MapContainer.defaultSpikeConfig,
        dataWeightAccessor: (d=>1),
      };
    }

    static defaultSpikeConfig = {
        fill: 'yellow',
        stroke:'black',
        fillOpacity: .95,
        strokeOpacity: 1
    }

    componentDidMount() {
        this.getConfig();
    }

    componentDidUpdate(prevProps) {
        let propsToCheck = ['mapVar','mapDate','mapSpikeVar','secondaryVar'];
        let needsUpdate = false;
        for(let prop of propsToCheck){
            if(this.props[prop] !== prevProps[prop]){
                needsUpdate = true;
                break;
            }
        }
        let arrKeys = ['data', 'activeCountyGroups', 'availableDates'];
        for(let key of arrKeys){
            if(prevProps[key] === undefined & this.props[key] !== undefined){
                needsUpdate = true;
                break;
            } else if(prevProps[key].length !== this.props[key].length){
                needsUpdate = true;
                break;
            }
        }
        if(needsUpdate){
            this.getConfig();
        }
    }

    render() {
        return (
            <div className='mapContainer'>
                <h2 className='flex-center'>{Utils.unCamelCase(this.props.mapVar)}</h2>
                <Map data={this.props.data} 
                mapDate = {this.props.mapDate} 
                mapVar = {this.props.mapVar}
                secondaryVar={this.props.secondaryVar}
                // dataAccessor={this.state.dataAccessor} 
                dataScaler={this.state.dataScaler}
                // dataAggregator={this.state.dataAggregator}
                activeCountyGroups={this.props.activeCountyGroups}
                toggleActiveCountyGroups={this.props.toggleActiveCountyGroups}
                toggleLoading={this.props.toggleLoading}
                dataService={this.props.dataService}
                spikeVar={this.props.mapSpikeVar}
                spikeColors={this.state.spikeColors}
                // dataWeightAccessor={this.state.dataWeightAccessor}
                colorProps={this.state.mapColorProps}/>
            </div>
          )
    }

    getConfig(){
        //defaults
        var config = CountyStats.getVarConfig(this.props.mapVar, this.props.mapDate);
        var scaler = config.scaler;
        var aggregator = config.aggregator;
        var accessor = config.accessor;
        var weightAccessor = config.weightAcessor;

        //color properties, unique the the map
        var colorProps = {
            interpolator: d3.interpolateGreys,
            divergent: false,
            symmetric:false,
            empty: false
        };
        var spikeColors = MapContainer.defaultSpikeConfig;

        switch(this.props.mapVar){
            //special colorscheme as it's divergemnt red/blue
            case 'voting':
                colorProps = {
                    interpolator: d3.interpolateRdBu,
                    divergent: true,
                    symmetric: true,
                }
                spikeColors = {
                    fill: 'black',
                    stroke:'black',
                    fillOpacity: .90,
                    strokeOpacity: 1
                }
                break;
            //twitter colors
            case 'tweets':
            case 'tweetsPerCapita':
                colorProps = {
                    interpolator: d3.interpolateBlues,
                    divergent: false,
                    symmetric: false,
                    min: 0,
                }
                spikeColors = {
                    fill: 'orange',
                    stroke:'black',
                    fillOpacity: .90,
                    strokeOpacity: 1
                }
                break;
            //orange = bad-sh
            case 'casesPerCapita':
                colorProps = {
                    interpolator: d3.interpolateOrRd,
                    divergent: false,
                    symmetric: false,
                    min: 0
                }
                spikeColors = {
                    fill: 'black',
                    stroke:'black',
                    fillOpacity: .90,
                    strokeOpacity: 1
                }
                break;
            //red bc bad
            case 'deathsPerCapita':
                colorProps = {
                    interpolator: d3.interpolateReds,
                    divergent: false,
                    symmetric: false,
                    min: 0
                }
                spikeColors = {
                    fill: 'black',
                    stroke:'black',
                    fillOpacity: .90,
                    strokeOpacity: 1
                }
                break;
            case 'none':
            case 'lowEducation':
            case 'poverty':
            case 'unemployment':
            case 'underRepresentedMinorities':
            case 'income':
                break;
            default:
                console.log('invalid var passed to map container', this.props.mapVar);
                colorProps = {empty: true}
                break;
        } 
            this.setState({
                mapColorProps: colorProps, 
                dataAccessor: accessor, 
                dataAggregator: aggregator, 
                dataScaler: scaler,
                spikeColors: spikeColors,
                dataWeightAcessor: weightAccessor,
            });
    }

  }
