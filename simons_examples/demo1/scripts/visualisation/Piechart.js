export default class Piechart{
    size;                       // effecive size

    svg; chart; arcs; labels;     // elements

    arcClick; arcOver; arcOut;  // callbacks
    tpText; arcTips;            // tooltips

    data;                       // data

    labelSpacing = 40;

    // constructor
    constructor(container='body', width=500, height=500, margin=[10,10,10,10]){
        // set size
        let [top, bottom, left, right] = margin;
        let innerWidth = width - left - right,
            innerHeight = height - top - bottom;
        this.size = Math.min(innerHeight,innerWidth)-this.labelSpacing*2;

        // initialise selections
        this.svg = d3.select(container).append('svg')
            .classed('piechart', true)
            .attr('width', width).attr('height', height);
        this.chart = this.svg.append('g').attr('transform', `translate(${left+innerWidth/2},${top+innerHeight/2})`);
        this.arcs = this.chart.selectAll('path.arc');
        this.labels = this.chart.selectAll('text.label');

        // initialise interactions
        this.arcClick = ()=>{};
        this.arcOver = ()=>{};
        this.arcOut = ()=>{};
        this.tpText = null;
        this.arcTips = [];
    }

    // Private methods

    // saves data generated by pie transformation
    #updateData(dataset){
        let pieGen = d3.pie()
            .value(d=>d.v)
            .sort(null) // prevent automatic sort
            .padAngle(0.02);
        this.data = pieGen(dataset);
    }

    #updateArcs(){
        let arcGen = d3.arc()
            .innerRadius(this.size/4)
            .outerRadius(this.size/2);

        this.arcs = this.arcs.data(this.data, d=>d.data.k)
            .join('path')
            .classed('arc', true)
            .attr('d', arcGen);
    }

    #updateLabels(){
        let arcGen = d3.arc()
            .innerRadius(this.size/2+this.labelSpacing)
            .outerRadius(this.size/2+this.labelSpacing);
        
        this.labels = this.labels.data(this.data, d=>d.data.k)
            .join('text')
            .classed('label', true)
            .attr('transform', d=>`translate(${arcGen.centroid(d)})`)
            .text(d=>d.data.k);
    }

    #updateEvents(){
        // events trigger the callback functions
        // here the callback take the element key as argument
        this.arcs.on('click',(e,d)=>{
            // console.log(d);
            this.arcClick(d.data.k);
        })
        this.arcs.on('mouseover',(e,d)=>{
            // console.log(d);
            this.arcOver(d.data.k);
        })
        this.arcs.on('mouseout',(e,d)=>{
            // console.log(d);
            this.arcOut(d.data.k);
        })
    }

    #updateTooltips(){
        this.arcTips.forEach(t=>t.destroy());
        if(this.tpText){
            this.arcs.attr('data-tippy-content', d=>this.tpText(d.data));
            this.arcTips = tippy(this.arcs.nodes());
        }
    }


    // Public API
    /**
     * Render function, dataset should be in [{key,value}] format
     */
    render(dataset){
        this.#updateData(dataset);
        this.#updateArcs();
        this.#updateLabels();
        this.#updateEvents();
        this.#updateTooltips();
    }

    /**
     * Tooltip text setter
     */
    setTooltip(f=null){
        this.tpText = f;
        this.#updateTooltips();
        return this;
    }

    /**
     * Click callback setter
     */
    setClick(f=()=>{}){
        this.arcClick = f;
        this.#updateEvents();
        return this;
    }

    /**
     * Hover callback setter
     */
    setOver(f=()=>{}){
        this.arcOver = f;
        this.#updateEvents();
        return this;
    }

    /**
     * Out callback setter
     */
    setOut(f=()=>{}){
        this.arcOut = f;
        this.#updateEvents();
        return this;
    }

    /**
     * Highlight arcs from list of keys
     */
    highlightArcs(keys=[]){
        this.arcs.classed('highlight', false)
            .filter(d=>keys.includes(d.data.k))
            .classed('highlight', true);
        return this;
    }
}