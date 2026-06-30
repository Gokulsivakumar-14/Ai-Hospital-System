const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;

const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;

function showAlert(message, title = "Notification") {
  return new Promise((resolve) => {
    const existing = document.querySelector(".custom-dialog-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";

    let icon = "\u2139\uFE0F";
    if (message.toLowerCase().includes("success") || message.toLowerCase().includes("successfully")) {
      icon = "\u2705";
    } else if (message.toLowerCase().includes("error") || message.toLowerCase().includes("invalid") || message.toLowerCase().includes("fail") || message.toLowerCase().includes("fill") || message.toLowerCase().includes("enter")) {
      icon = "\u26A0\uFE0F";
    }

    overlay.innerHTML = `
      <div class="custom-dialog-box">
        <div class="custom-dialog-header">${icon} ${title}</div>
        <div class="custom-dialog-body">${message}</div>
        <div class="custom-dialog-footer">
          <button class="custom-dialog-btn custom-dialog-btn-primary" id="customDialogOkBtn">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add("active"), 10);

    const closeDialog = () => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 250);
    };

    overlay.querySelector("#customDialogOkBtn").addEventListener("click", closeDialog);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeDialog();
    });
  });
}

function showConfirm(message, title = "Confirmation") {
  return new Promise((resolve) => {
    const existing = document.querySelector(".custom-dialog-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";

    overlay.innerHTML = `
      <div class="custom-dialog-box">
        <div class="custom-dialog-header">\u2753 ${title}</div>
        <div class="custom-dialog-body">${message}</div>
        <div class="custom-dialog-footer">
          <button class="custom-dialog-btn custom-dialog-btn-secondary" id="customDialogCancelBtn">Cancel</button>
          <button class="custom-dialog-btn custom-dialog-btn-primary" id="customDialogConfirmBtn">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add("active"), 10);

    const handleConfirm = () => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        resolve(true);
      }, 250);
    };

    const handleCancel = () => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        resolve(false);
      }, 250);
    };

    overlay.querySelector("#customDialogConfirmBtn").addEventListener("click", handleConfirm);
    overlay.querySelector("#customDialogCancelBtn").addEventListener("click", handleCancel);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) handleCancel();
    });
  });
}

// SECTION SWITCH
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === 'revenue') {
    renderRevenueChart();
  }
}

// GLOBAL STATE
const API_BASE = "https://ai-hospital-system-drr0.onrender.com";
let patients = [];
let doctors = [];
let payments = [];
let inventory = [];
let nurses = [];
let editNurseId = null;
let editId = null;
let chartInstance = null;

// FETCH DATA
async function fetchAdminData() {
  try {
    const resPatients = await fetch(API_BASE + "/api/patients");
    patients = await resPatients.json();

    const resDoctors = await fetch(API_BASE + "/api/doctors");
    doctors = await resDoctors.json();

    const resPayments = await fetch(API_BASE + "/api/billing");
    payments = await resPayments.json();

    const resNurses = await fetch(API_BASE + "/api/nurses");
    nurses = await resNurses.json();

    const resInventory = await fetch(API_BASE + "/api/inventory");
    inventory = await resInventory.json();

    // Populate UI
    updateDashboardStats();
    renderPatientsTable();
    renderDoctorsTable();
    renderNurses();
    renderInventory();
    updateNurseDashboard();
    renderRevenueSummary();
  } catch (err) {
    console.error("Admin data fetch error:", err);
  }
}

// INITIAL FETCH & POLLING
fetchAdminData();
setInterval(fetchAdminData, 5000);

// DASHBOARD STATS
function updateDashboardStats() {
  pCount.innerText = patients.length;
  dCount.innerText = doctors.length;

  // Random/Semi-static stats
  if (!emergency.innerText || emergency.innerText === "") {
    emergency.innerText = Math.floor(Math.random() * 15) + 5;
  }
  if (!operations.innerText || operations.innerText === "") {
    operations.innerText = Math.floor(Math.random() * 10) + 3;
  }
}

