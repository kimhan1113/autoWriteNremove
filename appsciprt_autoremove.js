function moveNremoveRow() {

  var url = 'sheeturl';
  var root_sheet = "일반 2차 가공";
  var copy_sheet = "[일반] 지원자 DB";

  // const todays = Utilities.formatDate(new Date(), "GMT+9", "yyyy-MM-dd");


  // 어제 날짜 데이터 추출
  // var yes_data = fetch_yes_index(url, root_sheet);
  // console.log(yes_data);

  // 어제 날짜 데이터 쓰기
  // write_new_clue(url, copy_sheet, yes_data);

  // markDup
  
  // 중복제거하는 함수
  removeDupRow(url, copy_sheet);
}

function fetch_yes_index(url, root_sheet_name){

  const ss = SpreadsheetApp.openByUrl(url);
  const sheet = ss.getSheetByName(root_sheet_name);
  const Asheet = sheet.getRange("A1:A").getValues();
  
  let yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  // 어제 날짜추출
  yesterday = Utilities.formatDate(yesterday, "GMT+9", "yyyy-MM-dd");

  let yes_index = [];
  const yes_data = [];

  for(let i = 1; i<= Asheet.length; i++){

    try {
      if(Asheet[i].toString().length != 0){
        // var check = JSON.stringify(Asheet[i]).slice(2,12).trim();

        let date = new Date(Asheet[i]);

        var datecheck = Utilities.formatDate(date,"GMT+9", "yyyy-MM-dd");

        if(yesterday == datecheck){
          yes_index.push(i+1);
        }  
      }
    } catch (error) {
      break;
    }     
    
  }

  yes_index.forEach(function(index){

    const data = sheet.getRange(index,1,1,25).getValues();
    yes_data.push(data);
    // console.log(index);
  });

  return yes_data;
  
}


function write_new_clue(url, checkSheet, array){

  var url = SpreadsheetApp.openByUrl(url);
  const sheet = url.getSheetByName(checkSheet);
  const settleDay = sheet.getRange("A1:A").getValues();
  const settleDayIndex = settleDay.filter(String).length-1;
  const lastvalue = settleDay.filter(String)[settleDayIndex];

  const startIndex = settleDay.lastIndexOf(lastvalue)+2;

  let count = 0
  let arrayLen = array.length;

  let datecheck = Utilities.formatDate(array[count][0][0],"GMT+9", "yyyy-MM-dd");

  for(let k = startIndex; k<startIndex+arrayLen; k++){
    try{

      // 날짜 포맷때문에 위에꺼 실행 후 아래 꺼 실행 (이유는 모르겠다 한번 씌여지면 날짜포맷이 변경되지 않는다.)
      sheet.getRange("A" + String(k)).setValue(datecheck); 
      sheet.getRange(k,1,1,25).setValues(array[count]).getHorizontalAlignments('center');
      
      count += 1; 

    }catch(error){


      sheet.getRange("A" + String(k)).setValue(datecheck); 
      sheet.getRange(k,1,1,25).setValues(array[count]);

      count += 1; 

    }
  }
}


function markDup(urlName, checkSheet){


  var url = SpreadsheetApp.openByUrl(urlName);
  const sheet = url.getSheetByName(checkSheet);
  // var last_row = sheet.getRange(3, 2, sheet.getLastRow(), 1).getValues().filter(String).length;

  const Bsheet = sheet.getRange("B:B").getValues();


  const Barray = Object.values(Bsheet);


  // 2D -> 1D carray
  let new_Carr = getNewCarray(Barray);
  let dup_list = getDupList(new_Carr, Bsheet);


  for (let i=0; i<dup_list.length; i++){
    
    // 덮허 씌울 행들..
    let len = dup_list[i].length;

    for(var j =0; j<len-1; j++){
  
      var number = dup_list[i][j];
      
      try{

        console.log(number+1);
        var cell = sheet.getRange("Y"+ String(number+1));
        cell.setValue("delete");

      } catch (e){
        console.log(`${number+1} ${name}행 에러남!!`);
      }
  
      //(start row, start column, number of rows, number of columns 
    }

    Logger.log('------------------------------------------------------------------');
  }
 
}


// indexof를 이용해서 중복자들의 index를 가져오자!!
function getMap(arr){
  const result = {};
  arr.forEach((x) => { 
    result[x] = (result[x] || 0)+1; 
  });

  const result_ = JSON.stringify(result);
  const result_count = JSON.parse(result_);
  const result_counts = Object.entries(result_count);

  return result_counts
}


function getDupList(new_Carr, Bsheet){

  const result = getMap(Bsheet);
  const dup_list = [];

  for(var i=0; i<result.length; i++){
    if(result[i][1] > 1){
      dup_list.push(result[i][0]); 
    }
  };
  //중복 인덱스 가져오기!!
  total_index = []

  for(var j=1; j<dup_list.length; j++){
    var indices = [];
    let element = dup_list[j];
    let idx = new_Carr.indexOf(element);
    while (idx != -1) {
      indices.push(idx);
      idx = new_Carr.indexOf(element, idx + 1);
    }
    total_index.push(indices);
  }

  return total_index;

}

function getNewCarray(Barray){

  let new_Carr = [];

  // 2D -> 1D B column
  for(var i =0; i<Barray.length; i++){
    new_Carr = new_Carr.concat(Barray[i]);
  }

  return new_Carr;

}

 
function removeDupRow(urlName, checkSheet) {

  // delete할 행 표시
  markDup(urlName, checkSheet);

  var url = SpreadsheetApp.openByUrl(urlName);
  const ss = url.getSheetByName(checkSheet);
  var last_row = ss.getRange(3, 1, ss.getLastRow(), 1).getValues().filter(String).length;

  var range = SpreadsheetApp
               .openByUrl(urlName)
               .getSheetByName(checkSheet)
               .getRange(3,1,last_row,25);

  var rangeVals = range.getValues();

  const ysheet = ss.getRange("y3:y" + String(last_row+2)).getValues();

  var newRangeVals = [];

  ysheet.forEach(function(value, index){

    // y열에 delete 제외 
    if(value[0] != "delete"){
      newRangeVals.push(rangeVals[index]);
    }

  });
  
  // 3행부터 끝행까지 전부 clear
  range.clearContent();
  
  var newRange = ss.getRange(3,1,newRangeVals.length, newRangeVals[0].length);
  newRange.setValues(newRangeVals);


};
 









