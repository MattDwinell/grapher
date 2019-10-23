//declaring global variables
var masterObject = {
  csvArray: [],
  colNames: [],
  colTypes: []
}
var svgIndex = ".svg1";
var iterator = 1;

//simple data cleaning function, removing anything that's not a number for quant fields.
function isNumber(arrayItem) {
  return !isNaN(parseFloat(arrayItem)) && isFinite(arrayItem);
}

//method to read an uploaded csv file. takes file and inserts it into csv parse method
function uploadDealcsv() { };
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

//method to parse csv based on commas. can now manipulate data as a series of arrays.
uploadDealcsv.prototype.getParsecsvdata = function (data) {
  // console.log(data);

  let parsedata = [];

  let newLinebrk = data.split("\n");
  for (let i = 0; i < newLinebrk.length; i++) {

    parsedata.push(newLinebrk[i].split(","))
  }

  console.table('csv uploaded, of length ' + parsedata.length);
  // console.log(parsedata);
  masterObject.csvArray = parsedata;
  masterObject.colNames = parsedata[0];
  typeSeparate(masterObject);
}
var parseCsv = new uploadDealcsv();
parseCsv.getCsv();

//method to determine if a field is quantitative or qualitative by looking at the second row of data.
function typeSeparate(masterObject) {
  // console.log(masterObject);
  let columnNames = masterObject.colNames;
  // console.log(columnNames);
  let reg = /^[a-zA-Z]/g;
  let colMap = masterObject.csvArray[1].map((col) => {
    let n = col.search(/[a-zA-Z]/i);
    let p = col.search(/[0-9]/i);
    if (n == -1 && col.length >= 1 && p != -1) {
      return 'quant';
    }
    return 'qual'

  })
  masterObject.colTypes = colMap;
  histogramGenerate(masterObject);
}

//checks each field to see if it is quantitative. if it is, it creates a preliminary histogram with the help of d3
function histogramGenerate(obj) {
  console.log(obj)
  for (let i = 0; i < obj.colTypes.length; i++) {
    if (obj.colTypes[i] === 'quant') {
      console.log(`${i}th column is quantitative`);
      let tempArray = [];
      obj.csvArray.map((item) => {
        // console.log(item[i])
        let n;
        if (item[i]) {
          n = item[i].search(/[0-9]/i);


          if (n != -1) {
            item[i] = item[i].replace(/"/g, "");
            tempArray.push(parseFloat(item[i]));
          }
        }

        // console.log(parseFloat(item[i]));
      })

      // console.log(tempArray);
      tempArray = tempArray.filter(isNumber);
      tempArray.sort((a, b) => a - b);
      // console.log(tempArray);

      //the to string and substring methods being called here are to truncate the values to five sig figs
      let tempMean = parseFloat(d3.mean(tempArray).toString().substring(0, 5));
      let tempMin = parseFloat(d3.min(tempArray).toString().substring(0, 5));
      let tempMax = parseFloat(d3.max(tempArray).toString().substring(0, 5));
      let binSize = (tempMax - tempMin) / 10;
      console.log(tempMean, tempMin, tempMax, binSize);

      //creating the actual histogram, using temp array as our data
      var data = tempArray;
      var formatCount = d3.format(",.0f");
      // console.log(svgIndex);
      let svg = d3.select("#histogram-wrapper").append("svg")
        .attr("class", "svg1")
        .attr("width", 720)
        .attr("height", 375);
      // console.log(svg);
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
        .attr("width", Math.abs(x(bins[0].x1) - x(bins[0].x0) - 1))
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
        .text(obj.colNames[iterator - 1]);
      iterator++;
      svgIndex = ".svg" + iterator;
      // console.log(svgIndex);

      //call to generate bar graph for counts of qualitative data
    } else if (obj.colTypes[i] === 'qual') {
      binSortForBar(obj, i)
    }

  }
}
//function for bar graph of counts for qualitative data
function binSortForBar(obj, colNum) {
  console.log(obj, colNum);
  let tempArray = [];
  obj.csvArray.map((item) => {
    if (item[colNum]) {
      tempArray.push(item[colNum]);
    }
  })
  tempArray.shift();
  //looping through our header-less array to determine how many different types of qual data there are
  //will put a hard stop at 20 data types-- more than that and it is likely filled w/ unique values
  var qualobj = {
    colNames: [],
    values: []
  }
  // console.log(tempArray);
  let init = tempArray[0];
  console.log(tempArray[0]);
  qualobj.colNames.push(init);
  qualobj[init] = 1;
  console.log(qualobj);
  for (let j = 1; j < tempArray.length; j++) {
    if (qualobj.colNames.length < 21) {
      for (let k = 0; k < qualobj.colNames.length; k++) {
        if (tempArray[j] == qualobj.colNames[k]) {
          let colBin = qualobj.colNames[k];
          console.log(colBin);
          qualobj[colBin]++;
        } else if (qualobj.colNames.length - 1 === k) {
          qualobj.colNames.push(tempArray[j]);
          let attr = tempArray[j];
          qualobj[attr] = 0;

        }
      }
    } else {
      console.log(`too many bins: ${qualobj.colNames.length}`);

    }

  }
  var sum = 0;
  qualobj.colNames.map((name) => {
    sum += qualobj[name];
  })

  if (sum === tempArray.length) {
    console.log("20 or less bins, sum of bins equals array length");
    for (const key in qualobj) {
      if (qualobj.hasOwnProperty(key)) {
        const element = qualobj[key];
        if (typeof (element) == 'number') {
          qualobj.values.push(element);
        }


      }
    }
    console.log(qualobj);
    generateBar(qualobj);
  }
  // tempArray.map
}

function generateBar(obj) {
  console.log(obj);

  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  //appending an svg element to the bar wrapper div
  var svg = d3.select("#bar-wrapper")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  // d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv", function(data) {

  // sort data
  // data.sort(function(b, a) {
  // return a.Value - b.Value;
  // });

  // X axis
  var x = d3.scaleBand()
    .range([0, width])
    .domain(obj.colNames)
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
//   var y = d3.scaleLinear()
//     .domain([0, d3.max(obj.values)])
//     .range([height, 0]);
//   svg.append("g")
//     .call(d3.axisLeft(y));
// var data = obj;
//     svg.selectAll()
//     .data(data)
//     .enter()
//     .append('rect')
//     .attr('x', (obj) =>{ console.log(obj,);
//      return  x(obj.colNames)})
//     .attr('y', (s) => y(s))
//     .attr('height', (s) => height - y(s))
//     .attr('width', x.bandwidth())

    // svg.selectAll("rect")
    // .data(obj.values)
    // .enter()
    // .append("rect")
    // .attr("height", 200)
    // .attr("width", x.bandwith())
    // .attr("x", function(d,i){return (i * 5) + 25})
    // .attr("y",  20);

  // Bars
  // svg.selectAll(".bar")
  //    .data(obj)
  //    .enter()
  //   .append("rect")
  //   .attr("x", obj.colNames)
  //   .attr("y", obj.values)
  //   .attr("width", x.bandwidth())
  //   .attr("height", height - obj.values)
  //   .attr("fill", "#69b3a2");

}
