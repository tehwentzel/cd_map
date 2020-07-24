import React from 'react';
import Utils from '../modules/Utils';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import "../App.css";

import * as constants from '../modules/Constants';
import { Slider } from '@material-ui/core';

export default class ControlPanel extends React.Component {

    constructor(props){
        super(props);
        this.here = 0;
        //this is where I check to see if the selected mapvar is valid I guess
    }

    render() {

        const mapVarDropDown = Utils.validMapVars().map(val => 
            <MenuItem key={val} value={val} disabled={Boolean(this.props.disabled & val!==this.props.mapVar)}>{val}</MenuItem>
        )

        return (
            <div className='controlPanel' margin={5}>
                <Grid container spacing={2} align-items='center' direction='column'>
                    <Grid item xs={12}>
                        <InputLabel id='mapVarInputLabel'>{'Map Variable'}</InputLabel>
                        <Select disabled={this.props.disabled} value={this.props.mapVar} renderValue={d=>Utils.unCamelCase(d)} onClick={this.props.handleMapVarChange}>
                            {mapVarDropDown}
                        </Select>
                    </Grid>
                </Grid>
            </div>
          )
    }
}