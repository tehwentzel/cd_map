import React from "react";
import * as d3 from "d3";
import '../App.css';
import ColorMap from '../modules/ColorMap.js';
import Utils from '../modules/Utils.js';
import CountyStats from '../modules/CountyStats';
import * as constants from '../modules/Constants.js';
import { interpolate } from "d3";

export default class Map extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            zoomedToId: null,
            currentTransform: '',
            activeCountyGroups: [],
        }
        this.colorMap = new ColorMap();
        this.dataAccessor = (d=>d);
        this.colorProps = {};
        this.bordersDrawn = false;
    }

    zoomed(){
        var transform = d3.event.transform;
        this.setState({currentTransform: transform});
    }

    create(node){
        d3.select(node).selectAll('svg').remove();
        this.height = node.clientHeight;
        this.width = node.clientWidth;
        this.svg = d3.select(node).append('svg')
            .attr('class','map-svg zoomable')
            .attr('width', this.width)
            .attr('height', this.height)
            .on('contextmenu',this.handleRightClick.bind(this));

        this.scale = Math.min(this.width*1.35, this.height*3);

        this.g = this.svg.append('g').attr('class','map');

        this.zoom = d3.zoom().on('zoom',this.zoomed.bind(this));

        this.svg.call(this.zoom);

        this.projection = d3.geoAlbersUsa()
            .translate([node.clientWidth/2, node.clientHeight/2])
            .scale(this.scale);

        this.path = d3.geoPath()
            .projection(this.projection);

        Utils.wrapError(this.drawBorders.bind(this), 'error in Map.drawBorders');
        Utils.wrapError(this.colorBoundaries.bind(this), 'error in Map.colorBoundaries');
    }

    destroy(){
        d3.selectAll('.map-svg').remove();
    }

    getGroupStats(){
        var groupValues = Utils.aggregateValues(this.props.data, 
            this.props.dataAccessor, 
            this.props.dataAggregator, 
            this.props.dataScaler)
        return groupValues
    }

    drawBorders(){
        this.bordersDrawn = false;
        var borders = this.g.selectAll('path').filter('.countyGroup')
            .data(this.props.data)
            .enter().append('path')
            .attr('class', 'countyGroup')
            .attr('id', (d,i)=>{return 'boundary'+i.toString()})
            .attr('d', d=> this.path(d.features));
        borders.exit().remove()

        this.bordersDrawn = true;
    }

    handleRightClick(event){
        d3.event.preventDefault()
        if(this.bordersDrawn){
            let emptyTransform = '';
            let arr = []
            // this.g.attr('transform',string);
            this.setState({currentTransform: emptyTransform, activeCountyGroups: arr})
        }
    }

    handleGroupMouseOver(d,i){
        var target = this.g.select('#boundary'+i);
        let strokeScale = this.state.currentTransform;
        strokeScale = (strokeScale == '')? 1 : strokeScale.k;
        target.style('stroke-width', 5/strokeScale)
            .style('stroke', 'red')
            .style('z-index', 100);

        var bbox = target.node().getBoundingClientRect();
        var svgRect = d3.select('.map-svg').node().getBoundingClientRect();
        var ttip = d3.select('#mapToolTip');
        ttip.style('left', bbox.right - svgRect.left + bbox.width/4 + 'px')
            .style('top', bbox.top  - svgRect.top + bbox.height/2 + 'px')
            .style('visibility','visible')
            .html(CountyStats.getGroupToolTip(d, this.props.mapVar, this.props.mapDate));
    }

    handleSingleCountyMouseOver(d,i){
        var target = this.g.select('#county'+d.GEOID)
        var bbox = target.node().getBoundingClientRect();
        var svgRect = d3.select('.map-svg').node().getBoundingClientRect();
        var ttip = d3.select('#mapToolTip');
        ttip.style('left', bbox.right - svgRect.left + bbox.width/4 + 'px')
            .style('top', bbox.top  - svgRect.top + bbox.height/2 + 'px')
            .style('visibility','visible')
            .html(CountyStats.getSingleCountyToolTip(d, this.props.mapVar, this.props.mapDate));
    }   

    handleGroupMouseOut(d,i){
        var target = this.g.select('#boundary'+i);
        target.style('stroke-width', '')
            .style('stroke', '');
        var ttip = d3.select('#mapToolTip');
        ttip.style('visibility', 'hidden')
    }

    handleSingleCountyMouseOut(event){
        var ttip = d3.select('#mapToolTip');
        ttip.style('visibility', 'hidden')
    }

    handleCountyGroupClick(event){
        console.log(event.groupId)
        let activeGroups = this.state.activeCountyGroups.slice()
        activeGroups.push(event.groupId)
        this.setState({activeCountyGroups: activeGroups})
    }

    handleSingleCountyClick(event){
        let activeGroups = this.state.activeCountyGroups.slice()
        let index = activeGroups.indexOf(event.parent)
        if(index > -1){
            activeGroups.splice(index, 1);
            this.setState({activeCountyGroups: activeGroups})
        }
    }

    drawCounties(){
        this.g.selectAll('.singleCounty').remove();
        if(this.state.activeCountyGroups == null){
            return
        }
        var countyDataGroups = this.props.data.filter(d => this.state.activeCountyGroups.indexOf(d.groupId) > -1);
        var scaler = function(d){
            let value = this.props.dataAccessor(d);
            return this.props.dataScaler(value)
        }.bind(this)
        let getColor = this.colorMap.getColorScale(this.props.colorProps,scaler);

        for(var countyData of countyDataGroups){
            let currCountys = this.g.selectAll('path')
                .filter('.singleCounty')
                .filter('.countyGroup' + countyData.groupId);
            console.log(countyData)
            currCountys.data(countyData.counties).enter()
                .append('path')
                .attr('class', d=>'singleCounty countyGroup'+d.parent)
                .attr('id', d=>'county' +d.GEOID)
                .attr('d', d => this.path(d.features))
                .attr('fill', getColor)
                .on('click', this.handleSingleCountyClick.bind(this))
                .on('mouseover', (d,i) => this.handleSingleCountyMouseOver(d,i))
                .on('mouseout', this.handleSingleCountyMouseOut)
                .raise();
            currCountys.exit().remove();
        }
    }

    colorBoundaries(){
        if(Utils.emptyObject(this.props.data)){
            return;
        }
        var groupAccessor = function(d){
            let stats = Utils.aggregateValues(d, 
                this.props.dataAccessor, 
                this.props.dataAggregator, 
                this.props.dataWeightAccessor)
            return this.props.dataScaler(stats)
        }.bind(this)

        this.colorMap = new ColorMap();
        this.colorMap.fitValues(this.props.data, groupAccessor);
        let getColor = this.colorMap.getColorScale(this.props.colorProps);
        var mapVar = this.props.mapVar;
        var borders = this.g.selectAll('path').filter('.countyGroup')
            .attr('fill', getColor)
            .on('mouseover', (d,i)=> this.handleGroupMouseOver(d,i) )
            .on('mouseout', (d,i) => this.handleGroupMouseOut(d,i))
            .on('click', this.handleCountyGroupClick.bind(this));

        borders.exit().remove();
        this.drawCounties()
    }

    componentDidMount(){
        //I coppied code and this gives the root element and I don't know why
        this.create(this._rootNode,);
        //first draw
    }

    shouldDrawBorders(prevProps){
        if(this.props.data === undefined){
            return false
        }
        else if(!this.bordersDrawn & this.props.data.length > 0){
            return true
        } else{
            return (prevProps.data.length !== this.props.data.length)
        }
    }

    componentDidUpdate(prevProps){
        //update map
        //I'm assuming we only need to redraw borders when they change and the dataset size changes?
        if(this.shouldDrawBorders(prevProps)){
            Utils.wrapError(this.drawBorders.bind(this), 'error in Map.drawBorders');
        }
        Utils.wrapError(this.colorBoundaries.bind(this), 'error in Map.colorBoundaries');
        this.g.attr('transform', this.state.currentTransform)
        console.log('map update props', this.props)
    }

    componentWillUnmount(){
        //destroy stuff
        this.destroy();
    }

    _setRef(componentNode){
        this._rootNode = componentNode;
    }

    render(){
        return <div className='map-container' ref={this._setRef.bind(this)}>
            <div 
                id={'mapToolTip'}
                className={'toolTip'} 
            >
                Test
            </div>
        </div>
    }
}