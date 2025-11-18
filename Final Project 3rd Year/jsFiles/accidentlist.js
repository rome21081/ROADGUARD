const accidentListEl = document.getElementById("accidentList");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

let accidents = [];
let currentPage = 1;
const itemsPerPage = 5;

// Fetch accidents from API
async function fetchAccidents() {
  try {
    const res = await fetch('../htmlFiles/accident.json');
    const data = await res.json();
    accidents = data;
    renderPage();
  } catch (err) {
    console.error("Error fetching accidents:", err);
    accidentListEl.innerHTML = "<p class='text-danger'>Failed to load accidents.</p>";
  }
}

// Render current page
function renderPage() {
  const filtered = accidents.filter(acc => 
    acc.address.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    acc.case_number.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = filtered.slice(start, end);

  accidentListEl.innerHTML = "";

  paginated.forEach(acc => {
    let severityClass = "";
    switch((acc.severity || "").toLowerCase()) {
      case "no injury": severityClass = "severity-NoInjury"; break;
      case "minor": severityClass = "severity-Minor"; break;
      case "serious": severityClass = "severity-Serious"; break;
      case "fatal": severityClass = "severity-Fatal"; break;
      default: severityClass = "severity-NoInjury";
    }

    const card = document.createElement("div");
    card.className = `accident-card p-3 mb-3 rounded-3 ${severityClass}`;
    card.innerHTML = `
      <div class="accident-title">${acc.case_number}</div>
      <div class="accident-location">${acc.address} — ${new Date(acc.accident_date).toLocaleDateString()}</div>
      <div class="accident-severity">Severity: ${acc.severity}</div>
    `;
    card.onclick = () => window.location.href = `accident_view.html?id=${acc.accident_id}`;
    accidentListEl.appendChild(card);
  });

  renderPagination(filtered.length);
}

// Pagination buttons
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  paginationEl.innerHTML = "";

  if(totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { currentPage--; renderPage(); };
  paginationEl.appendChild(prevBtn);

  const pageInfo = document.createElement("span");
  pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
  paginationEl.appendChild(pageInfo);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { currentPage++; renderPage(); };
  paginationEl.appendChild(nextBtn);
}

// Search
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderPage();
});

fetchAccidents();
