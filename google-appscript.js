// Google Apps Script backend for Molly Tracker
// Provides RESTful GET and POST endpoints for FoodLogs and BathroomLogs sheets

/**
 * Handles GET requests to fetch logs from a specified sheet.
 * Example: GET .../exec?sheet=FoodLogs
 */
function doGet(e) {
  try {
    Logger.log("doGet called with params: " + JSON.stringify(e.parameter));
    var sheetName = e.parameter.sheet;
    if (!sheetName) {
      throw new Error('Missing "sheet" parameter.');
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet "' + sheetName + '" not found.');
    }
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      // Only headers or empty
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(
        ContentService.MimeType.JSON,
      );
    }
    var headers = data.shift();
    var result = data.map(function (row) {
      var obj = {};
      headers.forEach(function (header, i) {
        obj[header] = row[i];
      });
      return obj;
    });
    Logger.log("doGet returning " + result.length + " records.");
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    Logger.log("doGet error: " + err.message);
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests to overwrite logs in a specified sheet.
 * Example: POST .../exec?sheet=FoodLogs
 * Body: JSON array of log objects
 */
function doPost(e) {
  try {
    Logger.log("doPost called with params: " + JSON.stringify(e.parameter));
    var sheetName = e.parameter.sheet;
    if (!sheetName) {
      throw new Error('Missing "sheet" parameter.');
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet "' + sheetName + '" not found.');
    }
    var data = JSON.parse(e.postData.contents);
    Logger.log("doPost received " + (data.length || 0) + " records.");

    // Clear old data (except headers)
    if (sheet.getLastRow() > 1) {
      sheet
        .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
        .clearContent();
    }

    // Write new data if present
    if (data.length > 0) {
      var headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];
      var rows = data.map(function (obj) {
        return headers.map(function (header) {
          return obj[header];
        });
      });
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    Logger.log("doPost completed successfully.");
    return ContentService.createTextOutput("Success");
  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Simple test function to verify script is working.
 * Run this in the Apps Script editor to check logging and sheet access.
 */
function testScript() {
  Logger.log("Running testScript...");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var foodSheet = ss.getSheetByName("FoodLogs");
  var bathroomSheet = ss.getSheetByName("BathroomLogs");
  Logger.log(
    "FoodLogs rows: " + (foodSheet ? foodSheet.getLastRow() : "not found"),
  );
  Logger.log(
    "BathroomLogs rows: " +
      (bathroomSheet ? bathroomSheet.getLastRow() : "not found"),
  );
  Logger.log("testScript complete.");
}
