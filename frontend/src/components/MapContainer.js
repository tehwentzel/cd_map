import React from "react";
import * as d3 from "d3";
import Map from './Map'
import './Map.css';
import Utils from '../modules/Utils.js';
import * as constants from '../modules/Constants.js';

export default class MapContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        zoomTransform: null,
        data: {},
        dataAccessor: (d=>d),
        mapColorProps: {}
      };
      this.ref = React.createRef();
      this.zoom = d3.zoom()
                    .scaleExtent([-5, 5])
                    .translateExtent([[-100, -100], [props.width+100, props.height+100]])
                    .extent([[-100, -100], [props.width+100, props.height+100]])
                    .on("zoom", this.zoomed.bind(this))
    }

    static defaultProps = {
        dates: null
    }

    _setRef(componentNode){
        this._rootNode = componentNode;
    }

    componentDidMount() {
        d3.select(this.props.height)
            .call(this.zoom)
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        console.log('update')
        console.log(this.props.mapType + ' ' + this.props.mapVar)
        d3.select(this.refs.svg)
            .call(this.zoom)
        if(this.props.mapType !== prevProps.mapType || this.props.mapVar !== prevProps.mapVar || this.props.dates !== prevProps.dates){
            this.fetchData();
        }
    }

    zoomed() {
      this.setState({ 
        zoomTransform: d3.event.transform
      });
    }

    render() {
        return (
            <Map data={this.state.data} dataAccessor={this.state.dataAccessor} colorProps={this.state.mapColorProps}  zoomTransform = {this.state.zoomTransform}/>
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
        });
    }

    async loadData(){
        var tempData
        switch(this.props.mapType){
            case constants.COUNTY:
                tempData = await this.props.dataService.getFields(constants.COUNTY, constants.COUNTY_FIELDS);
                break
            case constants.DISTRICT:
                tempData = await this.props.dataService.getFields(constants.DISTRICT, constants.DISTRICT_FIELDS);
                break
            default:
                console.log('trying to call mapContainer.loadData with unknown mapType' + this.props.mapType);
                tempData = await this.props.dataService.getFields(constants.COUNTY, constants.COUNTY_FIELDS);
                break
        }
        return tempData;
    }

  }
