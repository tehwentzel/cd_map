import React from "react";
import * as d3 from "d3";
import './Map.css';
import ColorMap from '../modules/ColorMap.js';
import Utils from '../modules/Utils.js';
import * as constants from '../modules/Constants.js';

export default class Map extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            zoomedToId: null,
            currentTransform: ''
        }
        this.colorMap = new ColorMap();
        this.dataAccessor = function(d){return (d.clinton16 - d.trump16)};
        this.colorProps = {};
        this.bordersDrawn = false;
        this.encodingDrawn = false;
    }

    zoomed(){
        var transform = d3.event.transform;
        this.setState({currentTransform: transform})
        this.g.attr('transform',transform.toString())
    }

    zoomToRegion(d){
        console.log(this.state, d.GEOID)
        // todo:make this work
        if(this.state.zoomedToId === d.GEOID){
            console.log('here')
            this.g.transition()
                .duration(300)
                .attr('transform',this.state.currentTransform);
            this.setState({zoomedToId: null})
            return
        }
        var bounds = this.path.bounds(d.features);
        let dx = bounds[1][0] - bounds[0][0];
        let dy = bounds[1][1] - bounds[0][1];
        let x = (bounds[0][0] + bounds[1][0]) / 2;
        let y = (bounds[0][1] + bounds[1][1])/2;
        let scale = .9 / Math.max(dx / this.width, dy / this.height);
        let translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];
        this.g.transition()
            .duration(500)
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        this.setState({zoomedToId: d.GEOID})
    }

    create(node){

        this.height = node.clientHeight;
        this.width = node.clientWidth;
        d3.select(node).selectAll('svg').remove()
        this.svg = d3.select(node).append('svg')
            .attr('class','map-svg')
            .attr('width', this.width)
            .attr('height', this.height);

        var scale = Math.min(this.width*1.5, this.height*3);

        this.g = this.svg.append('g').attr('class','zoomable');

        this.zoom = d3.zoom().on('zoom',this.zoomed.bind(this));
        this.g.call(this.zoom);

        this.projection = d3.geoAlbersUsa()
            .translate([node.clientWidth/2, node.clientHeight/2])
            .scale(scale);

        this.path = d3.geoPath()
            .projection(this.projection);
        this.drawBorders();
        this.colorBoundaries();
    }

    destroy(){
        d3.selectAll('.map-svg').remove();
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
            .style('stroke','black')
            .on('click', this.zoomToRegion.bind(this));

        this.mapRegions.exit().remove();
    }

    colorBoundaries(){
        this.colorMap.fitValues(this.props.data, this.props.dataAccessor);
        let getColor = this.colorMap.getColorScale(this.props.colorProps);
        this.mapRegions.data(this.props.data)
        this.mapRegions.exit().remove()

        this.mapRegions.style('fill', getColor)
            .on('click', this.zoomToRegion.bind(this));
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