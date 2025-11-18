/* ---------- DANGER ZONE BUILDING & RENDERING (UPDATED) ---------- */

/**
 * buildDangerZonesFromAccidents
 * Groups accidents by normalized address and computes
 * - average lat/lng for cluster
 * - severeCount
 * - totalCount
 * - probability (%) of severe among that cluster
 * Returns top 5 zones sorted by severeCount desc.
 */
function buildDangerZonesFromAccidents(accidents) {
  if (!Array.isArray(accidents) || accidents.length === 0) {
    // No accidents at all, return empty list (no fake San Fabian)
    return [];
  }

  const groups = {}; // key -> { latSum, lngSum, count, severeCount, samples:[] }

  accidents.forEach(a => {
    const key = (a.address || a.location || a.type_name || 'Unknown location').trim();
    if (!groups[key]) groups[key] = { latSum:0, lngSum:0, count:0, severeCount:0, samples:[] };

    const lat = parseFloat(a.latitude || a.lat || a.latlng?.lat || 0) || 0;
    const lng = parseFloat(a.longitude || a.lng || a.latlng?.lng || 0) || 0;
    if (!lat || !lng) return; // skip if no coordinates

    groups[key].latSum += lat;
    groups[key].lngSum += lng;
    groups[key].count += 1;
    groups[key].samples.push(a);

    const s = (a.severity || '').toLowerCase();
    if (s.includes('sev') || s.includes('crit') || s.includes('fatal')) {
      groups[key].severeCount += 1;
    }
  });

  const zones = Object.entries(groups)
    .filter(([_, v]) => v.count > 0) // skip locations with no coords
    .map(([name, v]) => {
      const lat = v.latSum / v.count;
      const lng = v.lngSum / v.count;
      const prob = Math.round((v.severeCount / Math.max(1, v.count)) * 100);
      return {
        name,
        lat,
        lng,
        severeCount: v.severeCount,
        totalCount: v.count,
        probability: prob
      };
    });

  // Sort by severeCount desc and return top 5
  zones.sort((a,b) => b.severeCount - a.severeCount);
  return zones.slice(0, 5);
}

/* renderDangerZoneList - show top danger zones in the dashboard list */
function renderDangerZoneList(zones) {
  const box = document.getElementById('danger-alerts');
  if (!box) return;

  if (!zones || zones.length === 0) {
    box.innerHTML = `<div class="alert alert-success">No active danger zones detected.</div>`;
    return;
  }

  const html = zones.map(zone => {
    const cls = zone.severeCount >= 5 ? 'bg-danger' : zone.severeCount >= 3 ? 'bg-warning' : 'bg-info';
    const reason = zone.totalCount > 1 ? `${zone.totalCount} incidents reported` : `1 incident reported`;
    return `
      <div class="alert mb-2 p-2" role="alert"
        style="border-left:4px solid #FB7A8E;background:rgba(251,122,142,0.04);color:#ffd4d8">
        <strong>${zone.name}</strong>
        <div class="small text-muted">${reason} — ${zone.severeCount} severe case(s) — ${zone.probability}% severe</div>
      </div>
    `;
  }).join('');

  box.innerHTML = html;
}

/* ---------- 🔥 LOCATION & ALERT LOGIC (UPDATED) ---------- */

function askLocationPermission() {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported by browser.");
    return;
  }

  const allow = confirm("Allow the system to access your location for safety alerts?");
  if (!allow) return;

  if (userWatchId !== null) return; // already watching

  userWatchId = navigator.geolocation.watchPosition(onLocationSuccess, onLocationError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 10000
  });
}

function onLocationSuccess(position) {
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;

  if (!Array.isArray(computedDangerZones) || computedDangerZones.length === 0) return;

  // Check for real danger zones only
  for (const zone of computedDangerZones) {
    if (!zone.lat || !zone.lng || zone.severeCount < 1) continue; // skip invalid/fake zones

    const distance = haversineDistanceMeters(userLat, userLng, zone.lat, zone.lng);
    if (distance <= DANGER_RADIUS_METERS) {
      triggerDangerAlert(zone, Math.round(distance));
      break; // only show first matching zone
    }
  }
}

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function triggerDangerAlert(zone, distanceMeters) {
  const modal = document.getElementById('dangerZoneModal');
  const sound = document.getElementById('dangerAlertSound');
  const nameEl = document.getElementById('dangerZoneName');
  const detailsEl = document.getElementById('dangerZoneDetails');

  if (!modal || !sound || !nameEl || !detailsEl) return;
  if (modal.style.display === 'flex') return;

  nameEl.innerText = zone.name;
  detailsEl.innerText = `Distance: ${distanceMeters} m — Severity probability: ${zone.probability}% ( ${zone.severeCount}/${zone.totalCount} severe )`;

  modal.style.display = 'flex';

  const playPromise = sound.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.catch(() => { /* ignore play error */ });
  }
}

function closeDangerModal() {
  const modal = document.getElementById('dangerZoneModal');
  if (modal) modal.style.display = 'none';
}
