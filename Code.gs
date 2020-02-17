//TODO: who received form who filled out

var myFormId = "1-lHWqhiO8V974roEh-L3zMLiVCJDxQa3i4zo4i1f_7M";
var reponsesFile = "1HzlcbQNUmAsQYV-xMplZQQUk7q9V4PvTKFxhy39_ThM";
var vendorFolder = "Management/Vendor Questionnaire/";
var urlCol = 50; // column where is url
var sheetNameResponses = 'Form Responses 1';

function submitForm2(e) {

//  if (e.range.getNotes()[0].join('')) { // it's update of a previous form submission
//  }

  saveAllFiles(e);
  assignEditUrls();
}

function assignEditUrls() {
  var form = FormApp.openById(myFormId);
  //enter form ID here
  
  var ssa = SpreadsheetApp.openById(reponsesFile);
  var sheet = ssa.getSheetByName(sheetNameResponses);
  
  //Change the sheet name as appropriate
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  var responses = form.getResponses();
  var timestamps = [], urls = [], resultUrls = [];
  
  for (var i = 0; i < responses.length; i++) {
    timestamps.push(responses[i].getTimestamp().setMilliseconds(0));
    urls.push(responses[i].getEditResponseUrl());
  }
  for (var j = 1; j < data.length; j++) {
    
    resultUrls.push([data[j][0]?urls[timestamps.indexOf(data[j][0].setMilliseconds(0))]:'']);
  }
  sheet.getRange(2, urlCol, resultUrls.length).setValues(resultUrls);  
}

function saveAllFiles(e) {
  var ssa = SpreadsheetApp.openById(reponsesFile);
  var sheet = ssa.getSheetByName(sheetNameResponses);
  var out = "";
 
  //Logger.log(e.toString());
  var companyName = e.namedValues["Company Name"][0];
  var time = e.namedValues["Timestamp"][0];
  //sheet.getRange(sheet.getLastRow(), 49).setValue(out+=" | "+new_folder);

  for (var i in e.namedValues) { 
    if (e.namedValues[i] && e.namedValues[i][0] && e.namedValues[i][0]!="") {
      var fNames = e.namedValues[i][0].split(",");
      for (var s=0; s<fNames.length; s++) {
        saveFile2Folder(fNames[s], companyName, i, time);
      }   
    }
  }
} 

function saveFile2Folder(fName, companyName, fileCategory, time) 
{
  try {
    var url = getIdFromUrl(fName);
    if (url) {
      var file = DriveApp.getFileById(url);
      var new_folder = getFolderByPath_(vendorFolder + companyName + "/" + fileCategory);
      
      file.makeCopy(file.getName()+" | fileCategory: "+fileCategory+" | companyName: "+companyName+" | time: "+time, new_folder);
    }    
  }
  catch (e) {
    Logger.log(e.toString());
  }
}


function getFolderByPath_(path) {
  var parts = path.split("/");

  if (parts[0] == '') parts.shift(); // Did path start at root, '/'?

  var folder = DriveApp.getRootFolder();
  for (var i = 0; i < parts.length; i++) {
    var result = folder.getFoldersByName(parts[i]);
    if (result.hasNext()) {
      folder = result.next();
    } else {
      folder = folder.createFolder(parts[i]);

      break;
    }
  }
  return folder;
}

function getIdFromUrl(url) 
{ 
  var ret = url.match(/[-\w]{25,}/);
  return ret ? ret[0] : null;
}

function reCopyFiles()
{
  var form = FormApp.openById(myFormId);
  var responses = form.getResponses();

  var items = form.getItems();
  var companyNameItem = null;
  
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle()=="Company Name")
      companyNameItem = items[i];
  }
  if (!companyNameItem) return;
  
  for (var r = 0; r < responses.length; r++) {
    for (var i = 0; i < items.length; i++) {
      var iRes = responses[r].getResponseForItem(items[i]);
      if (iRes && iRes!="") {
        var fNames = iRes.getResponse().toString().split(",");
        for (var s=0; s<fNames.length; s++) {
          saveFile2Folder(fNames[s], responses[r].getResponseForItem(companyNameItem).getResponse(), items[i].getTitle(), responses[r].getTimestamp().setMilliseconds(0));
        }
      }
    }
  }
}