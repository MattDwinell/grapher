let masterObject = {
  csvArray: [],
  colNames: [],
  colTypes: []
}
var svgIndex = ".svg1";
var iterator = 1;

function isNumber(arrayItem){
 return !isNaN(parseFloat(arrayItem)) && isFinite(arrayItem);
}

function uploadDealcsv() { };

/*------ Method for read uploded csv file ------*/
uploadDealcsv.prototype.getCsv = function (e) {
  let input = document.getElementById('dealCsv');
  input.addEventListener('change', function () {

    if (this.files && this.files[0]) {

      var myFile = this.files[0];
      var reader = new FileReader();

      reader.addEventListener('load', function (e) {

        let csvdata = e.target.result;
        parseCsv.getParsecsvdata(csvdata); // calling function for parse csv data 
      });

      reader.readAsBinaryString(myFile);
    }
  });
}

/*------- Method for parse csv data and display --------------*/
uploadDealcsv.prototype.getParsecsvdata = function (data) {

  let parsedata = [];

  let newLinebrk = data.split("\n");
  for (let i = 0; i < newLinebrk.length; i++) {

    parsedata.push(newLinebrk[i].split(","))
  }

  console.table('csv uploaded, of length ' + parsedata.length);
  masterObject.csvArray = parsedata;
  masterObject.colNames = parsedata[0];
  typeSeparate(masterObject);
}
var parseCsv = new uploadDealcsv();
parseCsv.getCsv();

function typeSeparate(masterObject) {
  // console.log(masterObject);
  let columnNames = masterObject.colNames;
  // console.log(columnNames);
  let reg = /^[a-zA-Z]/g;
  let colMap = masterObject.csvArray[1].map((col) => {
    let n = col.search(/[a-zA-Z]/i);
    if (n == -1) {
      return 'quant';
    }
    return 'qual'

  })
  masterObject.colTypes = colMap;
  histogramGenerate(masterObject);
}

function histogramGenerate(obj) {
  console.log(obj)
  for (let i = 0; i < obj.colTypes.length; i++) {
    if (obj.colTypes[i] === 'quant') {
      console.log(`${i}th column is quantitative`);
      let tempArray = [];
      obj.csvArray.map((item) => {

        tempArray.push(parseFloat(item[i]));
      })
      console.log(tempArray);
      tempArray = tempArray.filter(isNumber);
      // tempArray.shift();
      tempArray.sort((a, b) => a - b);
      // tempArray.shift();
      console.log(tempArray);
      let tempMean = parseFloat(d3.mean(tempArray).toString().substring(0, 5));
      let tempMin = parseFloat(d3.min(tempArray).toString().substring(0, 5));
      let tempMax = parseFloat(d3.max(tempArray).toString().substring(0, 5));
      let binSize = (tempMax - tempMin) / 10;
      console.log(tempMean, tempMin, tempMax, binSize);
      let bin1Count = 0;
      let bin2Count = 0;
      let bin3Count = 0;
      let bin4Count = 0;
      let bin5Count = 0;
      let bin6Count = 0;
      let bin7Count = 0;
      let bin8Count = 0;
      let bin9Count = 0;
      let bin10Count = 0;

      for (let i = 0; i < tempArray.length - 1; i++) {
        if (tempArray[i] <= (tempMin + binSize)) {
          bin1Count++;
        } else if (tempArray[i] <= (tempMin + 2 * binSize)) {
          bin2Count++;
        } else if (tempArray[i] <= (tempMin + 3 * binSize)) {
          bin3Count++;
        } else if (tempArray[i] <= (tempMin + 4 * binSize)) {
          bin4Count++;
        } else if (tempArray[i] <= (tempMin + 5 * binSize)) {
          bin5Count++;
        } else if (tempArray[i] <= (tempMin + 6 * binSize)) {
          bin6Count++;
        } else if (tempArray[i] <= (tempMin + 7 * binSize)) {
          bin7Count++;
        } else if (tempArray[i] <= (tempMin + 8 * binSize)) {
          bin8Count++;
        } else if (tempArray[i] <= (tempMin + 9 * binSize)) {
          bin9Count++;
        } else if (tempArray[i] <= (tempMin + 10 * binSize)) {
          bin10Count++;
        }
      }
      let barData = [bin1Count, bin2Count, bin3Count, bin4Count, bin5Count, bin6Count, bin7Count, bin8Count, bin9Count, bin10Count];
      // let tempDiv = document.createElement("div").classList.add("wrapper");
      // document.getElementById("histogram-wrapper").append(tempDiv);

      var data = tempArray;
      var tempSVG = document.createElement("svg");

      var formatCount = d3.format(",.0f");
      // d3.selectAll("svg > *").remove();
      console.log(svgIndex);
      let svg = d3.select("#histogram-wrapper").append("svg")
      .attr("class", "svg1")
      .attr("width", 720)
      .attr("height", 375);
      console.log(svg);
      var margin = { top: 10, right: 30, bottom: 30, left: 30 };
      var width = +svg.attr("width") - margin.left - margin.right;
      var height = +svg.attr("height") - margin.top - margin.bottom;
      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scaleLinear()
        .domain([tempMin, tempMax])
        .range([0, width]);

      var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20))
        (data);

      var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function (d) { return d.length; })])
        .range([height, 0]);

      var bar = g.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

      bar.append("rect")
        .attr("x", 1)
        .attr("width", Math.abs( x(bins[0].x1) - x(bins[0].x0) - 1))
        .attr("height", function (d) { return height - y(d.length); });

      bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function (d) { return formatCount(d.length); });

      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
      svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 16 + (margin.top / 2))
        .attr("id", "text")
        .attr("text-anchor", "middle")
        .text(obj.colNames[iterator-1]);


      iterator++;
      svgIndex = ".svg" + iterator;
      console.log(svgIndex);



      // svgclear();
      //   console.log(barData)
      //   var histogram = d3.histogram();
      // var bins = histogram(tempArray);
      // console.log(bins);

      //adding histogram stuff here
      //       var data = tempArray;

      // var formatCount = d3.format(",.0f");

      // var svg = d3.select("svg"),
      //     margin = {top: 10, right: 30, bottom: 30, left: 30},
      //     width = +svg.attr("width") - margin.left - margin.right,
      //     height = +svg.attr("height") - margin.top - margin.bottom,
      //     g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // var x = d3.scaleLinear()
      //     .rangeRound([0, width]);

      // var bins = d3.histogram()
      //     .domain(x.domain())
      //     .thresholds(x.ticks(10))
      //     (data);
      //     console.log(bins);

      // var y = d3.scaleLinear()
      //     .domain([0, tempMax])
      //     .range([height, 0]);

      // var bar = g.selectAll(".bar")
      //   .data(bins)
      //   .enter().append("g")
      //     .attr("class", "bar")
      //     .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

      // bar.append("rect")
      //     .attr("x", 1)
      //     .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      //     .attr("height", function(d) { return height - y(d.length); });

      // bar.append("text")
      //     .attr("dy", ".75em")
      //     .attr("y", 6)
      //     .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      //     .attr("text-anchor", "middle")
      //     .text(function(d) { return formatCount(d.length); });

      // g.append("g")
      //     .attr("class", "axis axis--x")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(d3.axisBottom(x));



    }

  }
}