// PATIENT TABLE
function renderPatientsTable() {
  pTable.innerHTML = "<tr><th>ID</th><th>Name</th><th>Age</th><th>Disease</th></tr>";
  patients.forEach(p => {
    pTable.innerHTML += `
   <tr>
    <td>${p.id}</td>
    <td>${p.name}</td>
    <td>${p.age}</td>
    <td>${p.disease}</td>
   </tr>`;
  });
  searchPatients();
}

// DOCTOR TABLE
function renderDoctorsTable() {
  dTable.innerHTML = "<tr><th>ID</th><th>Name</th><th>Specialization</th><th>Status</th></tr>";
  doctors.forEach(d => {
    dTable.innerHTML += `
   <tr>
    <td>${d.id}</td>
    <td>${d.name}</td>
    <td>${d.spec}</td>
    <td>${d.on ? "On Duty" : "Leave"}</td>
   </tr>`;
  });
  searchDoctors();
}

// REVENUE SUMMARY
function renderRevenueSummary() {
  let total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  document.getElementById("revenue").innerText = "Rs. " + total.toFixed(2);
  document.getElementById("totalRevenue").innerText = "Rs. " + total.toFixed(2);
}

// CHART DRAWING
function renderRevenueChart() {
  const ctx = document.getElementById("revenueChart");
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: payments.map(p => p.date.split(",")[0]),
      datasets: [{
        label: "Revenue Rs. ",
        data: payments.map(p => p.amount),
        backgroundColor: [
          "#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function toggleChart() {
  const chartWrapper = document.getElementById("revenueChart");
  if (chartWrapper) {
    chartWrapper.style.display = chartWrapper.style.display === "none" ? "block" : "none";
  }
}

// DARK MODE
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  darkToggle.innerHTML =
    document.body.classList.contains("dark") ? sunIcon : moonIcon;
}

/* ===== INVENTORY ===== */
async function addItem() {
  let name = itemName.value.trim();
  let type = itemType.value;
  let qty = Number(itemQty.value);

  if (!name || qty <= 0) {
    await showAlert("Fill inventory details");
    return;
  }

  try {
    const res = await fetch(API_BASE + "/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_name: name, type, quantity: qty })
    });

    itemName.value = "";
    itemQty.value = "";
    await fetchAdminData();
    await showAlert("Inventory item added successfully!");
  } catch (err) {
    console.error(err);
    await showAlert("Failed to add inventory item");
  }
}

async function removeItem(id) {
  const confirmed = await showConfirm("Are you sure you want to remove this item?");
  if (!confirmed) return;

  try {
    await fetch(API_BASE + `/api/inventory/${id}`, { method: "DELETE" });
    await fetchAdminData();
  } catch (err) {
    console.error(err);
    await showAlert("Failed to remove item");
  }
}

function getStockBadge(qty) {
  if (qty < 20) {
    return `<span class="badge danger">LOW</span>`;
  }
  if (qty < 50) {
    return `<span class="badge warn">WARNING</span>`;
  }
  return `<span class="badge safe">SAFE</span>`;
}

function renderInventory() {
  if (!invTable) return;

  invTable.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Type</th>
      <th>Qty</th>
      <th>Action</th>
    </tr>
  `;

  inventory.forEach(i => {
    invTable.innerHTML += `
      <tr>
        <td>${i.id}</td>
        <td>${i.name}</td>
        <td>${i.type}</td>
        <td>
          ${i.qty}
          ${getStockBadge(i.qty)}
        </td>
        <td class="action-cell">
          <button class="btn-edit" onclick="openEdit(${i.id})">✏️ Edit</button>
          <button class="btn-remove" onclick="removeItem(${i.id})">🗑️ Remove</button>
        </td>
      </tr>
    `;
  });
  searchInventory();
}

function openEdit(id) {
  editId = id;
  let item = inventory.find(i => i.id === id);
  if (item) {
    editQty.value = item.qty;
    editModal.style.display = "flex";
  }
}

function closeModal() {
  editModal.style.display = "none";
}

async function saveEdit() {
  let qtyVal = Number(editQty.value);
  if (isNaN(qtyVal) || qtyVal < 0) {
    await showAlert("Invalid quantity");
    return;
  }
  try {
    await fetch(API_BASE + `/api/inventory/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qtyVal })
    });
    closeModal();
    await fetchAdminData();
    await showAlert("Quantity updated successfully!");
  } catch (err) {
    console.error(err);
    await showAlert("Failed to update quantity");
  }
}

