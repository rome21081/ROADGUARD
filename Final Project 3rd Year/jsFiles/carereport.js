let storedCareReports = []; 

function saveReport() {

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


    storedCareReports.push(jsonObject);

    console.log("All Stored Reports:", storedCareReports);

    alert("Care Report stored !");

    form.reset();
}
