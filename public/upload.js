let masterObject = {
  csvArray: [],
  colNames: [],
  colTypes: []
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
    if (n == -1) {
      return 'quant';
    }
    return 'qual'

  })
  console.log(colMap);
  masterObject.colTypes = colMap;
  histogramGenerate(masterObject);
}

function histogramGenerate(obj) {
  for (let i = 0; i < obj.colTypes.length; i++) {
    if (obj.colTypes[i] === 'quant') {
      console.log(`${i}th column is quantitative`);
      let tempArray = [];
      obj.csvArray.map((item) => {

        tempArray.push(item[i]);
      })
      tempArray.shift();
      tempArray.sort((a, b) => a - b);
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

      for (let i = 0; i < tempArray.length -1; i++) {
        console.log(tempMin, binSize, tempArray[i]);
        if(tempArray[i]<= (tempMin + binSize)){
          bin1Count ++;
        } else if (tempArray[i]<= (tempMin + 2*  binSize)){
          bin2Count++;
        }else if (tempArray[i]<= (tempMin + 3*  binSize)){
          bin3Count++;
        }else if (tempArray[i]<= (tempMin + 4*  binSize)){
          bin4Count++;
        }else if (tempArray[i]<= (tempMin + 5*  binSize)){
          bin5Count++;
        }else if (tempArray[i]<= (tempMin + 6*  binSize)){
          bin6Count++;
        }else if (tempArray[i]<= (tempMin + 7*  binSize)){
          bin7Count++;
        }else if (tempArray[i]<= (tempMin + 8*  binSize)){
          bin8Count++;
        }else if (tempArray[i]<= (tempMin + 9*  binSize)){
          bin9Count++;
        }else if (tempArray[i]<= (tempMin + 10*  binSize)){
          bin10Count++;
        }
        
        console.log(bin1Count, bin2Count, bin3Count, bin4Count, bin5Count, bin6Count, bin7Count, bin8Count, bin9Count, bin10Count);
        // switch (tempArray[i]) {
        //   case (tempArray[i] < (tempMin + binSize)):
        //     bin1Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 2 * binSize)):
        //     bin2Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 3 * binSize)):
        //     bin3Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 4 * binSize)):
        //     bin4Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 5 * binSize)):
        //     bin5Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 6 * binSize)):
        //     bin6Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 7 * binSize)):
        //     bin7Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 8 * binSize)):
        //     bin8Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 9 * binSize)):
        //     bin9Count++;
        //     break;
        //   case (tempArray[i] < (tempMin + 10 * binSize)):
        //     bin10Count++;
        //     break;
        //   default:
        //     console.log('error');
        //     console.log(tempArray[i]);
        //     console.log(tempMin + binSize);
        //     console.log(tempArray[i] < (tempMin + binSize));
        //     break;
        // }
      }

      console.log(bin1Count, bin2Count, bin3Count, bin4Count, bin5Count, bin6Count, bin7Count, bin8Count, bin9Count, bin10Count);
      //adding histogram stuff here



    }

  }
}