function searchInventory() {
  if (!invTable) return;
  let q = invSearch.value.toLowerCase();
  let rows = invTable.querySelectorAll("tr");

  rows.forEach((row, i) => {
    if (i === 0) return;
    row.style.display =
      row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

function searchPatients() {
  if (!pTable) return;
  const searchInput = document.getElementById("patSearch");
  if (!searchInput) return;
  let q = searchInput.value.toLowerCase();
  let rows = pTable.querySelectorAll("tr");

  rows.forEach((row, i) => {
    if (i === 0) return;
    row.style.display =
      row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

// Added Doctors table search
function searchDoctors() {
  if (!dTable) return;
  const searchInput = document.getElementById("docSearch");
  if (!searchInput) return;
  let q = searchInput.value.toLowerCase();
  let rows = dTable.querySelectorAll("tr");

  rows.forEach((row, i) => {
    if (i === 0) return;
    row.style.display =
      row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

function searchNurses() {
  if (!nurseTable) return;
  const searchInput = document.getElementById("nurseSearch");
  if (!searchInput) return;
  let q = searchInput.value.toLowerCase();
  let rows = nurseTable.querySelectorAll("tr");

  rows.forEach((row, i) => {
    if (i === 0) return;
    row.style.display =
      row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

async function logout() {
  const confirmed = await showConfirm("Are you sure you want to logout?");
  if (!confirmed) return;
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}

/* ===========================
   NURSE MANAGEMENT SYSTEM
 =========================== */

/* SAVE / UPDATE */
async function saveNurse() {
  let name = nurseName.value.trim();
  if (!name) { await showAlert("Enter nurse name"); return; }

  try {
    await fetch(API_BASE + "/api/nurses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nurse_id: editNurseId,
        name,
        gender: nurseGender.value,
        shift: nurseShift.value,
        status: nurseStatus.value
      })
    });
    editNurseId = null;
    nurseName.value = "";
    await fetchAdminData();
    await showAlert("Nurse details saved successfully!");
  } catch (err) {
    console.error(err);
    await showAlert("Failed to save nurse details");
  }
}

/* EDIT */
function editNurse(id) {
  let n = nurses.find(n => n.id === id);
  if (n) {
    editNurseId = id;
    nurseName.value = n.name;
    nurseGender.value = n.gender;
    nurseShift.value = n.shift;
    nurseStatus.value = n.on ? "true" : "false";
  }
}

/* REMOVE */
async function removeNurse(id) {
  const confirmed = await showConfirm("Remove nurse?");
  if (!confirmed) return;
  try {
    await fetch(API_BASE + `/api/nurses/${id}`, { method: "DELETE" });
    await fetchAdminData();
  } catch (err) {
    console.error(err);
    await showAlert("Failed to remove nurse");
  }
}

/* TABLE */
function renderNurses() {
  if (!nurseTable) return;
  nurseTable.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Gender</th>
      <th>Shift</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  `;

  nurses.forEach(n => {
    nurseTable.innerHTML += `
      <tr>
        <td>${n.id}</td>
        <td>${n.name}</td>
        <td>${n.gender}</td>
        <td>${n.shift}</td>
        <td>
          <span class="badge ${n.on ? 'safe' : 'danger'}">
            ${n.on ? 'On Duty' : 'Off Duty'}
          </span>
        </td>
        <td>
          <button class="btn-edit" onclick="editNurse(${n.id})">✏️ Update</button>
          <button class="btn-remove" onclick="removeNurse(${n.id})">🗑 Remove</button>
        </td>
      </tr>
    `;
  });
  searchNurses();
}

/* DASHBOARD */
function updateNurseDashboard() {
  if (!femaleNurse || !maleNurse) return;
  femaleNurse.innerText =
    nurses.filter(n => n.gender === "Female" && n.on).length;
  maleNurse.innerText =
    nurses.filter(n => n.gender === "Male" && n.on).length;
}

function updateDateTime() {
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const date = now.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  document.getElementById("time").innerText = time;
  document.getElementById("date").innerText = date;
}

updateDateTime();
setInterval(updateDateTime, 1000);
