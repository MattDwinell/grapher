//declaring global variables
var masterObject = {
  csvArray: [],
  colNames: [],
  colTypes: [],
  cleanQuantArrays: [],
  cleanQuantTitles: []
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
      masterObject.cleanQuantArrays.push(tempArray);
      masterObject.cleanQuantTitles.push(obj.colNames[i])
      console.log(masterObject);
      tempArray = tempArray.filter(isNumber);
      tempArray.sort((a, b) => a - b);

      //the tostring and substring methods being called here are to truncate the values to five sig figs
      let tempMean = parseFloat(d3.mean(tempArray).toString().substring(0, 5));
      let tempMin = parseFloat(d3.min(tempArray).toString().substring(0, 5));
      let tempMax = parseFloat(d3.max(tempArray).toString().substring(0, 5));
      let binSize = (tempMax - tempMin) / 10;
      // console.log(tempMean, tempMin, tempMax, binSize);

      //stats tests go here
      let kurtosis = kurtosisCheck(tempArray).toString().substring(0, 6);
      kurtosis = "Kurtosis: " + kurtosis;
      //  console.log(kurtosis);
      let skewness = skewnessCheck(tempArray).toString().substring(0, 6);
      //  console.log('skewness:' + skewness);
      skewness = "Skewness " + skewness;
      let rangeText = "Range: " + tempMin + '-' + tempMax;
      let median;
      if (tempArray.length / 2 % 2 === 0) {
        meadian = tempArray[Math.floor(tempArray.length / 2)];
      } else {
        median = (tempArray[Math.floor(tempArray.length / 2 - 1)] + tempArray[Math.floor(tempArray.length / 2)]) / 2
      }
      median = 'Median: ' + median;
      //  console.log(rangeText, median);



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
        .attr("height", function (d) { return height - y(0); }) // always equal to 0
      // .attr("height", function (d) { return height - y(d.length); });



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
      //adding stats to right side of histogram:
      svg.append("text")
        .attr("x", (9 * width / 10))
        .attr("y", 16 + margin.top / 2)
        .attr("class", "stats-text")
        .attr("text-anchor", "right")
        .text(rangeText);
      svg.append("text")
        .attr("x", (9 * width / 10))
        .attr("y", 30 + margin.top / 2)
        .attr("class", "stats-text")
        .attr("text-anchor", "right")
        .text(median);
      svg.append("text")
        .attr("x", (9 * width / 10))
        .attr("y", 44 + margin.top / 2)
        .attr("class", "stats-text")
        .attr("text-anchor", "right")
        .text(skewness);
      svg.append("text")
        .attr("x", (9 * width / 10))
        .attr("y", 58 + margin.top / 2)
        .attr("class", "stats-text")
        .attr("text-anchor", "right")
        .text(kurtosis);


      iterator++;
      svgIndex = ".svg" + iterator;
      // console.log(svgIndex);
      svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function (d) { return 0; })
        .attr("height", function (d) { return (height - y(d.length)); })
        .delay(function (d, i) { return (i * 100) })

      //call to generate bar graph for counts of qualitative data
    } else if (obj.colTypes[i] === 'qual') {
      binSortForBar(obj, i)
    }

  }
  //end of for loop for individual histograms, check for scatterplot generation
  if (masterObject.cleanQuantArrays.length >= 2) {
    console.log(masterObject.cleanQuantArrays.length);
    scatterPlot(masterObject);
  }


}
//function for bar graph of counts for qualitative data
function binSortForBar(obj, colNum) {
  // console.log(obj, colNum);

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
  // console.log(tempArray[0]);
  qualobj.colNames.push(init);
  qualobj[init] = 1;
  // console.log(qualobj);
  for (let j = 1; j < tempArray.length; j++) {
    if (qualobj.colNames.length < 21) {
      for (let k = 0; k < qualobj.colNames.length; k++) {
        if (tempArray[j] == qualobj.colNames[k]) {
          let colBin = qualobj.colNames[k];
          // console.log(colBin);
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
    // console.log(qualobj);
    qualobj.d3Array = [];
    for (let i = 0; i < qualobj.colNames.length; i++) {
      let tempObj = {
        key: qualobj.colNames[i],
        value: qualobj.values[i]
      }
      qualobj.d3Array.push(tempObj);
    }
    qualobj.title = obj.colNames[colNum];
    generateBar(qualobj);
  }
  // tempArray.map
}

function generateBar(obj) {
  // console.log(obj);



  // set the dimensions and margins of the graph
  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 720 - margin.left - margin.right,
    height = 375 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#bar-wrapper")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  var data = obj;


  // X axis
  var x = d3.scaleBand()
    .range([0, width])
    .domain(data.colNames)
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data.values)])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
  // console.log(x);
  let xBands = [];
  for (let i = 0; i < obj.colNames.length; i++) {
    xBands.push(margin.left / 2 + i * width / obj.colNames.length);
  }
  // console.log(xBands);
  let xCounter = -1;


  var dmax = d3.max(data.values);
  svg.selectAll("mybar")
    .data(d3.values(data.values))
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function () {
      xCounter++;
      return (xBands[xCounter]);
    })
    .attr("y", function (data) { return y(data); })
    .attr("width", x.bandwidth()) //the width of the bar is the width between the points on the x-axis 
    .attr("height", function (data) { return y(dmax - data) })
  // the height of the points is calculated based on the scale and the difference between this point and the max value of the data.
  //adding a title!
  svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 16 + (margin.top / 2))
    .attr("height", 32)
    .attr("id", "bar-text")
    .attr("text-anchor", "middle")
    .text(obj.title);
}

