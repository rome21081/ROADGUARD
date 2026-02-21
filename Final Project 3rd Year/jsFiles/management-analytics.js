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
  { category:"Trauma", sub_type:"Fire Rescue Incident" },
  { category:"Trauma", sub_type:"Fall" },
  { category:"Trauma", sub_type:"Water Rescue Incident" },
  { category:"Trauma", sub_type:"Electrocution" },
  { category:"Trauma", sub_type:"Electrocution" },

  // MEDICAL
  { category:"Medical", sub_type:"Pediatric" },
  { category:"Medical", sub_type:"Psychiatric" },
  { category:"Medical", sub_type:"Psychiatric" },
  { category:"Medical", sub_type:"Surgical" },
  { category:"Medical", sub_type:"Obstetrical" },
  { category:"Medical", sub_type:"Others" },
  { category:"Medical", sub_type:"Pediatric" },
  { category:"Medical", sub_type:"Others" },
  { category:"Medical", sub_type:"Surgical" },
  { category:"Medical", sub_type:"Surgical" },

  // CONDUCTION
  { category:"Conduction", sub_type:"Dialysis" },
  { category:"Conduction", sub_type:"Dialysis" },
  { category:"Conduction", sub_type:"Check-up" },
  { category:"Conduction", sub_type:"Travel (Within Region 2)" },
  { category:"Conduction", sub_type:"Travel (Outside Region 2)" },
  { category:"Conduction", sub_type:"Travel (Outside Region 2)" },
  { category:"Conduction", sub_type:"Check-up" },
  { category:"Conduction", sub_type:"Check-up" },
  { category:"Conduction", sub_type:"Travel (Within Region 2)" },
  { category:"Conduction", sub_type:"Dialysis" },
  { category:"Conduction", sub_type:"Travel (Outside Region 2)" },
  { category:"Conduction", sub_type:"Check-up" }
];

// ==============================
// ANALYTICS
// ==============================
function computeAnalytics(data){
  const categoryCount = {};
  const breakdown = {
    Trauma:{},
    Medical:{},
    Conduction:{}
  };

  data.forEach(item=>{
    categoryCount[item.category] =
      (categoryCount[item.category] || 0) + 1;

    breakdown[item.category][item.sub_type] =
      (breakdown[item.category][item.sub_type] || 0) + 1;
  });

  return { categoryCount, breakdown };
}

const analytics = computeAnalytics(allData);

// ==============================
// KPI VALUES
// ==============================
document.getElementById("totalCases").innerText = allData.length;
document.getElementById("medicalCases").innerText = analytics.categoryCount.Medical || 0;
document.getElementById("traumaCases").innerText = analytics.categoryCount.Trauma || 0;
document.getElementById("conductionCases").innerText = analytics.categoryCount.Conduction || 0;

// ==============================
// CHARTS
// ==============================
new Chart(document.getElementById("categoryChart"), {
  type:'pie',
  data:{
    labels:Object.keys(analytics.categoryCount),
    datasets:[{
      data:Object.values(analytics.categoryCount),
      backgroundColor:["#dc3545","#0d6efd","#198754"]
    }]
  },
  options:{ title:{ display:true, text:"Incident Categories" } }
});

new Chart(document.getElementById("traumaChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.breakdown.Trauma),
    datasets:[{
      data:Object.values(analytics.breakdown.Trauma),
      backgroundColor:"#dc3545"
    }]
  },
  options:{ title:{ display:true, text:"Trauma Classification" }, legend:{display:false} }
});

new Chart(document.getElementById("medicalChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.breakdown.Medical),
    datasets:[{
      data:Object.values(analytics.breakdown.Medical),
      backgroundColor:"#0d6efd"
    }]
  },
  options:{ title:{ display:true, text:"Medical Classification" }, legend:{display:false} }
});

new Chart(document.getElementById("conductionChart"), {
  type:'bar',
  data:{
    labels:Object.keys(analytics.breakdown.Conduction),
    datasets:[{
      data:Object.values(analytics.breakdown.Conduction),
      backgroundColor:"#198754"
    }]
  },
  options:{ title:{ display:true, text:"Conduction Classification" }, legend:{display:false} }
});