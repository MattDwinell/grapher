let masterObject = {
  csvArray: [],
  colNames: [],
  colTypes:[]
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
  console.log(masterObject);
  let columnNames = masterObject.colNames;
  console.log(columnNames);
  let reg = /^[a-zA-Z]/g;
  let colMap = masterObject.csvArray[1].map((col) => {
    console.log(col.match(reg));
    let n = col.search(/[a-zA-Z]/i);
    console.log('search results:' + n)
    if (n==-1) {
        return 'quant';
    }
      return 'qual'
    
  })
  console.log(colMap);
  masterObject.colTypes = colMap;
  histogramGenerate(masterObject);
}

function histogramGenerate(obj){
  for(let i=0; i<obj.colTypes.length; i ++){
    if (obj.colTypes[i]==='quant'){
      console.log(`${i}th column is quantitative`);
      let tempArray = [];
      obj.csvArray.map((item)=>{
        
        tempArray.push(item[i]);
      })
      console.log(tempArray);
       tempArray.shift();
      let tempMean =parseFloat( d3.mean(tempArray).toString().substring(0,5));
      let tempMin = parseFloat(d3.min(tempArray).toString().substring(0,5));
      let tempMax = parseFloat(d3.max(tempArray).toString().substring(0,5));
      let binSize = (tempMax- tempMin)/10;
      console.log(tempMean, tempMin, tempMax, binSize);


    }

  }
}
