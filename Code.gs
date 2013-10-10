var FORM_ID = "15O4ts5nBVUtfluPeSK1JgbjvauAiWmETrBbLreiIEhI";
var SPREADSHEET_ID = "0AirK-4dEIsvKdDNjR3dtSm5BR0ZSel9XTWRQVXZmZ2c";
var CLAIM_URL_BASE = "https://sites.google.com/site/philbadgetest/";

var FormCols = {}
FormCols.TIMESTAMP = 1;
FormCols.EMAIL = 3;
FormCols.NAME = 2;
FormCols.BADGE = 4;
FormCols.EVIDENCE = 5;

var BadgeCols = {};
BadgeCols.NAME = 1;
BadgeCols.DESCRIPTION = 2;
BadgeCols.IMAGE = 3;
BadgeCols.CRITERIA = 4;

// initialising some of these as blank to to keep human readable structure
var ASSERTION_TEMPLATE = {
  "uid": "",
  "recipient": {
    "identity": "",
    "type": "email",
    "hashed": "false"
  },
  "badge": getScriptUrl()+"?type=badge",
  "issuedOn": "", 
  "verify": { 
    "type": "hosted",
    "url": ""
  },
  "evidence": ""
};
   
var BADGE_TEMPLATE = {
  "name": "",
  "description": "",
  "image": "",
  "criteria": "",
  "issuer": getScriptUrl()+"?type=issuer"
};

var ISSUER_TEMPLATE = {
  "name": "SUNY TOEP",
  "url": "https://sites.google.com/site/sunytoep"
};

function onFormSumbit(e) {
  var doc = SpreadsheetApp.openById(SPREADSHEET_ID);
  var formSheet = doc.getSheetByName("Form Responses");
  var lastRow = formSheet.getLastRow()+1;  // RACE! Seek ways to fix this
   
  var formResponse = e.response;
  var timestamp = formResponse.getTimestamp();
  var name = formResponse.getItemResponses()[0].getResponse();
  var email = formResponse.getItemResponses()[1].getResponse();
 
  var claim_code = "row=" + lastRow;
  var encoded_claim_code = Utilities.base64Encode(claim_code);
  var url = CLAIM_URL_BASE+"?claim_code=" + encoded_claim_code; // build the url to be emailed to person. for now, one claim code at a time. future: multiple (?)

  var emailText = "Hi "+name+",\nThanks for trying the Open Badges Issuer Gadget. To claim you badges visit \n\n" + url;
  MailApp.sendEmail(email, "Claim your Open Badges Issuer Gadget Badges", emailText);
}

function doGet(e){ 
  var doc = SpreadsheetApp.openById(SPREADSHEET_ID);
  var formSheet = doc.getSheetByName("Form Responses");
  var badgesSheet = doc.getSheetByName("Badges");
  
  if (!("type" in e.parameter)) {
    // something is wrong. I need to know the type of the json blob you're requesting
  }
  
  var returnObj = {};
  switch(e.parameter.type) {
    case "assert":
      returnObj = doGetAssert(badgesSheet, formSheet, e.parameter.claim_code);
      break;
    case "badge":
      returnObj = doGetBadge(badgesSheet, e.parameter.id);
      break;
    case "issuer":
      returnObj = ISSUER_TEMPLATE;
      break;
    default:
      // error case! not sure what to do here
      break;
  }
  
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(returnObj));
  return output;
}

function doGetAssert(badgesSheet, formSheet, encoded_claim_code) {
  var claim_data = getClaimData(encoded_claim_code);
  ASSERTION_TEMPLATE["verify"]["url"] = getScriptUrl() + "?type=assert&claim_code=" + encoded_claim_code;
  
  ASSERTION_TEMPLATE["recipient"]["identity"] = formSheet.getRange(claim_data.row, FormCols.EMAIL).getValue();
  ASSERTION_TEMPLATE["issuedOn"] = formSheet.getRange(claim_data.row, FormCols.TIMESTAMP).getValue();
  ASSERTION_TEMPLATE["evidence"] = formSheet.getRange(claim_data.row, FormCols.EVIDENCE).getValue();
  ASSERTION_TEMPLATE["badge"] += "&id=" + getBadgeIdFromTitle(badgesSheet, formSheet.getRange(claim_data.row, FormCols.BADGE).getValue());
  ASSERTION_TEMPLATE["uid"] = ASSERTION_TEMPLATE["recipient"]["identity"] + ASSERTION_TEMPLATE["issuedOn"];
  
  return ASSERTION_TEMPLATE;
}

function getClaimData(encoded_claim_code) {
  var claim_encode = Utilities.base64Decode(encoded_claim_code); // decode claim_code
  var claim_code = bin2String(claim_encode); // need to convert byte array to string
  return getQueryString("?"+claim_code);
}

function doGetBadge(badgesSheet, badgeIdString) {
  var row = parseInt(badgeIdString);
  BADGE_TEMPLATE["name"] = badgesSheet.getRange(row, BadgeCols.NAME).getValue();
  BADGE_TEMPLATE["description"] = badgesSheet.getRange(row, BadgeCols.DESCRIPTION).getValue();
  BADGE_TEMPLATE["image"] = badgesSheet.getRange(row, BadgeCols.IMAGE).getValue();
  BADGE_TEMPLATE["criteria"] = badgesSheet.getRange(row, BadgeCols.CRITERIA).getValue();
  return BADGE_TEMPLATE;
}

// Modification of http://stackoverflow.com/a/647272/1027723
function getQueryString(ref) {
  var qs= ref.split('?');
  var result = {}, queryString = qs[1],
      re = /([^&=]+)=([^&]*)/g, m;
  while (m = re.exec(queryString)) {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  return result;
}

function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

function getBadgeIdFromTitle(badgesSheet, title) {
  for (var i=1; i<=badgesSheet.getLastRow(); i++) {
    if (badgesSheet.getRange(i, 1).getValue() == title) {
      return i;
    }
  }
  return 0;
}

function updateBadgeChoices() {
  var form = FormApp.openById(FORM_ID);
  var doc = SpreadsheetApp.openById(SPREADSHEET_ID);
  var badgesSheet = doc.getSheetByName("Badges");
  var values = [];
  for (var i=1; i<=badgesSheet.getLastRow(); i++) {
    values.push(badgesSheet.getRange(i, 1).getValue());
  }
  var badgesList = form.getItems()[2].asListItem().setChoiceValues(values);  // the THIRD question should be the badge question
}