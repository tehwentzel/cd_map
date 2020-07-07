import React from 'react';
import Utils from '../modules/Utils';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import * as constants from '../modules/Constants';

export default class ControlPanel extends React.Component {

    constructor(props){
        super(props);
        this.here = 0;
        //this is where I check to see if the selected mapvar is valid I guess
    }

    validMapVars(){
        return (this.props.mapType === constants.COUNTY)? constants.COUNTY_MAP_VARS : constants.DISTRICT_MAP_VARS;
    }

    render() {
        const mapVarDropDown = Utils.validMapVars(this.props.mapType).map(val => 
            <MenuItem key={val} value={val}>{val}</MenuItem>
        )
        return (
            <div className='controlPanel' margin={5}>
                <Grid container spacing={2} align-items='center' direction='column'>
                    <Grid item xs={12}>
                        <ButtonGroup color='primary' aria-label="outlined primary button group">
                            <Button onClick={this.props.handleMapTypeChange} value={constants.COUNTY}>
                                {constants.COUNTY}
                            </Button>
                            <Button onClick={this.props.handleMapTypeChange} value={constants.DISTRICT}>
                                {constants.DISTRICT}
                            </Button>
                        </ButtonGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel id='mapVarInputLabel'>{'Map Variable'}</InputLabel>
                        <Select value={this.props.mapVar} renderValue={d=>Utils.unCamelCase(d)} onClick={this.props.handleMapVarChange}>
                            {mapVarDropDown}
                        </Select>
                    </Grid>
                </Grid>
            </div>
          )
    }
}