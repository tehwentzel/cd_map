import React from "react";
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Jumbotron from 'react-bootstrap/Jumbotron';

import Map from './components/Map';
import MapContainer from './components/MapContainer'
import * as constants from './modules/Constants.js';
import DataService from './modules/DataService'
import "./App.css";

export default class App extends React.Component {

    constructor(props){
        super(props);
        
        this.dataService = new DataService();
        this.dataService.test();

        this.state = {
            counties: true,
            districts: false,
            name: 'Viz at Home',
            mapType: constants.DISTRICT,
            mapVar: 'voting',
            }
    }


    handleEvent(event){
        console.log('event')
        console.log(event.button)
        if(event.type === 'contextmenu'){
            event.preventDefault();
            return false
        }
        if(event.button === 2){
            let newMapVar = (this.state.mapVar === 'voting')? 'unemployement': 'voting';
            this.setState({mapVar: newMapVar});
        }
        else if(event.button === 0){
            let newMapType = (this.state.mapType === constants.DISTRICT)? constants.COUNTY : constants.DISTRICT;
            this.setState({mapType: newMapType});
        } 
    }
    render(){
        return (
            <Container>
                <Jumbotron className="header flex-center" style={{'height':'10vh'}}>{this.state.name}</Jumbotron>
                <Row style={{'height':'80vh'}}>
                    <Col className='flex-center' md={2}>controlls?</Col>
                    <Col className='flex-center' md={10} onMouseDown={this.handleEvent.bind(this)} onContextMenu={this.handleEvent.bind(this)}>
                        <MapContainer dataService={this.dataService} mapType={this.state.mapType} mapVar={this.state.mapVar}/>
                    </Col>
                </Row>
                <Row style={{'height':'10vh'}}>
                    <Col className='flex-center'>Viz</Col>
                </Row>
            </Container>
        )
    }
}


