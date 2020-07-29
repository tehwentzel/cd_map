import React from "react";
import * as d3 from 'd3';
import "../App.css";
import CountyStats from "../modules/CountyStats";
import Utils from '../modules/Utils';

export default class D3Chart extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }

    static defaultProps = {
        margin: 30,
        marginTop: 5,
        rectPadding: 2,
        data: {},
        covidVar: 'cases',
        perCapita: true
    }

    create(node){
        d3.select(node).selectAll('svg').remove();
        this.height = node.clientHeight;
        this.width = node.clientWidth;
        this.svg = d3.select(node).append('svg')
            .attr('class','covidTimeLine')
            .attr('width', this.width)
            .attr('height', this.height);

        this.g = this.svg.append('g')
            .attr('class','chart')
        
        this.setupData();
    }

    setupData(){
        if(this.props.data.length === undefined || this.props.availableDates.length === undefined){
            return
        }
        //should current set this.data [{key,value...}, {key, value}], this.accessor x=>x[mapVar], this.startDate and this.endDate '4/1/2020'
        var data = CountyStats.activeGroups(this.props.data, this.props.activeCountyGroups);
        var flattenedData = [];
        for(let countyGroup of data){
            let counties = countyGroup.counties;
            for(let county of counties){
                flattenedData.push(county)
            }
        }
        //data should now be an object with keys for each active county
        this.data = flattenedData;

        //accessor should be county level. add 1 so we can take the logscale easily
        this.accessor = CountyStats.getAccessor(this.props.mapVar, this.props.mapDate);
        this.data.sort((x,y) => this.accessor(x) > this.accessor(y))
        //set the date to be to dates prior to the mapdate, or the first date.  may change later
        // let endDatePos = this.props.availableDates.indexOf(this.props.mapDate);
        // let startDatePos = (endDatePos > 2)? endDatePos-2: 0;
        this.startDate =  this.props.availableDates[0]//this.props.availableDates[startDatePos];
        this.endDate = this.props.mapDate;

    
    }

    shouldSetupData(prevProps){
        //when shoudl we update the filtered data?
        //if the data changes
        if(Utils.emptyObject(this.props.data)){
            return false
        }
        if(Utils.emptyObject(prevProps.data)){
            return true
        } 
        if(prevProps.data.length !== this.props.data.length){
            return true
        }
        //if the active groups change
        else if(!Utils.arrayEqual(prevProps.activeCountyGroups, this.props.activeCountyGroups)){
            return true
        }
        //otherthings to change
        let propsToCheck = ['mapVar','mapDate'];
        for(let propKey of propsToCheck){
            if(this.props[propKey] !== prevProps[propKey]){
                return true
            }
        }
        return false
    }

    shouldDraw(prevProps){
        return true
    }

    getPoints(){
        // console.log('chardata', this.data)

        var secondaryAccessor = CountyStats.getSecondaryAccessor(
            this.props.covidVar, 
            this.startDate, 
            this.endDate, 
            this.props.perCaptia)

        var rates = this.data.slice().map(secondaryAccessor)
        
        var refValues = this.data.map(this.accessor)

        var points = []
        for(let idx in rates){
            // let name = CountyStats.getCountyName(this.data[idx]);
            // let isDemocrat = CountyStats.getNetDemVotes(this.data[idx]) > 0
            let newPoint = {y: rates[idx], x: refValues[idx]}//, name: name, isDemocrat: isDemocrat};
            points.push(newPoint)
        }
        points.sort((x1,x2) => x1.x - x2.x)

        return points
    }

    // Function to compute density
    smoothXPoints(points, xMin, xMax, nPoints){
        var smoothedPoints = [{x: xMin, y: 0}]
        var windowWidth = (xMax - xMin)/nPoints;
        let windowStart = xMin;
        while(windowStart < xMax){
            let windowEnd = windowStart + windowWidth;
            let window = points.filter(d => d.x > windowStart)
                .filter(d => d.x <= windowEnd);

            if(window.length > 0){ 
                let xMean = Utils.mean( window.map(d => d.x) )
                let yMean = Utils.mean( window.map(d => d.y) )
                smoothedPoints.push({x: xMean, y: yMean})
            } 
            else{
                smoothedPoints.push({x: windowStart, y:0})
            }
            windowStart = windowEnd;
        }
        smoothedPoints.push({x: xMax, y: 0})
        return smoothedPoints
    }

    getXScaleType(xVar){
        if(xVar === 'voting'){
            return d3.scaleLinear()
        } else{
            return d3.scalePow(.5);
        }
    }

    draw(){

        this.g.selectAll('rect').filter('.diffBar').remove()
        var points = this.getPoints()

        if(points.length === 0){
            return
        }

        var xMin = d3.min(points.map(d=>d.x));
        var xMax = d3.max(points.map(d=>d.x));

        points = this.smoothXPoints(points, xMin, xMax, 20)

        let xScale = this.getXScaleType(this.props.mapVar)
            .domain([ xMin, xMax ])
            .range([this.props.margin, this.width - this.props.margin])

        let yScale = d3.scalePow(.5)
            .domain([0, d3.max(points.map(d=>d.y))] )
            .range([this.height - this.props.margin , this.props.marginTop])

        var line = d3.line()
            .x(d=>xScale(d.x))
            .y(d=>yScale(d.y))
            .curve(d3.curveBasis)
        this.g.selectAll('path').filter('.diffCurve').remove()
        var curve = this.g
            //.enter()
            .append('path')
            .attr('class','diffCurve')
            .datum(points)
            .attr('d', line)
            .attr('stroke-width',1)
            .attr('fill-opacity', .25);
        curve.exit().remove()

        var yAxis = d3.axisLeft(yScale).ticks(5, '.00%');
        var xAxis = d3.axisBottom(xScale).ticks(20, 's')
        this.svg.selectAll('.axis').remove()
        this.svg.append('g')
            .attr('class','axis')
            .attr('id', 'yAxis')
            .attr('transform', 'translate(' + this.props.margin + ',0)' )
            .call(yAxis)

        let xTransform = this.height - this.props.margin;
        this.svg.append('g')
            .attr('class','axis')
            .attr('id', 'xAxis')
            .attr('transform', 'translate(0,' + xTransform + ')')
            .call(xAxis)

        this.svg.selectAll('text').filter('.title').remove();
        this.svg.append('text')
            .attr('class','title h6')
            .attr('x', this.width/2)
            .attr('y', this.props.margin-10)
            .html(Utils.unCamelCase(this.props.mapVar));
        var textX = this.width-this.props.margin;
        var textY = this.height/2 - this.props.margin - 10;
        var textTransform = 'translate(' + textX +',' + textY + ')'
        this.svg.append('text')
            .attr('class','title h6')
            .attr('transform',textTransform+'rotate(90)')
            .attr('width',this.height/2)
            .attr('height','auto')
            .html('Δ' + Utils.unCamelCase(this.props.covidVar) )
    }

    componentDidMount(){
        this.create(
            this._rootNode,
        );
        //first draw
    }

    componentDidUpdate(prevProps){
        if(this.shouldSetupData(prevProps)){
            Utils.wrapError(this.setupData.bind(this),  'Error in CovidTimeLine.setupData');
        }
        if(this.shouldDraw(prevProps)){
            Utils.wrapError(this.draw.bind(this), 'Error in CovidTimeLine.draw');
        }
    }

    componentWillUnmount(){
    }

    _setRef(componentNode){
        this._rootNode = componentNode;
    }

    render(){
        return <div className='map-container' ref={this._setRef.bind(this)}>
        </div>
    }
}