//function for generating exploratory scatterplots-- will need a mirror version for swapping x/y axes
function scatterPlot(obj) {
  console.log(obj);
  //starting with for loops, a more sophisticated approach may be to map, or to use recursion + counters
  for (let i = 0; i < obj.cleanQuantArrays.length - 1; i++) {
    for (let j = i + 1; j < obj.cleanQuantArrays.length; j++) {
      //getting range values:
      let xMin = d3.min(obj.cleanQuantArrays[i]);
      let xMax = d3.max(obj.cleanQuantArrays[i]);
      let yMin = d3.min(obj.cleanQuantArrays[j]);
      let yMax = d3.max(obj.cleanQuantArrays[j]);
      console.log('xmin/xmax:' + xMin + ' ' + xMax + 'ymin/max:' + yMin + ' ' + yMax);



      //initial svg stuff:
      var margin = { top: 10, right: 30, bottom: 60, left: 75 },
        width = 600 - margin.left - margin.right,
        height = 521 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("#scatterplot-wrapper")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //x and y axis:
      var x = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var y = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

        //titles:
        svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 16 + (margin.top / 2))
        .attr("height", 32)
        .attr("class", "scatterplot-text")
        .attr("text-anchor", "middle")
        .text(obj.colNames[j] + " vs " + obj.colNames[i]);

        svg.append("text")
        .attr("transform", "translate(0," + height + ")")
        // .call(d3.axisBottom(x))
        .attr("class", "x-title")
        .style("text-anchor", "middle")
        .text(obj.colNames[i])
        .attr("width", 100)
        .attr('height', 32)
        .attr("x", (width)/2)
        .attr("y", 35);

        svg.append("text")
        .attr("transform", "translate(-10,0)rotate(-90)")
        // .call(d3.axisBottom(x))
        .attr("class", "y-title")
        .style("text-anchor", "middle")
        .text(obj.colNames[j])
        .attr("width", 100)
        .attr('height', 32)
        .attr("x", (-height)/2)
        .attr("y", -25);

        var k = -1;
        var l = -1;


var data = obj.cleanQuantArrays;
      //adding those dots:
      while(k<obj.cleanQuantArrays[i].length){
      svg.append('g')
      .attr("class","scatterdot")
        .selectAll("dot")
        .data(d3.values(data))
        .enter()
        .append("circle")
        .attr("cx", function () {k++; 
          // console.log(obj.cleanQuantArrays[i][k]);
           return x(obj.cleanQuantArrays[i][k]);
            })
        .attr("cy", function () {l++;
          //  console.log(obj.cleanQuantArrays[j][l]);
            return y(obj.cleanQuantArrays[j][l]);
           })
        .attr("r", 2.0)
        .attr("opacity", .65)
        .style("fill", "#006064")
      }
    }
  }
}






//stats functions

//kurtosis
function kurtosisCheck(numbers) {
  var mean = d3.mean(numbers),
    sum4 = 0,
    sum2 = 0,
    v,
    i = -1,
    n = numbers.length;

  while (++i < n) {
    v = numbers[i] - mean;
    sum2 += v * v;
    sum4 += v * v * v * v;
  }

  return (1 / n) * sum4 / Math.pow((1 / n) * sum2, 2) - 3;
};

//skewness
function skewnessCheck(numbers) {
  var mean = d3.mean(numbers),
    sum3 = 0,
    sum2 = 0,
    v,
    i = -1,
    n = numbers.length;

  while (++i < n) {
    v = numbers[i] - mean;
    sum2 += v * v;
    sum3 += v * v * v;
  }

  return (1 / n) * sum3 / Math.pow((1 / (n - 1)) * sum2, 3 / 2);
};

