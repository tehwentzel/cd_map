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
        rectPadding: 2,
        data: {},
        covidVar: 'cases'
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
        for(const propKey of propsToCheck){
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
        console.log('chardata', this.data)
        var covidRates = this.data.slice().map(d => {
            let dates = [this.startDate,this.endDate];
            //get covid rates per person
            let rates = CountyStats.countyCovidChange(d,this.props.covidVar,dates); 
            //add 1 to covid so we can do log scale
            return rates[0]
        })//.map(Math.sqrt)
        
        // let windowSize = Math.max(1, parseInt(covidRates.length/5))
        var refValues = this.data.map(this.accessor)//.map(Utils.signedLog)

        var points = []
        for(let idx in covidRates){
            let name = CountyStats.getCountyName(this.data[idx]);
            let isDemocrat = CountyStats.getNetDemVotes(this.data[idx]) > 0
            let newPoint = {x: covidRates[idx], y: refValues[idx]}//, name: name, isDemocrat: isDemocrat};
            points.push(newPoint)
        }
        points.sort((x1,x2) => x1.y - x2.y)
        return points
    }

    // Function to compute density
    smoothYPoints(points, yMin, yMax, nPoints){
        var smoothedPoints = [{y: yMin, x: 0}]
        var windowWidth = (yMax - yMin)/nPoints;
        let windowStart = 0;
        while(windowStart < yMax){
            let windowEnd = windowStart + windowWidth;
            let window = points.filter(d => d.y > windowStart)
                .filter(d => d.y <= windowEnd);
            console.log('window',window)
            if(window.length > 0){ 
                let xMean = Utils.mean( window.map(d => d.x) )
                let yMean = Utils.mean( window.map(d => d.y) )
                smoothedPoints.push({x: xMean, y: yMean})
            }
            windowStart = windowEnd;
        }
        smoothedPoints.push({y: yMax, x: 0})
        return smoothedPoints
    }

    draw(){

        this.g.selectAll('rect').filter('.diffBar').remove()
        var points = this.getPoints()

        if(points.length === 0){
            return
        }

        var rectHeight = (this.width - this.props.margin - this.props.rectPadding)/20;
        var yMin = d3.min(points.map(d=>d.y));
        var yMax = d3.max(points.map(d=>d.y));

        points = this.smoothYPoints(points, yMin, yMax, 20)
        console.log('smooth points', points)

        let yScale = d3.scaleSymlog()
            .domain([ yMin, yMax ])
            .range([this.height-this.props.margin, this.props.margin])

        let xScale = d3.scalePow(.5)
            .domain([0, d3.max(points.map(d=>d.x))] )
            .range([this.props.margin ,this.width - this.props.margin])

        // points.push({x: 0, y: yMax})
        // points.splice(0,0, {x:0, y: yMin})
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
        // var rects = this.g.selectAll('rect')
        //     .filter('.diffBar')
        //     .data(points);

        // rects.enter()
        //     .append('rect')
        //     .attr('class', 'diffBar')
        //     .attr('width', (d) => xScale(d.x))
        //     .attr('height', rectHeight)
        //     .attr('y', (d) => yScale(d.y) -rectHeight/2)
        //     .attr('x', this.props.margin)
        //     .attr('fill', getColor)
        //     .attr('stroke-opacity', 1)
        //     .attr('stroke-width', 1)
        //     .attr('fill-opacity', Math.max(.25, Math.sqrt(2/points.length)));

        // rects.exit().remove()

        var yAxis = d3.axisLeft(yScale).ticks(10, 's');
        var xAxis = d3.axisBottom(xScale).ticks(5, '.000%')
        this.svg.selectAll('.axis').remove()
        this.svg.append('g')
            .attr('class','axis')
            .attr('id', 'yAxis')
            .attr('transform', 'translate(' + this.props.margin + ',0)' )
            .call(yAxis)

        let xTransform = this.height - this.props.margin + rectHeight/2;
        console.log('xt', xTransform)
        this.svg.append('g')
            .attr('class','axis')
            .attr('id', 'xAxis')
            .attr('transform', 'translate(0,' + xTransform + ')')
            .call(xAxis)
        // let minWindow = 2;
        // let nPoints = Math.min(20, points.length);
        // if(nPoints < 3){
        //     return
        // }
    
        // let density = this.smooth(points,nPoints,minWindow);

        // let y = d3.scaleLinear()
        //     .domain( d3.extent(points.map(d=>d.y)) )
        //     .range([this.height-this.props.margin, this.props.margin]);

        // let nTicks = Math.max(5, parseInt(points.length/2))
        
        // var kde = this.kernelDensityEstimator(this.kernelEpanechnikov(5), y.ticks(nTicks))
        // var density = kde(points.map(d=>d.x));
        // var xExtent = d3.extent(density.map(d=>d[1]));
        // var yExtent = d3.extent(density.map(d=>d[0]));
        // density.push([yExtent[1], xExtent[0]])
        // density.splice(0, 0, [yExtent[0], xExtent[0]])

        // let x = d3.scaleLinear()
        //     .domain( xExtent )
        //     .range([this.props.margin ,this.width - this.props.margin]);

        // let line = d3.line()
        //     // .curve(d3.curveCardinal.tension(1))
        //     .y(d => y(d[0]))
        //     .x(d => x(d[1]))
        // console.log('density','covid', xExtent, this.props.mapVar, yExtent)
        // console.log(density)

        // this.g.selectAll('.kde').remove()
        // this.g.append('path')
        //     .attr('class', 'kde')
        //     .datum(density)
        //     .attr('d', line)
        //     .attr('stroke-width', 2)
        //     .attr('stroke', 'blue')
        //     .attr('stroke-opacity', 1)
        //     .attr('fill','blue')
        //     .attr('fill-opacity', .4);

    }

    componentDidMount(){
        this.create(
            this._rootNode,
        );
        //first draw
    }

    componentDidUpdate(prevProps){
        if(this.shouldSetupData(prevProps)){
            this.setupData()
        }
        if(this.shouldDraw(prevProps)){
            this.draw()
        }
    }

    componentWillUnmount(){
    }

    _setRef(componentNode){
        this._rootNode = componentNode;
    }

    render(){
        return <div className='map-container' ref={this._setRef.bind(this)} />
    }
}