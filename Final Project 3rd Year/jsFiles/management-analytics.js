// -------------------------
// FAKE DATA for demo
// -------------------------
const accidentData = [
  { case_number:"A-001", accident_date:new Date(2026,1,1,8), type:"Collision", severity:"Minor", age:25, address:"Barangay San Fabian", vehicle:"Car", road_condition:"Wet" },
  { case_number:"A-002", accident_date:new Date(2026,1,2,14), type:"Overturn", severity:"Serious", age:34, address:"Barangay Poblacion", vehicle:"Truck", road_condition:"Dry" },
  { case_number:"A-003", accident_date:new Date(2026,1,5,22), type:"Collision", severity:"Fatal", age:45, address:"Barangay San Fabian", vehicle:"Motorcycle", road_condition:"Wet" },
];

const incidentData = [
  { case_number:"I-001", accident_date:new Date(2026,1,3,10), type:"Fire", severity:"Moderate", age:30, address:"Barangay Alimasag", vehicle:"N/A", road_condition:"N/A" },
  { case_number:"I-002", accident_date:new Date(2026,1,7,16), type:"Flood", severity:"Minor", age:0, address:"Barangay Poblacion", vehicle:"N/A", road_condition:"Wet" },
  { case_number:"I-003", accident_date:new Date(2026,1,11,20), type:"Equipment Failure", severity:"Serious", age:0, address:"Barangay San Fabian", vehicle:"N/A", road_condition:"Dry" },
];

// -------------------------
// Merge accidents + incidents
// -------------------------
const allData = [...accidentData, ...incidentData];

// -------------------------
// Update KPI boxes
// -------------------------
document.getElementById("totalAccidents").innerText = allData.length;
document.getElementById("seriousAccidents").innerText = allData.filter(a=>["Serious","Fatal"].includes(a.severity)).length;
document.getElementById("activeZones").innerText = new Set(allData.map(a=>a.address)).size;
document.getElementById("affectedPeople").innerText = allData.length;

// -------------------------
// UTILITY
// -------------------------
function generateColors(count) {
  const palette=["#dc3545","#0d6efd","#fd7e14","#ffc107","#198754","#6f42c1","#20c997"];
  return Array.from({length:count},(_,i)=>palette[i%palette.length]);
}

// -------------------------
// Compute chart data
// -------------------------
function computeAnalytics(data){
  const typeCount={}, severityCount={}, monthlyTrend={}, timeDist={AM:0,PM:0,Night:0}, ageBrackets={"0-17":0,"18-30":0,"31-50":0,"51+":0}, locationCount={}, vehicleCount={}, roadCount={};

  data.forEach(acc=>{
    // Types (Accident or Incident)
    typeCount[acc.type]=(typeCount[acc.type]||0)+1;

    // Severity
    severityCount[acc.severity]=(severityCount[acc.severity]||0)+1;

    // Monthly Trend
    const month=acc.accident_date.toLocaleString("default",{month:"short"});
    monthlyTrend[month]=(monthlyTrend[month]||0)+1;

    // Time Distribution
    const h=acc.accident_date.getHours();
    if(h>=6 && h<12) timeDist.AM++;
    else if(h>=12 && h<18) timeDist.PM++;
    else timeDist.Night++;

    // Age Brackets
    const age=acc.age;
    if(age<=17) ageBrackets["0-17"]++;
    else if(age<=30) ageBrackets["18-30"]++;
    else if(age<=50) ageBrackets["31-50"]++;
    else ageBrackets["51+"]++;

    // Location
    locationCount[acc.address]=(locationCount[acc.address]||0)+1;

    // Vehicle Types
    if(acc.vehicle) vehicleCount[acc.vehicle]=(vehicleCount[acc.vehicle]||0)+1;

    // Road Conditions
    if(acc.road_condition) roadCount[acc.road_condition]=(roadCount[acc.road_condition]||0)+1;
  });

  return {typeCount,severityCount,monthlyTrend,timeDist,ageBrackets,locationCount,vehicleCount,roadCount};
}

// -------------------------
// Render Charts with Titles
// -------------------------
function renderCharts(){
  const analytics = computeAnalytics(allData);

  const chartOptions = (title) => ({
    responsive:true,
    legend:{display:true, position:"bottom"},
    title:{display:true,text:title,fontSize:16,fontColor:"#333"}
  });

  // Accident + Incident Types
  new Chart(document.getElementById("accidentTypeChart"), {
    type:'pie',
    data:{labels:Object.keys(analytics.typeCount), datasets:[{data:Object.values(analytics.typeCount), backgroundColor:generateColors(Object.keys(analytics.typeCount).length)}]},
    options: chartOptions("Accident & Incident Types")
  });

  // Severity
  new Chart(document.getElementById("severityChart"), {
    type:'bar',
    data:{labels:Object.keys(analytics.severityCount), datasets:[{data:Object.values(analytics.severityCount), backgroundColor:"#0d6efd"}]},
    options: chartOptions("Severity Distribution")
  });

  // Monthly Trend
  new Chart(document.getElementById("monthlyChart"), {
    type:'line',
    data:{labels:Object.keys(analytics.monthlyTrend), datasets:[{data:Object.values(analytics.monthlyTrend), borderColor:"#198754", fill:false}]},
    options: chartOptions("Monthly Trend (Accidents & Incidents)")
  });

  // Time of Day
  new Chart(document.getElementById("timeChart"), {
    type:'doughnut',
    data:{labels:Object.keys(analytics.timeDist), datasets:[{data:Object.values(analytics.timeDist), backgroundColor:["#ffc107","#0d6efd","#fd7e14"]}]},
    options: chartOptions("Accidents & Incidents by Time of Day")
  });

  // Age Brackets
  new Chart(document.getElementById("ageChart"), {
    type:'bar',
    data:{labels:Object.keys(analytics.ageBrackets), datasets:[{data:Object.values(analytics.ageBrackets), backgroundColor:"#dc3545"}]},
    options: chartOptions("Age Bracket Distribution")
  });

  // Top Locations
  new Chart(document.getElementById("locationChart"), {
    type:'bar',
    data:{labels:Object.keys(analytics.locationCount), datasets:[{data:Object.values(analytics.locationCount), backgroundColor:"#6f42c1"}]},
    options: chartOptions("Top Locations")
  });

  // Vehicle Types
  new Chart(document.getElementById("vehicleChart"), {
    type:'bar',
    data:{labels:Object.keys(analytics.vehicleCount), datasets:[{data:Object.values(analytics.vehicleCount), backgroundColor:"#20c997"}]},
    options: chartOptions("Vehicle Types Involved")
  });

  // Road Conditions
  new Chart(document.getElementById("roadChart"), {
    type:'pie',
    data:{labels:Object.keys(analytics.roadCount), datasets:[{data:Object.values(analytics.roadCount), backgroundColor:generateColors(Object.keys(analytics.roadCount).length)}]},
    options: chartOptions("Road Conditions")
  });
}

// -------------------------
// Run
// -------------------------
renderCharts();
