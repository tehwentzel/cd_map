import React from "react";
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from    '@material-ui/core/Tooltip';

// import Container from 'react-bootstrap/Container';
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";
// import Jumbotron from 'react-bootstrap/Jumbotron';

import MapContainer from './components/MapContainer'
import * as constants from './modules/Constants.js';
import DataService from './modules/DataService';
import Utils from './modules/Utils';
import ControlPanel from './components/ControlPanel';

import CssBaseline from '@material-ui/core/CssBaseline';
import "./App.css";

export default class App extends React.Component {

    constructor(props){
        super(props);
        
        this.dataService = new DataService();
        this.dataService.test();

        this.state = {
            name: 'vizAtHome',
            mapVar: this.props.defaultMapVar,
            mapDate: '3/1/20',
            mapIsLoaded: false,
            availableDates: ['3/1/20','4/30/20','7/9/20'],
        }
    }

    static defaultProps = {
        defaultMapVar: 'none'
    }

    componentDidMount(){
        this.dataService.getAvailableDates().then(dates => {
            this.setState({availableDates: dates})
        })
    }

    validateMapVar(){
        //makes sure the selected variable to view in the map is somehting we have data one for the map type
        let validVars = Utils.validMapVars();
        if(!Utils.itemInArray(this.state.mapVar, validVars)){
            this.setState({mapVar: validVars[0]})
        }
    }

    handleMapVarChange(event){
        this.setState({mapVar: event.target.value})
    }

    handleSliderChange(event, newValue){
        this.dataService.getAvailableDates(true).then(dates =>{
            console.log('date change', dates, newValue)
            let newDate = dates[newValue];
            this.setState({mapDate: newDate});
        })
    }


    getDefaultMapDateIdx(availableDates){
        return (availableDates.length > 0)? availableDates.length-1: 0;
    }

    toggleLoading(boolFlag){
        this.setState({mapIsLoaded: boolFlag});
    }

    render(){
        var dateSliderLabel = function(idx){
            let date = this.state.availableDates[idx];
            if(date == this.state.mapDate){
                return date
            } else{
                return ''
            }
        }.bind(this)

        return (
            <div className={'component-app'}>
                <CssBaseline/>
                <Grid container spacing={4}>
                    <AppBar position='static'>
                        <Toolbar variant='dense'>
                            {Utils.unCamelCase(this.state.name)}
                        </Toolbar>
                    </AppBar>
                    <Grid className={'body'} item xs={4}>
                        <ControlPanel
                            disabled={!this.state.mapIsLoaded}
                            mapVar={this.state.mapVar}
                            handleMapVarChange={this.handleMapVarChange.bind(this)}
                        />
                    </Grid>
                    <Grid className={'body'} id={'mapColumn'} container item xs={8}>
                        <Grid item id={'mapBox'} xs={12}>
                            <MapContainer 
                            dataService={this.dataService} 
                            mapIsLoaded={this.state.mapIsLoaded}
                            toggleLoading={this.toggleLoading.bind(this)}
                            mapVar={this.state.mapVar} 
                            mapDate={this.state.mapDate}
                            availableDates={this.state.availableDates}
                            />
                        </Grid>
                        <Grid item m={50} id={'dateSliderBox'} xs={12}>
                            <Slider
                                defaultValue={0}
                                min={0}
                                className={'slider'}
                                disabled={!this.state.mapIsLoaded}
                                max={this.state.availableDates.length -1}
                                marks={Utils.markify(this.state.availableDates, this.state.mapDate)}
                                step={null}
                                valueLabelDisplay='off'
                                onChange={this.handleSliderChange.bind(this)}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Backdrop 
                    className={'backdrop'} 
                    open={!this.state.mapIsLoaded}
                    invisible={this.state.mapIsLoaded}
                >
                    <CircularProgress color='inherit'/>
                </Backdrop>
            </div>
        )
    }
}


