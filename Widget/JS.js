var TOKEN = 'BBFF-MUDDPdoNZT2soyNN7ABMCFRLJO6JDH';//Put your Ubidots Token
var DEVICE = "esp32real";//Your device label
const VARIABLE = 'camaraIDS';//Your variable label

const HEADERS = {
    "X-Auth-Token": TOKEN,
    "Content-Type": "application/json"
}

const BASEURLV16 = "https://industrial.api.ubidots.com/api/v1.6/devices";
const BASEURLDELETE = "https://industrial.ubidots.com/api/v2.0/variables";
const BASEURLV2 = 'https://industrial.api.ubidots.com/api/v2.0';
const LINKDRIVE = 'https://drive.google.com/uc?id=';
const PAGESIZE = 20;

var deviceId;
var variableIds;
var end;
var lastfileId;
var lastLink;
var lastTimestamp;
var lastDate;
var currentTimestamp;
var fileIds = [];
var values = [];
var links = [];
var timestamp = [];
var dates = [];
var mostrarFoto = document.getElementById("link");    
var $update = $('#dateSelected');
var $borrarRegistro = $('#borrarRegistro');

async function getVariableId(deviceKey,variable) {
    let url = `${BASEURLV16}/${deviceKey}/${variable}`;
    let options = {
        method: 'GET',
        headers: HEADERS
    }
    const response = await fetch(url, options);
    return response.json()
}

async function getDataFromVariable(deviceKey,variable,page_size) {
    let url = `${BASEURLV16}/${deviceKey}/${variable}/values?page=1&page_size=${page_size}`;
    let options = {
        method: 'GET',
        headers: HEADERS
    }
    const response = await fetch(url, options);
    return response.json()
}

async function deleteCurrentVariable(variableID,timestamp){
    let url = `${BASEURLDELETE}/${variableID}/_/values/delete?startDate=${timestamp}&endDate=${timestamp}`;
    let options = {     
        method : 'POST',
        headers: HEADERS,        
    }

    const response = await fetch(url, options);
    return response.json();
}

async function getDeviceVariables(deviceKey, params) {
    let url = `${BASEURLV2}/devices/${deviceKey}/variables/?${new URLSearchParams(params)}`;
    console.log(url);
    let options = {
        method: 'GET',
        headers: HEADERS
    }
    const response = await fetch(url, options);
    return response.json()
}

function getData(){
    getDataFromVariable(DEVICE,VARIABLE,PAGESIZE)

    .then(variables =>{

        lastfileId = variables.results[0].context.fileID;
        lastLink = LINKDRIVE + lastfileId;
        lastTimestamp = variables.results[0].timestamp;
        lastDate = new Date(lastTimestamp).toLocaleString("en-US", {timeZone: "America/Bogota"});
        document.getElementById("lastDate").innerHTML = "Date of the picture : " + lastDate;
        mostrarFoto.src = lastLink;  
        document.getElementById("dateSelected").value = "date_1"; 
        console.log("Link : " + lastLink  + " Fecha : " + lastDate);
        fileIdData(variables);

    });
}


function fileIdData(variables){
    var j = 0;
    for(let i = 0; i < PAGESIZE ; i++ ){

        if(variables.results[i].value > 0){
            
            fileIds[j] = variables.results[i].context.fileID;
            links[j] = LINKDRIVE + fileIds[j];
            values[j] = variables.results[i].value;
            timestamp[j] = variables.results[i].timestamp;            
            dates [j] = new Date(timestamp[j]).toLocaleString("en-US", {timeZone: "America/Bogota"});    
            document.getElementById("date_"+(j+1)).innerHTML = dates[j];               
            console.log("Link : " + links[j] + " TiempoPresencia : " + values[j] + " Fecha : " + dates[j]);
            console.log("date"+(j+1)+" : "+dates[j]);
            j++;

        }
    }
  

}

$update.on('click', function () {
    var select = document.getElementById('dateSelected');
    var option = select.options[select.selectedIndex];

    for(let i = 0 ; i < dates.length ; i++){ 

        if(option.text === dates[i]){
            document.getElementById("lastDate").innerHTML = "Date of the picture : " + dates[i];
            mostrarFoto.src = links[i];
            currentTimestamp = timestamp[i];
            console.log(currentTimestamp);

        }
    }

});

$borrarRegistro.on('click', function () {
    getVariableId(DEVICE,VARIABLE)
    .then(variable=>{
         deleteCurrentVariable(variable.id,currentTimestamp)
         .then(deleteVariable=>{
            console.log(deleteVariable);
            getData();
  
          });
    });
   


});

 getData();
