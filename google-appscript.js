function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function doOptions(e) {
  // Handle preflight requests
  return createCorsResponse("");
}

function handleRequest(e, method) {
  try {
    // ... your existing logic for GET/POST ...
    // For GET, return JSON data; for POST, write data and return "Success"
    // (Copy your logic here from previous code)
    // Example for GET:
    if (method === "GET") {
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
      return createCorsResponse(JSON.stringify(result));
    }
    // Example for POST:
    if (method === "POST") {
      var sheetName = e.parameter.sheet;
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(sheetName);
      var data = JSON.parse(e.postData.contents);
      if (sheet.getLastRow() > 1) {
        sheet
          .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
          .clearContent();
      }
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
      return createCorsResponse("Success");
    }
  } catch (err) {
    return createCorsResponse(JSON.stringify({ error: err.message }));
  }
}

function createCorsResponse(content) {
  var response = ContentService.createTextOutput(content);
  response.setMimeType(ContentService.MimeType.JSON);
  response.getResponse().setHeader("Access-Control-Allow-Origin", "*");
  response
    .getResponse()
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response
    .getResponse()
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
