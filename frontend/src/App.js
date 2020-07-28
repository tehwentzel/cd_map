import React from "react";
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
// import Tooltip from    '@material-ui/core/Tooltip';

import MapContainer from './components/MapContainer'
// import * as constants from './modules/Constants.js';
import DataService from './modules/DataService';
import Utils from './modules/Utils';
import ControlPanel from './components/ControlPanel';
import CovidTimeLine from './components/CovidTimeLine';

import CssBaseline from '@material-ui/core/CssBaseline';
import "./App.css";
import CountyStats from "./modules/CountyStats";

export default class App extends React.Component {

    constructor(props){
        super(props);
        
        this.dataService = new DataService();
        this.dataService.test();

        this.state = {
            mapData: {},
            name: 'vizAtHome',
            mapVar: this.props.defaultMapVar,
            mapDate: '3/1/20',
            mapIsLoaded: false,
            mapSpikeVar: this.props.defaultMapSpikeVar,
            availableDates: ['3/1/20','4/30/20','7/9/20'],
            activeCountyGroups: [],
        }
    }

    static defaultProps = {
        defaultMapVar: 'none',
        defaultMapSpikeVar: 'cases'
    }

    componentDidMount(){
        this.dataService.getMapData(true).then(data =>{
            this.dataService.getAvailableDates().then(dates => {
                this.setState({mapData: data, availableDates: dates, mapIsLoaded: true})
            })
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

    toggleActiveCountyGroups(clickedGroup){
        let active = this.state.activeCountyGroups.slice();
        let idx = active.indexOf(clickedGroup);
        if(idx === -1){
            active.push(clickedGroup);
        } else{
            active.splice(idx,1);
        }
        this.setState({activeCountyGroups: active})
    }

    handleMapSpikeVarChange(event){
        this.setState({mapSpikeVar: event.target.value})
    }

    resetActiveCountys(){
        this.setState({activeCountyGroups: []})
    }

    setAllCountiesActive(){
        var allCountyGroups = this.state.mapData.map(d=>CountyStats.getCountyGroup(d));
        this.setState({activeCountyGroups: allCountyGroups});
    }

    handleSliderChange(event, newValue){
        this.dataService.getAvailableDates(true).then(dates =>{
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

    async loadData(){
        var tempData = await this.props.dataService.getMapData(true);
        return tempData;
    }

    render(){

        return (
            <div className={'component-app'}>
                <CssBaseline/>
                <Grid container spacing={4}>
                    <AppBar position='static'>
                        <Toolbar variant='dense'>
                            {Utils.unCamelCase(this.state.name)}
                        </Toolbar>
                    </AppBar>
                    <Grid container item className={'body'} xs={4}>
                        <Grid item id={'controlPanel'} s={12}>
                            <ControlPanel
                                disabled={!this.state.mapIsLoaded}
                                mapVar={this.state.mapVar}
                                mapSpikeVar={this.state.mapSpikeVar}
                                resetActiveCountys={this.resetActiveCountys.bind(this)}
                                setAllCountiesActive={this.setAllCountiesActive.bind(this)}
                                handleMapVarChange={this.handleMapVarChange.bind(this)}
                                handleMapSpikeVarChange={this.handleMapSpikeVarChange.bind(this)}
                            />
                        </Grid>
                        <Grid item id={'secondaryChart'} mt={10} s={12}>
                            <CovidTimeLine 
                                dataService={this.dataService} 
                                mapVar={this.state.mapVar} 
                                covidVar={this.state.mapSpikeVar}
                                mapSpikeVar={this.state.mapSpikeVar}
                                activeCountyGroups={this.state.activeCountyGroups}
                                mapIsLoaded={this.state.mapIsLoaded}
                                data={this.state.mapData}
                                availableDates={this.state.availableDates}
                                mapDate={this.state.mapDate}
                            />
                        </Grid>
                    </Grid>
                    <Grid className={'body'} id={'mapColumn'} container item xs={8}>
                        <Grid item id={'mapBox'} xs={12}>
                            <MapContainer 
                            dataService={this.dataService} 
                            mapIsLoaded={this.state.mapIsLoaded}
                            toggleLoading={this.toggleLoading.bind(this)}
                            mapVar={this.state.mapVar} 
                            mapSpikeVar={this.state.mapSpikeVar}
                            activeCountyGroups={this.state.activeCountyGroups}
                            toggleActiveCountyGroups={this.toggleActiveCountyGroups.bind(this)}
                            mapDate={this.state.mapDate}
                            data={this.state.mapData}
                            availableDates={this.state.availableDates}
                            />
                        </Grid>
                        <Grid item m={0} mt={4} id={'dateSliderBox'} xs={12}>
                            <Typography
                                align={'justify'}
                                gutterBottom={false}
                                variant={'h5'}
                            >
                                Select Date:
                            </Typography>
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


