import React from "react";
import * as d3 from "d3";
import Map from './Map';
import './Map.css';
import '../App.css'
import Utils from '../modules/Utils.js';
import * as constants from '../modules/Constants.js';

export default class MapContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: {},
        dataAccessor: (d=>d),
        mapColorProps: {}
      };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        let propsToCheck = ['mapType','mapVar','availableDates','mapDate'];
        let needsUpdate = false;
        for(let prop of propsToCheck){
            if(this.props[prop] !== prevProps[prop]){
                needsUpdate = true;
                break;
            }
        }
        if(needsUpdate){
            this.fetchData();
        }
    }

    render() {
        return (
            <div className='mapContainer'>
                <h2 className='flex-center'>{Utils.unCamelCase(this.props.mapVar)}</h2>
                <Map data={this.state.data} dataAccessor={this.state.dataAccessor} colorProps={this.state.mapColorProps}/>
            </div>
          )
    }

    fetchData(){
        var accessor = (d => d);
        var colorProps = {}
        switch(this.props.mapType + this.props.mapVar){
            case constants.COUNTY + 'voting':
                accessor = (d) => Utils.signedLog(d.clinton16 - d.trump16);
                colorProps = {
                    interpolator: d3.interpolateRdBu,
                    divergent: true,
                    symmetric: true
                }
                break;
            case constants.COUNTY + 'unemployement':
                accessor = (d) => (d.clf_unemploy_pct);
                colorProps = {
                    interpolator: d3.interpolateGreys,
                    divergent: false,
                    symmetric: false
                }
                break;
            case constants.COUNTY + 'deaths':
                accessor = (d) => Math.log(d[constants.COVID][0].deaths + 1)
                colorProps = {
                    interpolator: d3.interpolatePurples,
                    divergent: false,
                    symmetric: false
                }
                break;
            case constants.COUNTY + 'deathsPerCapita':
                accessor = function(d){
                    let val = d[constants.COVID];
                    val = val.filter(d => d.date === this.props.mapDate)
                    return val[0].deaths/d.cvap
                }
                accessor = accessor.bind(this)
                // accessor = (d) => Math.sqrt(d[constants.COVID][0].deaths/d.cvap);
                colorProps = {
                    interpolator: d3.interpolateGreens,
                    divergent: false,
                    symmetric: false
                }
                break;
            case constants.COUNTY + 'deathsPerCase':
                accessor = function(d){
                    let val = d[constants.COVID];
                    val = val.filter(d => d.date === this.props.mapDate)
                    return val[0].deaths/val[0].cases
                }
                accessor = accessor.bind(this)
                colorProps = {
                    interpolator: d3.interpolateReds,
                    divergent: false,
                    symmetric: false
                }
                break;
            case constants.COUNTY + 'cases':
                accessor = function(d){
                    let val = d[constants.COVID];
                    val = val.filter(d => d.date === this.props.mapDate)
                    return val[0].cases;
                }
                accessor = accessor.bind(this)
                colorProps = {
                    interpolator: d3.interpolateBlues,
                    divergent: false,
                    symmetric: false
                }
                break;
            case constants.COUNTY + 'casesPerCapita':
                accessor = function(d){
                    let val = d[constants.COVID];
                    val = val.filter(d => d.date === this.props.mapDate)
                    return val[0].cases/d.cvap;
                }
                accessor = accessor.bind(this)
                colorProps = {
                    interpolator: d3.interpolateBlues,
                    divergent: false,
                    symmetric: false
                }
                break;
            case constants.DISTRICT+'voting':
                accessor = (d) => Utils.signedLog(d.democrat_votes - d.republican_votes);
                colorProps = {
                    interpolator: d3.interpolateRdBu,
                    divergent: true,
                    symmetric: true
                }
                break;
            case constants.DISTRICT +'unemployement':
                console.log('Warning: district unemployment not implemented, using poverty rate')
                accessor = (d) => Math.log(d.poverty_rate);
                colorProps = {
                    interpolator: d3.interpolateGreys,
                    divergent: false,
                    symmetric: false
                }
                break;
            default:
                console.log('Map.js is trying to use and unknown encoding type ' + this.props.encodingType + ' defaulting to assuming its a variable')
                accessor = (d=>d[this.props.encodingType]);
                colorProps = {
                    divergent: false,
                    symmetric: false
                }
                break;
        } 
        this.loadData().then((d) => {
            this.setState({mapColorProps: colorProps, data: d, dataAccessor: accessor});
            console.log('fetchmap data',d)
        });
    }

    async loadData(){
        var tempData
        switch(this.props.mapType){
            case constants.COUNTY:
                tempData = await this.props.dataService.getFields(constants.COUNTY, 
                    constants.COUNTY_FIELDS, 
                    constants.COVID_FIELDS, 
                    this.props.availableDates);
                break
            case constants.DISTRICT:
                tempData = await this.props.dataService.getFields(constants.DISTRICT, 
                    constants.DISTRICT_FIELDS);
                break
            default:
                console.log('trying to call mapContainer.loadData with unknown mapType' + this.props.mapType);
                tempData = await this.props.dataService.getFields(constants.COUNTY, constants.COUNTY_FIELDS);
                break
        }
        return tempData;
    }

  }
