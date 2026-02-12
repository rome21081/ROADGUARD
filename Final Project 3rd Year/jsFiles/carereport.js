
window.addEventListener("DOMContentLoaded", function () {

    const accidentField = document.querySelector("input[name='accident_number']");
    const now = new Date();
    const random = Math.floor(Math.random() * 9000) + 1000;

    accidentField.value =
        "ACC-" +
        now.getFullYear() +
        ("0" + (now.getMonth() + 1)).slice(-2) +
        ("0" + now.getDate()).slice(-2) +
        "-" +
        random;

    accidentField.setAttribute("readonly", true);
});


function toggleOtherLocation() {

    const select = document.getElementById("location_type");
    const otherField = document.getElementById("other_location_type");

    if (!select || !otherField) return;

    if (select.value === "Others") {
        otherField.style.display = "block";
        otherField.required = true;
    } else {
        otherField.style.display = "none";
        otherField.value = "";
        otherField.required = false;
    }
}


let map = null;
let marker = null;


function showMap() {

    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    // create dark overlay
    const overlay = document.createElement("div");
    overlay.id = "mapOverlay";
    overlay.className = "map-overlay";
    document.body.appendChild(overlay);

    overlay.style.display = "block";
    mapDiv.style.display = "block";

    overlay.onclick = closeMap;

    if (!map) {
        initializeMap();
    } else {
        map.invalidateSize();
    }
}

function closeMap() {
    const mapDiv = document.getElementById("map");
    const overlay = document.getElementById("mapOverlay");

    if (mapDiv) mapDiv.style.display = "none";
    if (overlay) overlay.remove();
}


function initializeMap() {

    const addressField = document.getElementById("accident_address");
    const cityField = document.querySelector("input[name='accident_city']");
    const stateField = document.querySelector("input[name='accident_state']");
    const zipField = document.querySelector("input[name='zip_code']");

    map = L.map("map").setView([17.15, 121.85], 9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);


    const control = L.control({ position: "topright" });

    control.onAdd = function () {
        const div = L.DomUtil.create("div", "search-box");

        div.innerHTML = `
            <input type="text" 
                   id="mapSearchInput" 
                   placeholder="Search in Isabela..."
                   style="padding:6px;width:200px;margin-bottom:5px;"><br>
            <button onclick="useCurrentLocation()" 
                    style="padding:6px;width:215px;">
                📍 Use Current Location
            </button>
        `;

        return div;
    };

    control.addTo(map);

    L.DomEvent.disableClickPropagation(
        document.querySelector(".search-box")
    );


    let typingTimer;

    document.addEventListener("input", function(e) {

        if (e.target.id !== "mapSearchInput") return;

        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {
            autoSearch(e.target.value);
        }, 600);
    });

    function autoSearch(query) {

        if (query.length < 3) return;

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}, Isabela, Philippines`)
        .then(res => res.json())
        .then(data => {

            if (data.length === 0) return;

            const place = data[0];

            if (!place.display_name.toLowerCase().includes("isabela")) {
                alert("Only locations inside Isabela are allowed.");
                return;
            }

            const lat = place.lat;
            const lon = place.lon;

            map.setView([lat, lon], 15);
            reverseFill(lat, lon);
        });
    }


    map.on("click", function (e) {
        reverseFill(e.latlng.lat, e.latlng.lng);
    });

    function reverseFill(lat, lon) {

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {

            if (!data.address) return;

            if (!data.display_name.toLowerCase().includes("isabela")) {
                alert("Only locations inside Isabela are allowed.");
                return;
            }

            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lon]).addTo(map);

            addressField.value = data.display_name || "";

            cityField.value =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "";

            stateField.value = data.address.state || "Isabela";
            zipField.value = data.address.postcode || "";

            setTimeout(closeMap, 700);
        });
    }
}



function useCurrentLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        map.setView([lat, lon], 15);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {

            if (!data.address) return;

            if (!data.display_name.toLowerCase().includes("isabela")) {
                alert("Your current location is outside Isabela.");
                return;
            }

            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lon]).addTo(map);

            document.getElementById("accident_address").value =
                data.display_name || "";

            document.querySelector("input[name='accident_city']").value =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "";

            document.querySelector("input[name='accident_state']").value =
                data.address.state || "Isabela";

            document.querySelector("input[name='zip_code']").value =
                data.address.postcode || "";

            setTimeout(closeMap, 700);

        });

    }, function() {
        alert("Unable to retrieve your location.");
    });
}



function saveReport() {

    const state = document.querySelector("input[name='accident_state']").value;

    if (state.toLowerCase() !== "isabela") {
        alert("You cannot save a report outside Isabela.");
        return;
    }

    const form = document.getElementById("patientForm");
    const formData = new FormData(form);
    const jsonObject = {};

    formData.forEach((value, key) => {

        if (jsonObject[key]) {
            if (!Array.isArray(jsonObject[key])) {
                jsonObject[key] = [jsonObject[key]];
            }
            jsonObject[key].push(value);
        } else {
            jsonObject[key] = value;
        }
    });

    if (jsonObject.location_type === "Others" && jsonObject.other_location_type) {
        jsonObject.location_type = jsonObject.other_location_type;
    }

    delete jsonObject.other_location_type;

    jsonObject.record_type = "Accident Care Report (ACR)";
    jsonObject.generated_at = new Date().toISOString();

    const blob = new Blob([JSON.stringify(jsonObject, null, 4)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = jsonObject.accident_number + ".json";
    a.click();

    URL.revokeObjectURL(url);

    alert("Accident Report Saved Successfully!");
}
