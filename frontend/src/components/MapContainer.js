import React from "react";
import * as d3 from "d3";
import Map from './Map';
import './Map.css';
import '../App.css'
import Utils from '../modules/Utils.js';
import CountyStats from '../modules/CountyStats';
import * as constants from '../modules/Constants.js';

export default class MapContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: {},
        dataAccessor: d=>d.GEOID,
        dataAggregator: Utils.mean,
        dataScaler: (d=>d),
        mapColorProps: {},
        dataWeightAccessor: (d=>1),
      };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        let propsToCheck = ['mapVar','availableDates','mapDate'];
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
                <Map data={this.state.data} 
                mapDate = {this.props.mapDate} 
                mapVar = {this.props.mapVar}
                dataAccessor={this.state.dataAccessor} 
                dataScaler={this.state.dataScaler}
                dataAggregator={this.state.dataAggregator}
                dataWeigthAccessor={this.state.dataWeigthAccessor}
                colorProps={this.state.mapColorProps}/>
            </div>
          )
    }

    fetchData(){
        //send flag to parent that it's loading
        this.props.toggleLoading(false)
        //defaults

        var scaler = (d => d);  //should be a transform on any final data
        var aggregator = Utils.mean.bind(Utils); //how to aggregate data in county groups
        var colorProps = {empty: false};
        var weightAccessor = CountyStats.getCountyPopulation;
        // var toolTipFormatter = d=> 'ID: ' + d.groupId;

        //not a default
        var accessor = CountyStats.getAccessor(this.props.mapVar, this.props.mapDate); //gets the field from the json file
        switch(this.props.mapVar){
            case 'voting':
                scaler = Utils.signedLog.bind(Utils);
                aggregator = Utils.sum.bind(Utils);
                colorProps = {
                    interpolator: d3.interpolateRdBu,
                    divergent: true,
                    symmetric: true,
                }
                break;

            case 'income':
                scaler = Math.log;
                aggregator = Utils.mean.bind(Utils);
                colorProps = {
                    interpolator: d3.interpolateYlGn,
                    divergent: false,
                    symmetric: false,
                }
                break;
            case 'tweetsPerCapita':
                scaler = d=> d**.25;
                aggregator = Utils.sum.bind(Utils);
                colorProps = {
                    interpolator: d3.interpolateBlues,
                    divergent: false,
                    symmetric: false,
                    min: 0,
                }
                break;
            case 'casesPerCapita':
                scaler = d=>d**.25;
                aggregator = Utils.mean.bind(Utils);
                colorProps = {
                    interpolator: d3.interpolateOrRd,
                    divergent: false,
                    symmetric: false,
                    min: 0
                }
                break;
            case 'deathsPerCapita':
                scaler = d=>d**.25;
                aggregator = Utils.mean.bind(Utils);
                colorProps = {
                    interpolator: d3.interpolateReds,
                    divergent: false,
                    symmetric: false,
                    min: 0
                }
                break;
            default:
                console.log('invalid var passed to map container', this.props.mapVar);
                colorProps = {empty: true}
                break;
        } 
        this.loadData().then((d) => {
            this.setState({
                mapColorProps: colorProps, 
                data: d, 
                dataAccessor: accessor, 
                dataAggregator: aggregator, 
                dataScaler: scaler,
                dataWeightAcessor: weightAccessor,
            });
            this.props.toggleLoading(true);
        });
    }

    async loadData(){
        var tempData = await this.props.dataService.getMapData(true);
        return tempData
    }

  }
