// Google Apps Script backend for Molly Tracker

function doGet(e) {
  var sheetName = e.parameter.sheet;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  var result = data.map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doPost(e) {
  var sheetName = e.parameter.sheet;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = JSON.parse(e.postData.contents);

  // Clear old data (except headers)
  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .clearContent();
  }

  // Write new data
  if (data.length > 0) {
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var rows = data.map(function (obj) {
      return headers.map(function (header) {
        return obj[header];
      });
    });
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  return ContentService.createTextOutput("Success");
}
