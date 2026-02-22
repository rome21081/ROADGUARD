// ==============================
// FAKE EMS / RESCUE AGENCY DATA
// ==============================

const allData = [

  // TRAUMA
  { category:"Trauma", sub_type:"Fall" },
  { category:"Trauma", sub_type:"Fall" },
  { category:"Trauma", sub_type:"Domestic Violence" },
  { category:"Trauma", sub_type:"Water Rescue Incident" },
  { category:"Trauma", sub_type:"Fire Rescue Incident" },
  { category:"Trauma", sub_type:"Electrocution" },

  // MEDICAL
  { category:"Medical", sub_type:"Pediatric" },
  { category:"Medical", sub_type:"Psychiatric" },
  { category:"Medical", sub_type:"Surgical" },
  { category:"Medical", sub_type:"Obstetrical" },

  // CONDUCTION
  { category:"Conduction", sub_type:"Dialysis" },
  { category:"Conduction", sub_type:"Check-up" },
  { category:"Conduction", sub_type:"Travel (Within Region 2)" },

  // MOTOR VEHICLE CRASH
  { category:"Motor Vehicle Crash", sub_type:"Self-Accident", vehicle:"Single Motor", person:"Driver", license:"+", helmet:"+", alcohol:"-" },
  { category:"Motor Vehicle Crash", sub_type:"Collision", vehicle:"Tricycle", person:"Passenger", license:"+", helmet:"-", alcohol:"-" },
  { category:"Motor Vehicle Crash", sub_type:"Self-Accident", vehicle:"Bicycle", person:"Driver", license:"-", helmet:"-", alcohol:"+" },
  { category:"Motor Vehicle Crash", sub_type:"Collision", vehicle:"Single Motor", person:"Driver", license:"+", helmet:"+", alcohol:"-" },
  { category:"Motor Vehicle Crash", sub_type:"Collision", vehicle:"Tricycle", person:"Pedestrian", license:"-", helmet:"-", alcohol:"+" }
];

// ==============================
// ANALYTICS WITH RANDOM WEIGHT
// ==============================

function computeAnalytics(data){

  const categoryCount = {};
  const breakdown = {
    Trauma:{},
    Medical:{},
    Conduction:{},
    "Motor Vehicle Crash":{}
  };

  const vehicleCount = {};
  const personCount = {};
  const licenseCount = {};
  const helmetCount = {};
  const alcoholCount = {};

  data.forEach(item=>{

    // RANDOM weight 1–6
    let weight = Math.floor(Math.random() * 6) + 1;

    categoryCount[item.category] =
      (categoryCount[item.category] || 0) + weight;

    breakdown[item.category][item.sub_type] =
      (breakdown[item.category][item.sub_type] || 0) + weight;

    if(item.category === "Motor Vehicle Crash"){

      vehicleCount[item.vehicle] =
        (vehicleCount[item.vehicle] || 0) + weight;

      personCount[item.person] =
        (personCount[item.person] || 0) + weight;

      licenseCount[item.license] =
        (licenseCount[item.license] || 0) + weight;

      helmetCount[item.helmet] =
        (helmetCount[item.helmet] || 0) + weight;

      alcoholCount[item.alcohol] =
        (alcoholCount[item.alcohol] || 0) + weight;
    }

  });

  return {
    categoryCount,
    breakdown,
    vehicleCount,
    personCount,
    licenseCount,
    helmetCount,
    alcoholCount
  };
}

const analytics = computeAnalytics(allData);

// ==============================
// KPI VALUES
// ==============================

document.getElementById("totalCases").innerText = 
  Object.values(analytics.categoryCount).reduce((a,b)=>a+b,0);

document.getElementById("medicalCases").innerText = analytics.categoryCount.Medical || 0;
document.getElementById("traumaCases").innerText = analytics.categoryCount.Trauma || 0;
document.getElementById("conductionCases").innerText = analytics.categoryCount.Conduction || 0;


// ==============================
// CHARTS
// ==============================

// CATEGORY PIE
new Chart(document.getElementById("categoryChart"), {
  type:'pie',
  data:{
    labels:Object.keys(analytics.categoryCount),
    datasets:[{
      data:Object.values(analytics.categoryCount),
      backgroundColor:["#dc3545","#0d6efd","#198754","#6f42c1"]
    }]
  }
});

// TRAUMA
new Chart(document.getElementById("traumaChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.breakdown.Trauma),
    datasets:[{
      data:Object.values(analytics.breakdown.Trauma),
      backgroundColor:"#dc3545"
    }]
  },
  options:{ legend:{display:false} }
});

// MEDICAL
new Chart(document.getElementById("medicalChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.breakdown.Medical),
    datasets:[{
      data:Object.values(analytics.breakdown.Medical),
      backgroundColor:"#0d6efd"
    }]
  },
  options:{ legend:{display:false} }
});

// CONDUCTION
new Chart(document.getElementById("conductionChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.breakdown.Conduction),
    datasets:[{
      data:Object.values(analytics.breakdown.Conduction),
      backgroundColor:"#198754"
    }]
  },
  options:{ legend:{display:false} }
});

// MVC TYPE
new Chart(document.getElementById("mvcChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.breakdown["Motor Vehicle Crash"]),
    datasets:[{
      data:Object.values(analytics.breakdown["Motor Vehicle Crash"]),
      backgroundColor:"#6f42c1"
    }]
  },
  options:{ legend:{display:false} }
});

// VEHICLE
new Chart(document.getElementById("vehicleChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.vehicleCount),
    datasets:[{
      data:Object.values(analytics.vehicleCount),
      backgroundColor:"#fd7e14"
    }]
  },
  options:{ legend:{display:false} }
});

// PERSON
new Chart(document.getElementById("personChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.personCount),
    datasets:[{
      data:Object.values(analytics.personCount),
      backgroundColor:"#20c997"
    }]
  },
  options:{ legend:{display:false} }
});

// LICENSE
new Chart(document.getElementById("licenseChart"), {
  type:'pie',
  data:{
    labels:["License (+)","License (-)"],
    datasets:[{
      data:[
        analytics.licenseCount["+"] || 0,
        analytics.licenseCount["-"] || 0
      ],
      backgroundColor:["#198754","#dc3545"]
    }]
  }
});

// HELMET
new Chart(document.getElementById("helmetChart"), {
  type:'pie',
  data:{
    labels:["Helmet (+)","Helmet (-)"],
    datasets:[{
      data:[
        analytics.helmetCount["+"] || 0,
        analytics.helmetCount["-"] || 0
      ],
      backgroundColor:["#198754","#dc3545"]
    }]
  }
});

// ALCOHOL
new Chart(document.getElementById("alcoholChart"), {
  type:'pie',
  data:{
    labels:["Alcohol (+)","Alcohol (-)"],
    datasets:[{
      data:[
        analytics.alcoholCount["+"] || 0,
        analytics.alcoholCount["-"] || 0
      ],
      backgroundColor:["#dc3545","#198754"]
    }]
  }
});

// ENGINE SIZE >4500 <4500
const engineData = {
  ">4500": 8,
  "<4500": 5
};

new Chart(document.getElementById("engineChart"), {
  type:'bar',
  data:{
    labels:Object.keys(engineData),
    datasets:[{
      label: "Engine Count",
      data:Object.values(engineData),
      backgroundColor:["#0d6efd","#ffc107"],
      borderColor:["#084298","#b38600"],
      borderWidth:2
    }]
  },
  options:{
    legend:{ display:false },
    scales:{
      yAxes:[{
        ticks:{
          beginAtZero:true
        }
      }]
    }
  }
});