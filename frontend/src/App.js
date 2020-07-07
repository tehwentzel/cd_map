import React from "react";
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

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

        let availableDates = this.dataService.getAvailableDates(this.props.defaultMapType);
        this.state = {
            counties: true,
            districts: false,
            name: 'vizAtHome',
            availableDates: availableDates,
            mapType: this.props.defaultMapType,
            mapVar: this.props.defaultMapVar,
            mapDate: availableDates[availableDates.length-1]
        }
        this.dummy = 0;
    }

    static defaultProps = {
        defaultMapType: constants.COUNTY,
        defaultMapVar: 'casesPerCapita'
    }

    validateMapVar(){
        let validVars = Utils.validMapVars(this.state.mapType);
        console.log('update',validVars, this.state.mapVar)
        if(!Utils.itemInArray(this.state.mapVar, validVars)){
            this.setState({mapVar: validVars[0]})
        }
    }

    // compondentDidUpdate(){
    
    // }

    handleMapTypeChange(event){
        this.setState({mapType: event.currentTarget.value}, this.validateMapVar);
    }

    handleMapVarChange(event){
        this.setState({mapVar: event.target.value})
    }

    handleSliderChange(event, newValue){
        let newDate = this.state.availableDates[newValue];
        this.setState({mapDate: newDate})
    }

    render(){
        console.log(this.state)
        return (
            <div className={'component-app'}>
                <CssBaseline/>
                <Grid container spacing={2}>
                    <AppBar position='static'>
                        <Toolbar variant='dense'>
                            {Utils.unCamelCase(this.state.name)}
                        </Toolbar>
                    </AppBar>
                    <Grid className={'body'} item xs={3}>
                        <ControlPanel
                            mapType={this.state.mapType}
                            mapVar={this.state.mapVar}
                            handleMapTypeChange={this.handleMapTypeChange.bind(this)}
                            handleMapVarChange={this.handleMapVarChange.bind(this)}
                        />
                    </Grid>
                    <Grid className={'body'} container item xs={9}>
                        <Grid item xs={12}>
                            <MapContainer 
                            dataService={this.dataService} 
                            mapType={this.state.mapType} 
                            mapVar={this.state.mapVar} 
                            mapDate={this.state.mapDate}
                            availableDates={this.state.availableDates}
                            />
                        </Grid>
                        <Grid item xs={8}>
                            <Slider
                                defaultValue={this.state.availableDates.length-1}
                                min={0}
                                max={this.state.availableDates.length -1}
                                marks={Utils.markify(this.state.availableDates)}
                                step={null}
                                onChange={this.handleSliderChange.bind(this)}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
        // return (
        //     <Container>
        //         <Jumbotron className="header flex-center" style={{'height':'10vh'}}>{this.state.name}</Jumbotron>
        //         <Row style={{'height':'80vh'}}>
        //             <Col className='flex-center' md={12} onMouseDown={this.handleEvent.bind(this)} onContextMenu={this.handleEvent.bind(this)}>
        //                 <MapContainer dataService={this.dataService} mapType={this.state.mapType} mapVar={this.state.mapVar}/>
        //             </Col>
        //         </Row>
        //         <Row style={{'height':'10vh'}}>
        //             <Col className='flex-center'>Viz</Col>
        //         </Row>
        //     </Container>
        // )
    }
}


