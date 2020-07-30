import React from "react";
import * as d3 from "d3";
import '../App.css';
// import ColorMap from '../modules/ColorMap.js';
import DualColorScale from '../modules/DualColorScale.js';
import Utils from '../modules/Utils.js';
import CountyStats from '../modules/CountyStats';
import * as constants from '../modules/Constants.js';
// import { interpolate, keys } from "d3";

export default class Map extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            zoomedToId: null,
            currentTransform: '',
            activeCountyGroups: [],
        }
        // this.colorMap = new ColorMap();
        this.dataAccessor = (d=>d);
        this.colorProps = {};
        this.bordersDrawn = false;
        this.spikesDrawn = false;
    }

    static defaultProps = {
        spikeVar: 'cases',
        spikeWidth: 6,
        spikeStrokeWidth: 1,
        maxSpikeHeight: 20,
        spikeHeightScaleExp: 2 //currently does a quantile transform and then applies a power tranform with this exp within it
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
            .style('background-color', '#e4e4e4')
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
        Utils.wrapError(this.drawSpikes.bind(this), 'error in Map.drawSpikes');
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
            this.setState({currentTransform: emptyTransform})
        }
    }

    handleGroupMouseOver(d,i){
        var target = this.g.select('#boundary'+i);
        target.style('stroke-width', 7)
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
        var target = this.g.select('#county'+d.GEOID);
        target.style('stroke-width',5)
            .style('stroke','red')
            .style('z-index', 100)
        try{
            var bbox = target.node().getBoundingClientRect();
            var svgRect = d3.select('.map-svg').node().getBoundingClientRect();
            var ttip = d3.select('#mapToolTip');
            ttip.style('left', bbox.right - svgRect.left + bbox.width/4 + 'px')
                .style('top', bbox.top  - svgRect.top + bbox.height/2 + 'px')
                .style('visibility','visible')
                .html(CountyStats.getSingleCountyToolTip(d, this.props.mapVar, this.props.mapDate));
        } 
        catch {
            return
        }
    }   

    handleGroupMouseOut(d,i){
        var target = this.g.select('#boundary'+i);
        target.style('stroke-width', '')
            .style('stroke', '');
        var ttip = d3.select('#mapToolTip');
        ttip.style('visibility', 'hidden')
    }

    handleSingleCountyMouseOut(d){
        try{
            var target = this.g.select('#county'+d.GEOID);
            target.style('stroke-width','')
                .style('stroke','')
                .style('z-index', '');
        } catch {
            d3.selectAll('.map-svg').select('#county'+d.GEOID)
                .style('stroke-width','')
                .style('stroke','')
                .style('z-index', '');
        }

        var ttip = d3.select('#mapToolTip');
        ttip.style('visibility', 'hidden')
    }

    handleCountyGroupClick(event){
        var countyGroup = CountyStats.getCountyGroup(event);
        this.props.toggleActiveCountyGroups(countyGroup)
    }

    handleSingleCountyClick(event){
        var countyGroup = CountyStats.getParentCountyGroup(event);
        this.props.toggleActiveCountyGroups(countyGroup)
    }

    drawCounties(){
        this.g.selectAll('.singleCounty').remove();
        if(this.props.activeCountyGroups == null){
            return
        }

        var countyDataGroups = CountyStats.activeGroups(this.props.data, this.props.activeCountyGroups);

        // var scaler = function(d){
        //     let value = this.props.dataAccessor(d);
        //     return this.props.dataScaler(value)
        // }.bind(this)

        // let getColor = this.colorMap.getColorScale(this.props.colorProps,scaler);

        let getColor = this.colorScale.getCountyColor.bind(this.colorScale);

        for(var countyData of countyDataGroups){
            let currCountys = this.g.selectAll('path')
                .filter('.singleCounty')
                .filter('.countyGroup' + CountyStats.getCountyGroup(countyData));
            currCountys.data(countyData.counties).enter()
                .append('path')
                .attr('class', d=>'singleCounty countyGroup'+CountyStats.getParentCountyGroup(d))
                .attr('id', d=>'county' +d.GEOID)
                .attr('d', d => this.path(d.features))
                .attr('fill', getColor)
                .on('click', this.handleSingleCountyClick.bind(this))
                .on('mouseover', (d,i) => this.handleSingleCountyMouseOver(d,i))
                .on('mouseout', d=> this.handleSingleCountyMouseOut(d))
                .raise();
            currCountys.exit().remove();
        }
        this.g.selectAll('.singleCountySpike').raise()
    }

    colorBoundaries(){
        if(Utils.emptyObject(this.props.data)){
            return;
        }
        var groupAccessor = function(d){
            // let stats = Utils.aggregateValues(d, 
            //     this.props.dataAccessor, 
            //     this.props.dataAggregator, 
            //     this.props.dataWeightAccessor)
            let ga = CountyStats.getGroupAccessor(this.props.mapVar, this.props.mapDate)
            return this.props.dataScaler(ga(d))
        }.bind(this)

        // this.colorMap = new ColorMap();
        // this.colorMap.fitValues(this.props.data, groupAccessor);
        // let getColor = this.colorMap.getColorScale(this.props.colorProps);
        this.colorScale = new DualColorScale(this.props.data, this.props.mapVar, this.props.secondaryVar, this.props.mapDate)
        let getColor = this.colorScale.getGroupColor.bind(this.colorScale);

        var borders = this.g.selectAll('path').filter('.countyGroup')
            .attr('fill', getColor)
            .on('mouseover', (d,i)=> this.handleGroupMouseOver(d,i) )
            .on('mouseout', (d,i) => this.handleGroupMouseOut(d,i))
            .on('click', this.handleCountyGroupClick.bind(this));

        borders.exit().remove();
        this.drawCounties()
    }

    drawCountySpikes(scale, colors, spikeAccessor){
        if(this.state.activeCountyGroups == null || this.props.data.length === undefined){
            return
        }

        var activeCountyData = CountyStats.activeGroups(this.props.data,this.props.activeCountyGroups);

        for(var countyData of activeCountyData){
            var currCountys = this.g.selectAll('path')
                .filter('.singleCountySpike')
                .filter('#countySpike'+ CountyStats.getCountyPopulation(countyData));
            currCountys.data(countyData.counties).enter()
                .append('path')
                .attr('class', 'singleCountySpike')
                .attr('id', d=>'countySpike' + CountyStats.getParentCountyGroup(d))
                .attr('d', d => this.drawCountySpike(d,scale,spikeAccessor))
                .attr('stroke', colors.stroke)
                .attr('strokeOpacity', colors.strokeOpacity)
                .attr('fill', colors.fill)
                .attr('fill-opacity', colors.fillOpacity)
                .attr('stroke-width', this.props.spikeStrokeWidth)
                .on('click', this.handleSingleCountyClick.bind(this))
                .on('mouseover', (d,i) => this.handleSingleCountyMouseOver(d,i))
                .on('mouseout', this.handleSingleCountyMouseOut)
                .raise();
            currCountys.exit().remove();
        }
    }

    drawSpikes(){
        this.g.selectAll('path').filter('.mapSpike').remove();
        this.g.selectAll('path').filter('.singleCountySpike').remove();
        this.spikesDrawn = false;
        if(!Utils.emptyObject(this.props.data) & this.props.spikeVar !== 'none'){

            var data = this.props.data;
            var spikeGroupAccessor = CountyStats.getGroupAccessor(this.props.spikeVar, this.props.mapDate);
            var spikeAccessor = CountyStats.getAccessor(this.props.spikeVar, this.props.mapDate)
            var spikeScale;
            switch(this.props.spikeVar){
                case 'cases':
                case 'deaths':
                case 'casesPerCapita':
                case 'deaths':
                    // var maxVal = this.props.dataService.maxGroupCovid(data, this.props.spikeVar);
                    // spikeScale = d3.scalePow(.25)
                    //     .domain([0,maxVal])
                    //     .range([0,this.props.maxSpikeHeight])
                    // break;
                case 'tweets':
                default:
                    var quantiles = CountyStats.globalQuantiles(data, spikeAccessor, 50, true);
                    // console.log('quantiles', quantiles)
                    var range = Utils.arrange(
                        0, 
                        this.props.maxSpikeHeight**(1/this.props.spikeHeightScaleExp), 
                        quantiles.length-2);
                    // console.log('range', range)
                    spikeScale = d3.scaleLinear()
                        .domain(quantiles)
                        .range(range);
                    break;
            }

            console.log('scale',spikeAccessor, this.props, spikeScale(quantiles[0]), spikeScale(parseInt(.75*quantiles.length)))
            //turn off visibility for selected groups since we'll draw counties over them
            var getVisiblity = function(d){
                var cid = CountyStats.getCountyGroup(d);
                var visibility = (this.props.activeCountyGroups.indexOf(cid) > -1)? 'hidden': 'visible';
                return visibility
            }.bind(this)
            var colors = this.props.spikeColors;

            var spikes = this.g.selectAll('path')
                .filter('.mapSpike')
                .data(data)
                .enter().append('path')
                .attr('class', 'mapSpike')
                .attr('id', d=>'spike'+CountyStats.getCountyGroup(d))
                .attr('d', (d) => this.drawSpike(d,spikeScale, spikeGroupAccessor))
                .attr('stroke', colors.stroke)
                .attr('strokeOpacity', colors.strokeOpacity)
                .attr('fill', colors.fill)
                .attr('fill-opacity', colors.fillOpacity)
                .attr('stroke-width', this.props.spikeStrokeWidth)
                .attr('visibility', getVisiblity)
                .on('mouseover', (d,i)=> this.handleGroupMouseOver(d,i) )
                .on('mouseout', (d,i) => this.handleGroupMouseOut(d,i))
                .on('click', this.handleCountyGroupClick.bind(this))
                .raise();

            spikes.exit().remove()
            this.drawCountySpikes(spikeScale, colors,spikeAccessor)
            this.spikesDrawn = true;
        }
    }

    spikeCentroid = function(d){
        var centroid = this.projection(d3.geoCentroid(d.features))
        return 'translate(' + centroid[0] + ',' + centroid[1] + ')'
    }

    drawSpike = function(d, scale, spikeGroupAccessor){
        var width = this.props.spikeWidth;
        var height = spikeGroupAccessor(d)
        if(height === 0){
            return ''
        }
        height = scale(height/CountyStats.countyGroupPopulation(d))**this.props.spikeHeightScaleExp;
        height = Math.min(height, this.props.maxSpikeHeight);
        var centroid = this.projection(d3.geoCentroid(d.features))
        var path = ' M' + (centroid[0]-(width/2)).toString() + ',' + centroid[1];
        path += ' L' + centroid[0] + ',' + (centroid[1]-height).toString();
        path += ' L' + (centroid[0]+(width/2)).toString() + ',' + centroid[1];
        return path;
    }

    drawCountySpike(d,scale,spikeAccessor){
        var width = this.props.spikeWidth/2;
        var height = spikeAccessor(d);
        if(height === 0){
            return ''
        }
        height = scale(height/CountyStats.getCountyPopulation(d))**this.props.spikeHeightScaleExp;
        height = Math.min(height, this.props.maxSpikeHeight);
        var centroid = this.projection(d3.geoCentroid(d.features));
        var path = ' M' + (centroid[0]-(width/2)).toString() + ',' + centroid[1];
        path += ' L' + centroid[0] + ',' + (centroid[1]-height).toString();
        path += ' L' + (centroid[0]+(width/2)).toString() + ',' + centroid[1];
        return path;
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

    shouldDrawSpikes(prevProps){
        if(this.props.data === undefined || Utils.emptyObject(this.props.data)){
            return false
        } else if(Utils.emptyObject(prevProps.data) || this.props.data.length !== prevProps.data.length){
            return true
        }
        else if(this.props.mapDate !== prevProps.mapDate || this.props.spikeVar !== prevProps.spikeVar){
            return true
        } 
        else if(this.props.activeCountyGroups.length !== prevProps.activeCountyGroups.length){
            return true
        }
        for(const [key,value] of Object.entries(this.props.spikeColors)){
            if(value !== prevProps.spikeColors[key]){
                return true
            }
        }
        if(!this.spikesDrawn){
            return true
        }
        return (prevProps.data.length !== this.props.data.length)
    }

    componentDidUpdate(prevProps){
        //update map
        //I'm assuming we only need to redraw borders when they change and the dataset size changes?
        if(this.props.data !== undefined){
            if(this.shouldDrawBorders(prevProps)){
                Utils.wrapError(this.drawBorders.bind(this), 'error in Map.drawBorders');
            }
            Utils.wrapError(this.colorBoundaries.bind(this), 'error in Map.colorBoundaries');
            if(this.shouldDrawSpikes(prevProps)){
                Utils.wrapError(this.drawSpikes.bind(this), 'error in Map.drawSpikes')
            }
            this.g.attr('transform', this.state.currentTransform)
        }
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