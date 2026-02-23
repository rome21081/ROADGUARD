let allData = [];

const subCategories = {
  "Medical": ["Pediatric","Psychiatric","Surgical","Obstetrical"],
  "Trauma": ["Fall","Electrocution","Domestic Violence","Fire Rescue Incident"],
  "Conduction": ["Dialysis","Check-up","Travel (Within Region 2)","Travel (Outside Region 2)"],
  "MotorVehicleCrashType": ["Collision","Self-Accident"],
  "VehicleType": ["Bicycle","Tricycle","Single Motor"],
  "PersonInvolve": ["Driver","Passenger","Pedestrian"],
  "EngineSize": [">4500","<4500"],
  "License": ["License (+)","License (-)"],
  "Helmet": ["Helmet (+)","Helmet (-)"],
  "Alcohol": ["Alcohol (+)","Alcohol (-)"]
};

const categories = Object.keys(subCategories);

for(let i=0;i<500;i++){ 

  let randomDate = new Date(
    2026,
    Math.floor(Math.random()*12),
    Math.floor(Math.random()*28)+1
  );

  let category = categories[Math.floor(Math.random()*categories.length)];
  let subList = subCategories[category];
  let subType = subList[Math.floor(Math.random()*subList.length)];

  allData.push({
    category: category,
    sub_type: subType,
    date: randomDate
  });

}

function generateFullSpreadsheet(){

let table=document.getElementById("spreadsheetTable");
if(!table) return;


let data = document.getElementById("filterType") 
           ? filterByDate(allData) 
           : allData;

let months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

let categories={
"CONDUCTION":["Dialysis","Check-up","Travel (Within Region 2)","Travel (Outside Region 2)"],
"MEDICAL":["Pediatric","Psychiatric","Surgical","Obstetrical"],
"TRAUMA":["Fall","Electrocution","Domestic Violence","Fire Rescue Incident"],
"MOTOR VEHICLE CRASH TYPE":["Collision","Self-Accident"],
"VECHICLE TYPE":["Bicycle","Tricycle","Single Motor"],
"PERSON INVOLVED":["Driver","Passenger","Pedestrian"],
"ENGINE SIZE":[">4500","<4500"],
"LICENSE":["License (+)","License (-)"],
"HELMET":["Helmet (+)","Helmet (-)"],
"ALCOHOL":["Alcohol (+)","Alcohol (-)"]
};

let html="<tr><th>Category</th>";
months.forEach(m=>html+="<th>"+m+"</th>");
html+="<th>Total</th></tr>";

Object.keys(categories).forEach(section=>{

html+="<tr class='section-row'><td colspan='14'>"+section+"</td></tr>";

categories[section].forEach(sub=>{

let monthCounts=new Array(12).fill(0);

data.forEach(d=>{
if(d.sub_type===sub){
let month=new Date(d.date).getMonth();
monthCounts[month]++;
}
});

let total=monthCounts.reduce((a,b)=>a+b,0);

html+="<tr><td>"+sub+"</td>";
monthCounts.forEach(c=>html+="<td>"+c+"</td>");
html+="<td>"+total+"</td></tr>";

});

});


let monthTotals=new Array(12).fill(0);
data.forEach(d=>{
let m=new Date(d.date).getMonth();
monthTotals[m]++;
});
let grandTotal=monthTotals.reduce((a,b)=>a+b,0);

html+="<tr class='total-row'><td>Grand Total</td>";
monthTotals.forEach(m=>html+="<td>"+m+"</td>");
html+="<td>"+grandTotal+"</td></tr>";

table.innerHTML=html;
}

function downloadSpreadsheet(){

let data = document.getElementById("filterType") 
           ? filterByDate(allData) 
           : allData;

let months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

let categories={
"CONDUCTION":["Dialysis","Check-up","Travel (Within Region 2)","Travel (Outside Region 2)"],
"MEDICAL":["Pediatric","Psychiatric","Surgical","Obstetrical"],
"TRAUMA":["Fall","Electrocution","Domestic Violence","Fire Rescue Incident"],
"MOTOR VEHICLE CRASH TYPE":["Collision","Self-Accident"],
"VEHICLE TYPE":["Bicycle","Tricycle","Single Motor"],
"PERSON INVOLVED":["Driver","Passenger","Pedestrian"],
"ENGINE SIZE":[">4500","<4500"],
"LICENSE":["License (+)","License (-)"],
"HELMET":["Helmet (+)","Helmet (-)"],
"ALCOHOL":["Alcohol (+)","Alcohol (-)"]
};

let exportData=[];


let header=["Category",...months,"Total"];
exportData.push(header);


let monthTotals=new Array(12).fill(0);

Object.keys(categories).forEach(section=>{


exportData.push([section]);

categories[section].forEach(sub=>{

let monthCounts=new Array(12).fill(0);

data.forEach(d=>{
if(d.sub_type===sub){
let month=new Date(d.date).getMonth();
monthCounts[month]++;
}
});

// Add to monthTotals
for(let i=0;i<12;i++){
monthTotals[i]+=monthCounts[i];
}

let total=monthCounts.reduce((a,b)=>a+b,0);

exportData.push([sub,...monthCounts,total]);

});

});

let grandTotal = monthTotals.reduce((a,b)=>a+b,0);


exportData.push([]);
exportData.push(["GRAND TOTAL",...monthTotals,grandTotal]);


const ws = XLSX.utils.aoa_to_sheet(exportData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Incident Report");

XLSX.writeFile(wb,"EMS_Spreadsheet_Report.xlsx");
}
generateFullSpreadsheet();

if(document.getElementById("filterType")){
document.getElementById("filterType")
.addEventListener("change",()=>{
render();
generateFullSpreadsheet();
});
}