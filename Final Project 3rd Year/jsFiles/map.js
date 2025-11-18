'use strict';

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof getData !== "function") {
    console.error("❌ getData() not found.");
    return;
  }

  const mapContainer = document.getElementById("accidentMap");
  if (!mapContainer) {
    console.error("❌ Missing #accidentMap");
    return;
  }

  // Init map
  const map = L.map("accidentMap").setView([16.705090, 121.676330], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Accident list UI
  const wrapper = document.querySelector("section#wrapper .p-4");
  const listContainer = document.createElement("div");
  listContainer.className = "accident-list container mt-4 text-light";
  listContainer.innerHTML = `
    <h4 class="mb-3">Today's Accidents</h4>
    <div id="accidentRows"></div>
  `;
  wrapper.appendChild(listContainer);
  const list = document.getElementById("accidentRows");

  try {
    // ----------------------------------------------------
    // Load API + Local JSON
    // ----------------------------------------------------
    let apiData = await getData("accident_api.php");
    let localData = await fetch("accident.json").then(r => r.json());

    // Normalize
    const normalize = res => {
      if (!res) return [];
      if (Array.isArray(res)) return res;
      if (res.success && Array.isArray(res.data)) return res.data;
      if (res.success && Array.isArray(res.accidents)) return res.accidents;
      if (res.success && Array.isArray(res.records)) return res.records;
      for (const k in res) if (Array.isArray(res[k])) return res[k];
      return [];
    };

    let apiAccidents = normalize(apiData);
    let localAccidents = normalize(localData);
    let accidents = [...apiAccidents, ...localAccidents];

    if (!accidents.length) {
      list.innerHTML = `<p class="text-muted">No accident reports found.</p>`;
      return;
    }

    // ----------------------------------------------------
    // CREATE MAP MARKERS
    // ----------------------------------------------------
    const markersMap = {};
    const clusterRadius = 300; // meters
    const clusters = [];

    // Helper to calculate distance between two points
    const distance = (lat1, lng1, lat2, lng2) => {
      const R = 6371000; // meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Place markers & assign clusters
    accidents.forEach(a => {
      const lat = parseFloat(a.latitude);
      const lng = parseFloat(a.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      // Determine marker color
      const sev = (a.severity || "").toLowerCase();
      let fillColor = "#2ecc71";
      if (sev === "severe") fillColor = "#e74c3c";
      else if (sev === "moderate") fillColor = "#f1c40f";

      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor,
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      let popupContent = `
        <strong>${a.address || "Unknown Location"}</strong><br>
        <b>Severity:</b> ${a.severity || "N/A"}<br>
        <b>Casualties:</b> ${a.casualties || a.number_of_casualties || "N/A"}<br>
        <b>Description:</b> ${a.description || "No details available."}<br>
      `;
      if (Array.isArray(a.vehicles) && a.vehicles.length) {
        popupContent += `<b>Vehicles:</b> ${a.vehicles.map(v => `${v.brand} ${v.model} (${v.type_name})`).join(", ")}<br>`;
      }
      if (Array.isArray(a.images) && a.images.length) {
        popupContent += `<img src="${a.images[0].file_path}" style="max-width:150px;margin-top:5px;">`;
      }

      marker.bindPopup(popupContent);
      marker.on("click", () => {
        map.setView([lat, lng], 13);
        marker.openPopup();
      });

      markersMap[a.accident_id] = marker;

      // Cluster logic
      let addedToCluster = false;
      for (const cluster of clusters) {
        const d = distance(lat, lng, cluster.lat, cluster.lng);
        if (d <= clusterRadius) {
          cluster.accidents.push(a);
          cluster.lat = (cluster.lat * (cluster.accidents.length-1) + lat)/cluster.accidents.length;
          cluster.lng = (cluster.lng * (cluster.accidents.length-1) + lng)/cluster.accidents.length;
          addedToCluster = true;
          break;
        }
      }
      if (!addedToCluster) {
        clusters.push({lat, lng, accidents: [a]});
      }
    });

    // ----------------------------------------------------
    // CREATE DANGER ZONES
    // ----------------------------------------------------
    clusters.forEach(cluster => {
      const sevCounts = {severe: 0, moderate: 0, minor: 0};
      cluster.accidents.forEach(a => {
        const sev = (a.severity || "minor").toLowerCase();
        if (sevCounts[sev] !== undefined) sevCounts[sev]++;
      });

      const totalAccidents = cluster.accidents.length;
      const severeRatio = sevCounts["severe"] / totalAccidents;
      const moderateRatio = sevCounts["moderate"] / totalAccidents;

      let zoneColor = "#2ecc71"; // green default
      if (severeRatio > 0.3) zoneColor = "#e74c3c"; // red
      else if (moderateRatio > 0.2 || severeRatio > 0) zoneColor = "#f1c40f"; // orange

      L.circle([cluster.lat, cluster.lng], {
        radius: clusterRadius,
        color: zoneColor,
        weight: 2,
        fillColor: zoneColor,
        fillOpacity: 0.15,
        interactive: false // do not block individual markers
      }).addTo(map);
    });

    // ----------------------------------------------------
    // TODAY'S ACCIDENT LIST
    // ----------------------------------------------------
    const todayStr = new Date().toISOString().split("T")[0];
    let todayCount = 0;
    list.innerHTML = "";

    accidents.forEach(a => {
      const lat = parseFloat(a.latitude);
      const lng = parseFloat(a.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      if (!a.accident_date?.startsWith(todayStr)) return;
      todayCount++;

      const item = document.createElement("div");
      item.className = "accident-item mb-3 p-3 bg-dark rounded";

      item.innerHTML = `
        <h5>${a.type_name || "Unknown Accident Type"}</h5>
        <h6>${a.address || "Unknown Location"}</h6>
        <p><strong>Reported:</strong> ${a.accident_date || "Unknown"}</p>
        <p><strong>Severity:</strong> ${a.severity || "N/A"}</p>
        <p><strong>Casualties:</strong> ${a.casualties || a.number_of_casualties || "0"}</p>
        <p><strong>Description:</strong> ${a.description || "No description provided."}</p>
        <button class="btn btn-sm btn-outline-light mt-2">View on Map</button>
      `;

      item.querySelector("button").addEventListener("click", () => {
        map.setView([lat, lng], 13);
        markersMap[a.accident_id]?.openPopup();
      });

      list.appendChild(item);
    });

    if (todayCount === 0) {
      list.innerHTML = `<p class="text-muted">No accidents reported today.</p>`;
    }

  } catch (err) {
    console.error("❌ Error fetching data:", err);
    list.innerHTML = `<p class="text-danger">⚠️ Failed to load data.</p>`;
  }
});
