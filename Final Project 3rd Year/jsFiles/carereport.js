let storedCareReports = [];

function saveReport() {

    const form = document.getElementById("patientForm");
    const formData = new FormData(form);

    const jsonObject = {};

    // Convert FormData to JSON object
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

    // ===============================
    // AUTO-COMPUTE GCS TOTAL
    // ===============================
    const eye = parseInt(jsonObject.gcs_eye) || 0;
    const verbal = parseInt(jsonObject.gcs_verbal) || 0;
    const motor = parseInt(jsonObject.gcs_motor) || 0;

    jsonObject.gcs_total = eye + verbal + motor;

    // ===============================
    // ADD METADATA (OPTIONAL)
    // ===============================
    jsonObject.saved_at = new Date().toISOString();

    // Store report
    storedCareReports.push(jsonObject);

    console.log("Latest Saved Report:", jsonObject);
    console.log("All Stored Reports:", storedCareReports);

    alert("Care Report stored!");

    form.reset();
}