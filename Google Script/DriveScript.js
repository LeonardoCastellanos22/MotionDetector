const TOKEN = "YOUR-UBIDOTS-TOKEN";// Put here your Ubidots Token
const DEVICELABEL = "motiondetector"; // Change device label as desired
const VARIABLE = "picture";// Change variable label as desired

function doPost(e) {
  var data = Utilities.base64Decode(e.parameters.data);
  var nombreArchivo = Utilities.formatDate(new Date(), "GMT-5", "yyyyMMdd_HHmmss")+".jpg";
  var blob = Utilities.newBlob(data, e.parameters.mimetype, nombreArchivo );  
  var folder, folders = DriveApp.getFoldersByName("ESP32-CAM");
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder("ESP32-CAM");
  }
  var file = folder.createFile(blob); 
  sendUbidots(file,folder);  
  return ContentService.createTextOutput("Completed.")
}

function sendUbidots(file, folder){

    var fileID = file.getId();
    var fileName = file.getName();
    var folderID = folder.getId();
    var payload = {};
    payload = {"camaraids":{"value":1,"context":{"fileID":fileID,"folderID":folderID,"fileName":fileName}}};
    var options = {
      "contentType" : "application/json",
      "headers" : {"X-Auth-Token": TOKEN},
      "payload": JSON.stringify(payload),
      "method": "post"
    };
    try{
   var response = 
        UrlFetchApp.fetch("https://industrial.api.ubidots.com/api/v1.6/devices/" + DEVICELABEL  + "/? force=true", options);
      
    if(response.getResponseCode() == 200){
      return JSON.parse(response.getContentText());  
    }
  } catch(e) { 
    console.log(e.message);     
    return null;
  }
  
}
