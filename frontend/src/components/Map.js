import React from "react";
import * as d3 from "d3";
import './Map.css';
import ColorMap from '../modules/ColorMap.js';
import Utils from '../modules/Utils.js';
import * as constants from '../modules/Constants.js';

export default class Map extends React.Component {

    constructor(props){
        super(props);

        this.colorMap = new ColorMap();
        this.dataAccessor = function(d){return (d.clinton16 - d.trump16)};
        this.colorProps = {};
        this.bordersDrawn = false;
        this.encodingDrawn = false;
    }

    static defaultProps = {
        scale: 1000,
    }

    create(node){

        this.svg = d3.select(node).append('svg')
            .attr('class','map-svg')
            .attr('width', node.clientWidth)
            .attr('height', node.clientHeight);
        
        this.g = this.svg.append('g');

        this.projection = d3.geoAlbersUsa()
            .translate([node.clientWidth/2, node.clientHeight/2])
            .scale(this.props.scale);

        this.path = d3.geoPath()
            .projection(this.projection);
        this.drawBorders();
        this.colorBoundaries();
    }

    drawBorders(){
        //makes sure the borders are different that what is already drawn
        this.g.selectAll('path').filter('.mapRegion').remove();
        
        this.mapRegions = this.g.selectAll('path')
            .filter('.mapRegion')
            .data(this.props.data).enter()
            .append('path')
            .attr('d', (d) => {return this.path(d.features)})
            .attr('class','mapRegion')
            .style('stroke','black');

        this.mapRegions.exit().remove();
    }

    colorBoundaries(){
        this.colorMap.fitValues(this.props.data, this.props.dataAccessor);
        let getColor = this.colorMap.getColorScale(this.props.colorProps);
        this.mapRegions.data(this.props.data)
        this.mapRegions.exit().remove()

        this.mapRegions.style('fill', getColor)
    }
    componentDidMount(){
        //I coppied code and this gives the root element and I don't know why
        this.create(this._rootNode,);
        //first draw
    }

    componentDidUpdate(prevProps){
        //update map
        //I'm assuming we only need to redraw borders when they change and the dataset size changes?
        if(prevProps.data.length !== this.props.data.length){
            this.drawBorders();
        }
        this.colorBoundaries();
    }

    componentWillUnmount(){
        //destroy stuff
        this.destroy();
    }

    _setRef(componentNode){
        this._rootNode = componentNode;
    }

    render(){
        return <div className='map-container' ref={this._setRef.bind(this)} />
    }
}