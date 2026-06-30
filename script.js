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
    } else if (message.toLowerCase().includes("error") || message.toLowerCase().includes("invalid") || message.toLowerCase().includes("fail") || message.toLowerCase().includes("fill") || message.toLowerCase().includes("enter") || message.toLowerCase().includes("choose") || message.toLowerCase().includes("select")) {
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
/* --RENDER CONNECTION-- */

const API_BASE = "https://ai-hospital-system-drr0.onrender.com";
let paymentHistory = [];
let lastBill = null;
let patientId = 1001, doctorId = 2001, bedNo = 1;
let patients = [], doctors = [];
let appointments = [];
let apptId = 4001;
let singleApptViewId = null;

/* ---------- NAV ---------- */
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- HELPERS ---------- */
function randomDays(disease) {
  disease = disease.toLowerCase();
  if (disease.includes("fever")) return 2 + Math.floor(Math.random() * 2);
  return 4 + Math.floor(Math.random() * 5);
}

/* ---------- LOAD DATA ---------- */
function loadFakeData() {
  const docNames = ["Arun", "Meena", "Ravi", "Priya", "Karthik", "Suresh", "Nisha", "Kumar", "Divya", "Bala", "Asha", "John", "Paul", "Anita", "Ramesh", "Sneha"];
  const specs = ["Cardiology", "Dermatology", "Neurology", "Orthopedic surgery", "Pediatrics"];

  for (let i = 0; i < 16; i++) {
    doctors.push({
      id: doctorId++,
      name: "Dr " + docNames[i],
      spec: specs[i % specs.length],
      on: i < 12
    });
  }

  const patNames = ["Rahul", "Anjali", "Suresh", "Kavya", "Vikram", "Divya", "Arjun", "Meena", "Rohan", "Pooja", "Manoj", "Priyanka", "Amit", "Sneha", "Kiran", "Lakshmi", "Nitin", "Swathi", "Ajay", "Neha"];
  const diseases = ["Fever", "Heart Problem", "Skin Allergy", "Bone Fracture", "Asthma"];

  for (let i = 0; i < 20; i++) {
    let dis = diseases[i % diseases.length];
    patients.push({
      id: patientId++,
      name: patNames[i],
      age: 20 + (i % 40),
      disease: dis,
      days: randomDays(dis),
      bed: "B" + bedNo++
    });
  }
}

/* ---------- INIT & FETCH ---------- */
async function fetchAllData() {
  try {
    const resPatients = await fetch(API_BASE + "/api/patients");
    patients = await resPatients.json();

    const resDoctors = await fetch(API_BASE + "/api/doctors");
    doctors = await resDoctors.json();

    const resAppointments = await fetch(API_BASE + "/api/appointments");
    appointments = await resAppointments.json();

    const resBilling = await fetch(API_BASE + "/api/billing");
    paymentHistory = await resBilling.json();

    render();
    renderPaymentHistory();
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

fetchAllData();

/* ---------- PATIENT ---------- */
async function addPatient() {
  if (!pname.value || !page.value || !pdisease.value) {
    await showAlert("Fill all fields"); return;
  }
  try {
    const res = await fetch(API_BASE + "/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: pname.value,
        age: parseInt(page.value),
        disease: pdisease.value,
        gender: "Male"
      })
    });
    const newPat = await res.json();
    pname.value = page.value = pdisease.value = "";
    await fetchAllData();
    await showAlert("Patient added successfully!");
  } catch (err) {
    console.error(err);
    await showAlert("Failed to add patient");
  }
}

async function discharge(id) {
  try {
    const res = await fetch(API_BASE + `/api/patients/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
    } else {
      await showAlert("Discharge failed");
    }
  } catch (err) {
    console.error(err);
    await showAlert("Failed to discharge patient");
  }
}

/* ---------- DOCTOR ---------- */
async function addDoctor() {
  if (!dname.value || !dspec.value || !dstatus.value) {
    await showAlert("Fill all fields"); return;
  }
  try {
    const res = await fetch(API_BASE + "/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: dname.value,
        spec: dspec.value,
        status: dstatus.value
      })
    });
    dname.value = "";
    await fetchAllData();
    await showAlert("Doctor added successfully!");
  } catch (err) {
    console.error(err);
    await showAlert("Failed to add doctor");
  }
}

/* ---------- BILLING ---------- */
async function generateBill() {
  let id = parseInt(billId.value);
  let rate = parseInt(billRate.value);
  let mode = paymentMode.value;

  if (!id || !rate || !mode) {
    await showAlert("Fill all billing details"); return;
  }

  let p = patients.find(x => x.id === id);
  if (!p) { await showAlert("Invalid Patient ID"); return; }

  let total = p.days * rate * 1.05;

  try {
    const res = await fetch(API_BASE + "/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: id,
        amount: total,
        payment_mode: mode
      })
    });
    const data = await res.json();
    if (data.success) {
      lastBill = data.bill;
      billOutput.innerHTML = `
        <b>✅ Payment Successful</b><br>
        Patient: ${p.name}<br>
        Mode: ${mode}<br>
        Total: Rs. ${total.toFixed(2)}
      `;
      billId.value = billRate.value = "";
      await fetchAllData();
    } else {
      await showAlert("Billing failed: " + data.error);
    }
  } catch (err) {
    console.error(err);
    await showAlert("Billing failed");
  }
}

/* ---------- RENDER ---------- */
function render() {
  dashTable.innerHTML = "<tr><th>ID</th><th>Name</th><th>Age</th><th>Bed</th><th>Reason</th><th>Days</th></tr>";
  patients.forEach(p => {
    dashTable.innerHTML += `
   <tr>
    <td>${p.id}</td>
    <td>${p.name}</td>
    <td>${p.age}</td>
    <td>${p.bed}</td>
    <td>${p.disease}</td>
    <td>${p.days}</td>
   </tr>`;
  });

  pt.innerHTML = "<tr><th>ID</th><th>Name</th><th>Bed</th><th>Days</th><th>Action</th></tr>";
  patients.forEach(p => {
    pt.innerHTML += `
   <tr>
    <td>${p.id}</td>
    <td>${p.name}</td>
    <td>${p.bed}</td>
    <td>${p.days}</td>
    <td><button onclick="discharge(${p.id})">Discharge</button></td>
   </tr>`;
  });

  dt.innerHTML = "<tr><th>ID</th><th>Name</th><th>Specialization</th><th>Status</th></tr>";
  doctors.forEach(d => {
    dt.innerHTML += `
   <tr>
    <td>${d.id}</td>
    <td>${d.name}</td>
    <td>${d.spec}</td>
    <td><span class="badge ${d.on ? 'on' : 'off'}">${d.on ? 'On Duty' : 'Leave'}</span></td>
   </tr>`;
  });

  populateDoctorDropdowns();
  renderAppointments();
  searchPatientsListFunc();
  searchDoctorsListFunc();
  updateDashboardStats();
}


/* ---------- PAYMENT HISTORY ---------- */
function renderPaymentHistory() {
  paymentTable.innerHTML = "<tr><th>Date</th><th>Patient</th><th>Mode</th><th>Amount</th></tr>";
  paymentHistory.forEach(p => {
    paymentTable.innerHTML += `<tr>
   <td>${p.date}</td><td>${p.name}</td><td>${p.mode}</td><td>â‚¹${p.amount}</td>
  </tr>`;
  });
}

/* ---------- STORAGE ---------- */
function syncToAdmin() {
  localStorage.setItem("patients", JSON.stringify(patients));
  localStorage.setItem("doctors", JSON.stringify(doctors));
  localStorage.setItem("payments", JSON.stringify(paymentHistory));
  localStorage.setItem("appointments", JSON.stringify(appointments));
}

render();
renderPaymentHistory();

function toggleDarkMode() {
  document.body.classList.toggle("dark");

  const btn = document.getElementById("darkToggle");
  btn.innerHTML = document.body.classList.contains("dark") ? sunIcon : moonIcon;
}

async function downloadInvoice() {
  try {
    if (!lastBill) {
      await showAlert("Generate bill first");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const invoiceNo = "INV-" + Math.floor(100000 + Math.random() * 900000);
    const today = new Date().toLocaleDateString();

    // Base64 Logo (fail-safe for local file protocols)
    const logoDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAEMSSURBVHhe7X0HWBXX1jZzwBLB5KaXLzf3y81NbnJbyE2igqLR2MUSY0usib3FQu9FkaKU0+hNERQUpFrAriiCgmLBLljBXrBr3v9Ze2bOmXPm0Ey79/uDz+vMmdmzZ89+Z6299tpr7zH78ccf8dsAJo7994MezPgYD3bKxPFnA/0ZHjP+zcPM+MB/GtBAwf/v4tme19SLRcdMEvz0xx/x5CnhKZ6y7Y/C9qlwXPyt35emE9NK9/XX8vum0kuPi+nF84b56MshR2PnjGGcVlpGftvQvfXPKDn+RPoM+m1D+TT1Ww/ja4U6Ia7EvE3wSDAgmBLllpxDL/dCfDw9G9bTc2A9IwfWM3NhPSNX/5uBzovIkYB+r4H1tDWS8+L+Gnw8LQvWBOM0unyN886G9TQxjaQMunzFfERI7kn3mZrJg+0Lv6XX0L2m0XkBU8R9Kqckj2mrYT1lFY+phHRYT1kB68lpsJ60FNbfRcF6bASsxylhPUGJTyar8ck0LaxnamE9SwPr2RpYz9XCep4W1g6RsHaMhLVzFD5xj8EnHrH4xDMW1j5xsPaJhbV/LKwXxsM6MAHWwYmwDknEJ2HJ+ES5lIdmGT6JXIZPYpbj3/Fp+CQxDX1X5yDv1OnGCY7MPYxWg9PA2aeAG7AUXP+l/NZ+GTh7YZ9hme68GcMyftsvCWb9k8ER+iWB66//TefoNzvHtkkw65sopEuW5E37+mvYdf0SdWkoPwP0S2Rg+fRLBsfypPRJbF93jqWnNEI5+ibw1wp50DVmfRPA9Y0H1y+Bz4MhAWZ942FG2z5x4PrGwqwPIQZcr0iY9dKA+zIc3BcLwNl5gOvqCe4LL3C9vMD19wVn7wNusA+4IT7gvvYFN9wX3AhfcKP8wI1eAG5cALjxAeC+CwA3ORDclEXgpi0CNysQ3A/B4OaFgHNcAs4lFAr3MHBeYeB8I8AtUEIRoAQXqIIiRAVFRCRaa2MRvf+AaYIrTl1D20HL8PKIFASsrETiuqNIWMsjcd0xAfw+Oyaciy+o0qVLWEv7PPjjIo4ioaCKXcPnS/tVSCg4ok9Dx3X3NMxHl5fuWv7+8WJaIR9WJpb+CH+Nrgx8er7MwjGWRkzHb+l34lqCPg0hUVdO+n1Yj/xDSMg/iPi8A0jI3YuEnFIk5JYiIa8UifmlSFxXhoR1pUjYUIbEDWVIKCxDYlEZEjfuZUjYtBeJm/chYYuAbeVI3LYPiTvKkbizHInFFUjcVYHE3fuRtGc/EgmlB5C4txKJ+yqRWC5gfyUC9pThdW0MLJUaHLhyxZBgUs0DfDbi1W9W4nDNDSMxf5ZG/1mueVY0815PDX/zxpv+2uYbc81J11iallrTzU975MoVvJGUjMFr1+qOMYJPnL8Ji35xSNhw7Jkz/yVgYBkaEdRSmLIyf2k0/6X5+ZBcVYVWag1O37rFfjOCwzIP4p2xK3H/4RPZBb/jvwv3Hz/GO0lJUO3fz36bkYn9lW8RZml3yRL/jv9OzNq2FcMENc0I/uD7DKzYckqW8Hf8dyLt6FF8mLKM2VZmDx49wQtDErGnqlaW8Hf8d6Lk0iU8HxOFh0+fwuzOvYdoOyAepy/yjfLv+O/HqZs30VarRv2jRzC7c/ch2vSLRXXtbVnC3/HfiepbtxjBdx4+JAl+hDb94n4n+P8Qqm/fQttIjUAwSXD/X5ZgvaOdB+0bp/kdPx8MJZgR/POraLLgquvuIHzNEfTz3oT3JmXDalgaXhm9Gp/M3YBJyl3I3lWNuw8ey679VfFLvWxPn8qP/UrgCVaJKvrnJ/jUxduYEL4b7YaugNmA5QJSYGa/HNzAVP1gxcBUfDAtH0mFx/Hw8a9YISKpvxS5vxBoaND4mCkYEFzP2uAY1PwMBNNYpSb/GJ4fni6Qmgqz/sthPmAZOswrgMfScqRuOY3CveeQV3KWpf02eAteHrkCPdwKmcQb5/lz4uGjx1i36yicI9djnE8qpoTkIHzFDtTU3jCovJt37suuNYVztddRdbqWxxlCncHvE2cv6/KVp+VxRPx9uhZHz9Ti6s36n9yEySW4X/RPlmAy1r4J2ckTa5/KyG09OBUTQnficM1NkwPSbLD8yRPcqn+ImLVVsHUuwo6Dl2Tpfg5s23cS/xgTAc7GGYrObvjomzB8PDYCbbr7o3U3H4zySEVxZQ12HzyLhUmbZdebwjDnBChsHKGwdYHC1hkKWycobJyg6ERbF/xxgCcLAqBnH+KUBHMbR5izdHxac0pv6wzzLi66cxad3fCPUSGIXF3MXkjyZ7fUpy1vg/tFofrSs/eDr995iO6uRTyxjNwUfD6nACVH9cNWUly9fx8bq88g4UAlsk+dwtk7d5j0X7/9AO5Je7HlwEXZNT8Fqesr8Fw3D3C2LvhDb1+s3rQfj548Yfc8eLIWH49RwszOF4ouXmjV1QvecUWyPEyh5uJ1xGWXwLKbO3txGDo5gevogBnBWTh48pKuLT594RojrU1XSuukS/9SLw+kF1Vg+bq96DpFw19v68q2gxwScP/BI9l9mwIjWGdFszY4CtW1zSCY/hkdu3P/Mbo5bxCIXQ5uQAqma0uaNJ7orX745AlKLtVixsaNGJiTg8KzZ1mlr9lxCpWnrsmueRZs2XsCbRm5rkyysrYclKU5f/kW3v5qCbguXgxesRtlaRrDxIUZ4DqJBDvj9X6+ePDI9PMPcUoW0vIk95gZw6vkpz+i/t4DfDpBpX9RbJzhE7tBlkdTMEHws6nox0+eYvii7XxbOyAVCvtUBKw8YFIdN2VVHrl6FTZpaRial48L9fU4ePI6rt9+KEvXEty8cw9/GhwAzsaFVdYAhwTDNJK2LmNjJRRdfaDo4gmvZkqwCHXGDp40AbYTlQ0aRE6qXCEdEeiEPnPidPVFQ5qZmw+A6+QoSLgLXujhiRu378nyaQxyFd0/mhlZLR0zDco4BM6eN6Y4+1QsXFlpmtxmgNqZ+kcPMWZDIf6cvBRll2pxq77l6kkKn5j1OsmitnJDSZUsjYjHT57gkwlaKDp7tJjgxNw9OokjdJ+ubZBgj8gCmFFaKcGSF+1W/X20tXPVvZSEzM2VsnwagwmCW95NKjt2BW0Gi92gVHwXsZs5MYzTEcToP8MIQtMVQG3jt2vX4rXYWJTWPvsAyO36B3itj49OHb7Zv2G1KSIqczcUdqSiW0ZwEhHcsZkER63lyW2AYNIq7w8PFgjm4RlVIMunMcgJHtAygikw4JNZBeCE/m2HeWsbbHNptGpc6C78e/ZafDK7gMF6VgE6O6xH+QnT7ezdR4/RNTMTb8bF4/gN4xCi5mH52r36iuzkhBHuS9nxxrTU5Rv1eK67LzxjCmXnGkNSbqlegjs5o8c0IliejuARVWBI8A96FS3CdpLaQIKnBq6S5dMYqm/dZgTf1hPcMldlWNYRcP1TmPQ+P2wFjpy9KUsjImPbGXDURtun6SH87ue9scGKqLl1G2/ExuHT9HTcedRyVf2VU6K+revkhCXLt8jSSEHEU1m6TY9+BoINVXSPZkkwn5YRLKkD2u86RWtA8AT/lS1yyjAJVhtIcPMJvnLzPl4ZlaGzmEMzD8nSSOGetA9mAwyJ5btTaXht9KoGCSasOHYMFmoN5m3fIXvLG8ODh4/xUk9vieHjiHXFR2TpTMEnYTM8WkywRIJ1BMvTEXiCBYubCDZW0T/+iC5MgvVp5oatkeXTGEwS3FxPlkdyuc79+O8f8vHwUeNxXA5xe3mCBUtbdIIQXhyZLns4KYjU/tk5aB0ZiZ0Xm9833nvkHBRMXfJSoOjkgJPnTPfJjbGh5BiCl22VHW8MSXmlfBssENeoBEeSihbIs3VBnznxBufpmf82aolEjTtDlb5dlo8OZM8YHWMEawyMrJhmSfDVWw/wouCGNLdfjs0HmvY6yQnW7784onGCCQevXEUbjQYdMlbhcQOVZoyEnBKJkeKMVp2dcfd+89Q8711r3n1EJLeQYDMpwXMNu26kfay+EBwnnZyYh+vw6ZYZm7yRpZG0wc10VS5edYhvTwcsR3+fTU2SQ+AJlkivlOCRGc3KY/yGQpirNVhRdVR2zhSc1QUGVujrfX0arPCfA4xgSbvaqIomCRb6uCLBYlrqKu6oOG3QD+49O7rBvBqCoaND6Ac3RfCjx0/x3sRsRq5iQAp2HmreW+UYVwaz/nLpJbL/MKJ5BB++ehWtlWpYp6Y1S4pHeS6HmUSCPxwR1GKpbAl0EiyQ0mNGZIPP5S4jWK+i6Zoxfuk69fz6gIU4fraJpsVEfcgJJl90E67Kwn0XeKeGfRq6uxU2+ADGcJRIMCc1tgak4g/NlGBqYwbn5sJco8X66mrZeYO0T3/ElzNjDazQjt+rmnWfZ4VBP9jWuVGCmZGlI9iZEUwDLnfvP4QyvZgNOBDxfxsZhIpjF2TXNwdygvtqmhxsGB9azKSOSM4qrpGdbwhSgl/7dhUsBqbxRLeAYMK6M9WM4GEF+mkZpkD52Uw07Ed2maJp9n2eBTojS7SiRYJN+O5ZP1hiIVv28MIHwxbhrcFBbFSKjn02LhS1124/c5nlBPdWNkpw/f3HeGkk3zV6e1wmc14Yp2kIYhtMbbdTwl78dXKuXkW3gOBHT5/i3cRktNNG4fLdhn2z1NZ+OjaMJ1joJnWdqpVZmj8nGMFiN8lWVNFy1UnQt8G8FL8z0B9zFmdiWnAmPhhKfnM+jz9/FYiUgjKhfp5huJAIftRMggtKzzPHBnmuXBL3ys43BlGC6drIgqPo6rRBQnDj/WBjuOzYCYU6EgmHGu7TUsV+Pj5C0gd2hh0R3MR9xCUR5EsjNA2eYL1U9pjeCME6Fa23onlXLm9BzwnNYSNfZtS9s3WBgzKvybIbgydYLSG4V0SjBM+KLGWRGWRc7T99XXZehDj7/Ilu/ykvwcIYcdauagzx36Ij+MVvMtmIlH5WvX4mvKlBbhqAMFdpMSg3X3ZOBF3bZTKNq/LkkmO/43emR3eu3bwLz8h8JlUebCtAmw/PqLUISm7Y0yYFM7IkardFBM+JN9AuNMj/73HhwnlXRnJKQcuESu6LboRgesAPJmUzgv82NdvkA9Mx9+Ji2KxMh016Ojqlp/P7K1fiLZ+lMBuYBsXANOw5ehmTlbt1bbLF4DR0mpONjj9kocOcLHT4YQ06zFmDgd7rUXtdrobpZXg3cSleiIpr1H3Zf068RIKd8NfhgSYr/FzdTXw0IlhwijjqnQtCREbXiREmrzOGAcHki26GiiYJpa10uFBEAhltkm7en4cGNTlQIoWc4N4NE1xdV8+cGmb9U+CWtE92nrD93HkolCpwKhUUajU4Au2rlODCleCGLYP5wBScrr0NtyRS2bwnjFYSMOtPs/DjdOD6xYPrHw+n+BKDe4iDBFOLNsFcFYXNZ8/JyiFi4gLqaugJfr2vN9MOxukI1H1yUeVICCKCHTB7cWaD1xiD7wfrr+cHG0xf6xEpkWAbZ/RmrkrDtDWXrsOcGVxkadPQoTO27jOcO2Z8jRRygnuFNUjwii1nwPXn/c7bKk33fRftKQWn4knlBKJpq1AqwUVEgHOMxvMj0rG95iJCVh1gLwtFWJrRUhFEqIRgEXZOptuejGMnoFBGwq+kVHZOREDiRt5NKRDcurMz7j9sWOIPHL/IYqN00mvrjJJDze8p6D1ZPBr1ZJnyRRulefT4CV7u7avrKxPJgUubFydG4F2VYlQlEdwzFDUN9IPnx5CjYjn+MCKdDRMaF4bgu2uXnlwGJQMjmBAagfdnrkbCwSOIX3+MH2ZkgQLLYGZAcCw4Qv84dJi7xiTBl+7Uw0IVhX7Z+fqyGFUmHxUhUbedHHHm4jUWvWacH8vzym2h0nlvlHknB1RfND2UaQyyFfh+sKDibZzQc1aUybITDAgW22ATad//OkgiwS6YzIYM5XaJKZxhgw1KiQT3DEH1JdNDft2cCpk67evVcJySb3GxQDARqieYRwQUEeHoEZcFj5ISrNhxmvWlmXqm+GgimBY26RsjbAWC52SZfJmoMv6esgKvxSU1qEKJHPNOjjDr6KSLnijcY7x6gR6Xrt5mlch8xOT/7TQf52rl49AUAFd54oLsvvrBBp7gQY6JsmtFMBWtk2C5kUWgZ/zHqMU8uQwuGOuTavJFMAVGsCjBRHDbL4NNEkzuyVdGpjP1HJDecNiIAcERUnJFSY7AmPw8TNm1A1n7qlnQ+8czc3iSDQiOYVuz/rHoMCezwQeaULgJFqponL5pWusQAe9Tn1KiNiNWbJOlE6GTYCGtKYIppKffvGRY2DozC1t6jlfRogQ743v/FbJ7iDDuBzckwR9SVIdALoHiuKXnG2oCCLyKlkhw2x6LUGOC4Jq6eihY/zcFheUNu818i0UVzUuslFxLrRbWqcvhunsXfijZjmUlR2E+IBlZu2qgGLicEcyklpYl6hvNE90vplGCVRWVzNAqON2Q2xKYG7pGIIwn7luv5SbS8eAJlqp0OcGbyk7wpHR2Q/vuHrhdzwfH083is0v019s4wyu6YW+b3hfdMMH0+y37hfo22MYFP4Q2f0yYHw+WEtx9AWouyVXSxopLzMHRauBy1N1sONqfl2C1IMERvBQT4Wo1+mWuhqqiAhGlpfA+sAt5R8/AckQ6Lt24Dwt7aoNp/SladyqaR99oRnDHOatlDy5iy7nzjODQcn4dClMoO3IW5qJVbOOMPw5ayIwX43SES1fvQGFDschSFW3Y319IhltnN16qOruj4uh53Tnlim16q93GCSsLy2X3EGEowWRkyQm+dusuWndxA0dlErpKkat2yvJqCERwG2WEhOAv/EwSHL/+ODOI3v2eN3jEroqxt2dRSQle0GrxQqQWL2jUPLQaPB+pReSB/dhUU4OUqir0X5eHyquX8cHULDY++8dxq9B+SDLaD4pH+0FxaD8oFu0H8/jC0bSRRThPhpYyCjM3N6x26dru0yN1UkyGVvF++UpwhAuXb/EVadQGS+O3nFV54GyJYDdwHeej4qi+m0YqW7zWwtaJGXTG9xDRHAkuKj2ub39tXFg/vfKEEPDQQJ1IQW1wG2W4fjy4bTdfVJsg2GNpBSO4v/cmmSEgxb1Hj3HzwQPcvP8AN+7T9j7bXrt3D+fq7yC75hRWVB2BZVgYtlyoxoyUHai5dhuHq6/j+q37bEYDD/3+rUbmB9GQ4avRCRggtaRNYGfFadZmiiSP91spS0N/+ggQXtrJijaW4ICkTboKf6GnN27f1ZdvuFuKjuDPx4fJCJOCXI+iVNKQJovoMEo/PWSNhGBn5tkiJ49xXg2Bl2ApwV+YJnhSRDGzoOfG7JGdkyL+0CHYZa1Gl4yVDHar0tGFkL4CPfPXwLtsDzZUV4OLCEfQ3lJsvnAKmQdPY83O0+gybxW6zM1Al7kr0XkOYQXbnxy6ocGKouOfpa3CxykrGyWYMD88h80XospvZeuMvUfOsuNSLbRkuVTFOjPVfvaSoRRu3HNcGO1xwTdeeoOHXItvD1okaAAnxOfslpVBiuFuy3QEE3r9EGdwvqq6DlY9fAT17MocHgXNjCcTwdpglU5FP2iQYHufzawNVuXKA8alVhz1gxVqcnBQ26sEp+a3dKxVpAZ9Mlcj6cABKMJDMWljIbbXnYPn2lKMW7IFXF8NuN5KcL0iYNYrXEAEOs5Ka5Bgwle5a/FW3FJZl8UY9x48wsB5cazyzTq54IMRi9ksPrH8p85dxf/Yi7MfKPrDF4FJG5njX5oPxZ79nWKlbJzx7tchuHrzLitfMvWBO7szx8qn48Jl1+mvf4w9h86i/ZcCeexlcsFfhoewNpdmYWzZdxIfjFgiSK8bLDq7YkFCy2K0CTzBOiPrAdp28zEgWAwhtZm/nhFcUNqwW5Dgw4ysCD3BEijUSryemIAftm5hxH+9tgD7r15Bl4j1eH10Grg+akYu1zOcRy8eHWc13u+bvXUnLNWxuNuIT1oEDabPClmD1p1dWNfphd5+GO6xAqO9U/Fa/wDmd36pty/ctGtRd+1Og/ctOVjDR2vauOD9r4PxletytOtK857c8OevFqGq+rLsGgLlN8Z3JVrbUayV3nBiJNu64sWePnixty8jlLxoFp1d8M/RYVi1qbLBsjQGIyv6Adp09UL1RcM2h0Z4Ppy0hhFMC5UaZyIFT7CEVHGfdZkimCSLx7qtSGM3tlqYAG5QErjeKpj1DDcAEd5x1opGpXPhnr3M0Lp2v+G22hilh2owPSgT/xgdhjcG+OPdIQth75AMTcZORqxxelOgebzf+a9kBL/efyH++c1iuGoKmrx+xfp9WJS4EYuSN/NbQkIRFiUW8dvkzVicsgWp6/aivOp8421uE6TrXJX8cOEDtOnmbVJFvz16FRQDluHSDfnIjhQR+/fzAwwCoTy5erIZmNqOwL+WJaPu7l1YLF4CbigtyavkSe0ZxhMsqOhezqtl95Eiev9BKFRROHOr8VgyU6DKI5VL28YcBg2BpIquJXX8S8Z6PSt4gnWDDaSiiWD5OO+rIzPQamAKi+gwPifFsWvX8Vy4oYODjSYJJOslOwJvJcShvK4OirBQcLM14Hry6tnsSyI4jKlnRW8lNNkN9CUFQlKPHmcEH7rauHb5j0ITkvdzgR9NUolWNBlZ3ib7wS+PSGehOo2qCwFrT52C986d8N61C967dsO7uBheO4thm55uQHJ7tRJrTp1kEt8uOBye8dvhmbADnvE7+G3iDmiyK/CwAaeE7n5natioUsXlJqIO/z+EkauSJ9i4DSa8MnIVi8FqqitiEkI3ZP62bYIbk1ffrdUqLC4rgyI8HC9Galn0h+xaCRpSoVvOnoe5Usu0QVNpm4Wfcu1/FJ7ygw26NTqIYBNGFuH1b1fjz9833wdqCg7biWCp6lbCMjKSkf5SrDC73cR1TWHnhYuM4P2X5ZZrbf1d7K2rw4PHfNNCjpGy2lqcvc2316KHipb6S6uqQuyBA8wuMM7nzsNHzAOXe+oUW41APH7i+nXsq7uMvbW1OHrtmoExWHP7Nspr+W7YrQcP+HR1tSwtQ12dgWF45uYt7KutkxmUx2/cROXVq7IyNQd8TJZURXf1lBFMFf/OuCx8OCXnmUkgzN+61YBg3RgxERzz7AQXE8GqSBy9Ln8xVfsPwFypxllhUexbDx/CQhsJ5+36OT437t9H59VZLOJEEa7En1KW4xjlJZSHCO22OhMKlRoKbSRG5uXpSBhZsBYKTSQUESqYLwnH9xsKdVpu+qbNsNRGsus3UqQLpVNreGi0LPJl1VF+6JKu+XJ1FswjlKiS2BJ03D6vAO8nN93PNwWZBLcxQTB1k/4+LQ8fTf1pBM9jBAsjTQZ9ZDVejG75tAwROy5cgEWEFpfq5ZKn2lduSPCDh7DQaOCyY4cuzcxNm6FQUcVr2bQYIrprWpquycg+cZKRYRkVhTYqNczDwrH3Eh/RMjK/AAoWnqQBRwRqIrH29BkmtTOIYI2GEVxUUwNzLU8wp9ZCEaFksd2rjx9n+dDi3S9ExYBTaZBwSD9Lk+rEPjcP7yfQmLf82ZuCaGRJVLScYLqJnVMR/voTCeYlWCRYCOcRwAg2cU2jEN7oorPn0EYZycgzTqOu2A8LYwmOjNQRfOXePVhGReOlqGisPVONkosX8V5yMszVaqYZSIrddu2ChVaL8suXsfPcefTPzdVJ04g12Xg5OhrFly4hpGwvFKFhmLOZD6mZsXETLNU8waSKt5w/j8WlZSxN4J5SbDp7VtcclF6qhUKpZi/S5CJ9QAVPcL5AcMsl2DAmq960BBMG+23Fnydmy463BMzIEtUzC8TTx229+BNU9JqTp/BSVLxB2yhCXV4BiwgVagSCb5MER0bCeetWFraTdqSKlSewtEx3zeqjR1nzQdY//c3etAltVCpcvnuXvYT1jx8x4qm8IwsK8HpiIh5Rf/rJE7bcxNB163QSbCUQLOZdSLMywsKRf8owcE5ZsR+twyPQZWU6/pmyXPeyMxWdQxKc2KQRagpGQXcNEQxMVZfg7fHZLZcyCXgrWt/u6kJ6xDbYxDXNQdKRKryXrK8UKdTl5aztjK2sRNbx40g9UsXaOZft2xkJtDVXqVF17ZquzSWDq31MNL5aW8CcF4vI0tdo0C09A0euXzew0Efm5uH1hAQmXbcfPMDz1EavX8/KMmMjTzCtNSKmZwRHKNn0G2k5R+YV4O8py9m9LJQq1NbXs+P0Eg3IzsX78YnPLMFtDPrBXT1MEPwjvJdX4iUhON34XHNBBDOpZdAbWqSWXop+dgnWVBxAl4zVpgmu2K83bHRQw3VnMSNqwvr1eE7Nz92RXvd+chK6ZqSzSqVlndqGkVdOA0ttFDSSD06NyM6GlUoN77IyDKT2ODQcPjv5AXlTElwkELz2zBndMarTPyYmY3xhEQrPnGF2QL7wAlAZB2Tn4P04ftaD8fM1BVk/uI2du0mCk4pOsS+hNeXJagyOO3aAYyNNxsF4RPAztMEC/PaU4dsNppdaUFdUMAOK2mELtZZJhyIyCs5b+QCBCYWFeC4igr3h4jVUjr/ExeGLVRn876dPkVJ1FC/GxDEru01kFLOyeRW9lhmJzMJWqvBcTCx7IUQJFttgMW+RYKkEn7hxA+bhEdDu24fr9x+gbWQ03OklEZoBe5LguPhnN7IMCO7iJiOYPBXbD12G+cBUXLrefIe+McL2lfPB8KIUS0Jr/7506TMTPGvrdnjuMj32yqzosAhUXK5D7d17bIl7qkyXbdtY++q6fQezaKskXay7jx+jfWwsvs7PN1DH527dxlCSUqUKyjJ+CglZ0RYaLf4Sn4hP01Zg1cmTuvTMyNJomyR42eEj7AX5Kj8fs7duw/OaSHRdnqarD/vsHPwlNu7nI5jWXTROePHaPZgPXoHyU/JzzcXpmzfxYmQUr5aZf5q+sxfBpCq8okKWvrkYmleAZUfk49QERrBKxZwO9K5SdIm5UgVXwYpmlRsZZWBkUVutiIqCX+keJkEUoUJOFNo/fv06K7/v7t2MgBHZOXhVG4l7jx/LJqSzNlijNWiDiWB6oaQE0wwNLkLF942pu6ZU4/mYOJYnU9FrsvF+PN/OGz9fU5B1k9rYubHpEsYJHz/5Ef8zfg3ymxgPNgWpFJC3ZvfFi9h96RJ2XbyIXRcuoKKuTlY5TUH0QFGld8pYjZKLptcIUe/fzyRMtKLJo2QRFcVmJ1K5LtXX4zltJF5SqrD+zBmU1tXhL0uXwiI8gnmayNHqWbwLHTOzWGXR0hH0Yqr28VN3RuTk4rVE05VPEiwjuJonmLpkrPw//oh/JqfgzehYDMzNw6B16/H5inQowlUouXCRGXn2Obl4OzoahTU1rIxlEpdsUxA9WRIr2t2kBBP6eG2CKoeXlJjVO59p9VMRReUXkbLp1DP7jG/cuosV68qYgfJOQjLr3xqnIajKK5iVrCP44UOYR0bBaQu/eg5V8PfkjVKqYK7RQKHVgNNGok9mFot/pvP9VmWCU6rRKjycqVdS8fvr6ljZqQ1+LSbW5AvKPFmRvCdLPKYzsk7zRlbd3XtopYnE3M1b2L0IRKBCqcGS0jL24gzIzeM9ZWoNc9r0Xp0pu1dD4L/ZYNAPdjc5XEhwTyrHvNgyVog3+3iwGGDjNM3BkZobaDd0JRSDVyJ7Fx8X1VIEJG3EZ2OCUVdfj4+XpTbYfhPBrB98W09wKxWpaH3o6eX6u+iYsUrXN/8weSlq7ujHlk9cv4H34hN4FRoWgUkbN+kkdlROLt6Io/ZRTvDMzVvRXmPYTSqqroFFWDjW1dQwIyr3xElYqNVYefy47mWnwMUXqbu1YQN7LvusbJiHq9hzmKs06JXR+Pi4FLwE6+YH8yq6IYKJjAE+m/H48VO2bkTfWVpZmubAc9l+mA1cweYkDQ1o2TpUBFLLn40JQc9ZWpRcrMWEDQ3HKl29dx+HrlzVDTmSpB26elXi1uQrtf7hQ6QfO4rUY8dw3URkyJW7d5F+4gTWn6k2kEjSDKwPbeLe52/fQdW16wYvH0nSwStXdFY7edKofMbhRidu3MTJG/zq89W3b7MlpGi8m7YNzeIwBjVjdG3bKIHgeuoHUxvcgIquu3EfH0zOYQTTWhd/6O7aYGBZYxi6cBvMBvITvz+cWWDy7W8MtNQ9zRL81nMpkg8dQUyl3nf7OwzBCNapaIFg426SFJ/PW8dmNgxzTYSi43zsP9Zyo4sI5lfpScXfZ+S22MFRWHKUrVg3LzQTTlt34vB/UyTHrwyDiA5aZbwpgl2TyrGx4iKmBaazeTsJObtNLrEg4v7jJ/DYuR+7LohjtWBB9OKS/6ND9W3hlbsP4LSjEtW3eDddQ6DlFGhidmDSBkzcuNWkgfNrY9u58zJv2H8C+H6wSDCTYNOeLBHbD9YheNUh+MSsY9M25oY2btHFVZ6EQpWBf6dt0Knio+duwmpYOloNoonkYvfmKdx2VsJck41v1zceXP+N5zImwfG5u+GyvVh2/pdAU9Y+jQ5VXrnKnCe0ClBLtdIvBQOCeV904xJMEYhT1XsQs3oHuI7z8MU0dYMWLGFy0R4oItLQJiKVRUXwx4Gy41ew3WiFvJ5Z22ChysSf4smDJM+LQMf/+e1iRnBk4R7kCt2N3xRPf4TT1u3IPcGPEK2qOoqDJqJLfgvIRpPaNtJNErFg5UHk7TjMCH6tt4dupt7N2/dkoaOztpRBoUpHO3U6M/+pMmiuMU1mC808jJv1glp7+iP6Ze+AQpuND5eRtOvzIFLFbxXQPKXnurkzgoO37PkN1SJYubadPcekm/qsCUeOsGNBZfuw+uSpXy1ysjGwBcENjKxuHiY9WVLsP3UNy9YfhKLjXDY563gN3+nvMG4JYjP1kRKEtafPwyIiFUPz+BCZpz8+hUNsGVsMjeYa2/vyHXyqDGX5MZhHZsN5m34qKLXv2VsP4i9DfFlXZ3flGfbNhefsnJB9VO/3fRY0ZjuI5xtKQ8cptGbC2vWM1PDy/dDs48N7g4p3QU37AB80YOJ647yk26bR3HSCo8MgoqMZBNMD5eyqQevONJFrPtLW78X9Bw/R3s4BHw4PNJh7S+RtOnsJV4QZeCcu3EZrmuwtrI/FDVyBdWUXWJ70Sbu1NXVsGX9KSw9M3iTbSSpY2Dqi7tptqNN3gOswD+8M9EHVdXl4rzHoDSbnAqGwuhqF1TXYcKbaAOwYO084K2z54zqcEbY1Z1EkwLt4N4L3lOL6vXuIPVAJ9f5KpsGUZfug3LePOTi6Z61h3isaB9blIaLGKH8xnTSNCZTXNV/9i22wAcFNqWjCoepbeMfej60pNTN4FR4/fsKmfyg6zMXqjfqBg01nL+KjlDWYu72UGVmBKyvBSVZ6p+13YbzUxx85h3eTNyFs/xldu7694jSbo/tSL0/mGh3pnsw+NmU9YQnuNREvTai8fAWJlQf1OGCMSv1xluaQgINIqjyEpIM8dMfp96HDSDx0CAWnTjHHCC0dte7UacQcPMicIOq9FWwcmrpvIaVlmLhuvVHefP6Ul26flaHSsBxiGY3KvkEyltwUZG1wY75oKe49eILPJ0YxCf5o+CKmor/zTWHS9cm3wXj06DELVX1vaQ4UqhSYK5Ox9vRZDA+kT97pySX8e+46nLt9D+2jCtBKk4+20etwmC3A+RR9ZkezmfJDHOOYgfdGH0/W9k9ctLJJy/bnQmOqc9+lWrjtLGZep8iKCpyvr8fqU2fYfszeCuYGNRVKZBry+0gnnj8LnplgAkku9Ufpu3sHjp/H+l1HWOVzHeYgOb8MR67ehIUyFQrlMig0qZi/cy+6Oa3XEStK8dsTspBYeQYWmlxYaPNhrslH7MFqFOw8LMzndcDKogp+Xq6NI7uHckXLXZy/BCi859OUVDx4/ARpR45g9fET2HexlqnfKUWbG+1h/BowOVzY3HWhaLl8vsLnwyF8DZv3+u5gf/b7rb5eqL16C2MKd0OhTIEiYhkmFRXDznGdbvlCsR1+c+wqLC47Dgt1DsOnK7eh7tZdfDQiiGmEN/p6of7eQ4z1TuVfoI7zsX3fCVl5fgtQszMsh4+y3H7+PByLd+HWw0eovnkL0wvW/eazJGRx0Y35oo1x4PgF5s0iCXvpSzdG6IKEjayN5D6fi7HeKbhcfw9/T86GQrMCkzbuRpf5a3XLFzIQwWMEgjV5eCNxA45cvYU5SzLB2fIfd3RR5+F4zWU819WVkdvWdh77KphxeX4rbD/Lj4jRbIneOblsCJOMwwPiuO1v2F0yQbBrswmm/uwfB/qzPilJ1uSADFyouwmrLvPZbzoem1WM0zfv4M/L8jCxcBe6zC9gq+VJSX5zTAYW7z2BV2LXYfel60hbv499gILIfa4Lv9Ic+/YRvTgd5sNuEi0MKi/Pbw2yOYbkN7xs0m8BuRVNBDfDihahTt8OhUCmhY0DlhfswYxAWgCUFgNzQLtuLti45xgO1l2DV3G5nmAJyW+MzoC6/CS2nr+KrXtPwKo7LYPAq/7v/VOhXbWTX5Czw3x2r8xNzx7e80uC1HR0RcPLOf0WYP1gw6hKl2ZLMIG6Lv8SXIcktZZ2TtCu2oF23WjtCQdwNo54uacn9h6uQf2DR7Cj5RAZwfzX0mjt6LfGZKD+4SOm8l/pTd8Y5F+Otl0csThlM56zE9aO7DgPXacomfozLsd/Clo69PlLgydYKsFdiODmGVkiSEKpr8oMIBtHtLVzwRt96WtjPMEkiX8c4IPzdTcRlX+MrVgrlWDnpApcvVEvLDnowF/XyREv9vREmy7O7Ho63qazI/ZVPVsEyG8Debfn14YY0aEfbGihBDM8/RFTAlYKxBB4w4uXRF4aaWs/L45946HDD/p2+O1xq5k/eoJfGktnRgSLJNuI+VHbOw+umlz5vZuB7eWncPvuA9RdvYU7d+/j5Lmr2HOoBtdv3cX64sO4dEW+dCOB+tmby06wjzUfPFXLJsafvXiN9RbO1l7HkdO1OHCMX+WOXl7yYm0rP8k8edvL6bqHuFB3A2cuXMPhU5fYqvKU1/m6GyY/0rGv6jyKSqrYyj+0xBN57u5RHpdvsnH3uqu32Vh4RVXzx+ANukn8cKFro6NJDeHG7bv467BFjAymrg0I5qGwcUDmpv3I3EGLkJIUL8OSrCPYUXEKFp1pbSqBYN31enQYH8ZWyDG+b1OgZQzDVmzDtn2nkJxXgvW7qxCVVcKWI8wo3IfFS4t0NgcZbrvOnWdb8m4U7q5C5Oqd7MvhruoceMduYOPfm0qPY+pCsg2K4RyRxTx/85S52H/sPBurpnt6Reaj4th5ZjDSina00Pj6kmOIyizG0gJ+fWvqI1PkpFjWnO1H4BdfhIj0HXDX5iEuZw8jeemGCripsrGj/CScVDnYspefkdgcyPrBz0owofzoObzQnZYnkhBMKlpEJ0d8OnYJW7rw7fE5aDskDReu1mMw+zqoIOkd5SS/3tcLJ8813/8qBRFCdgJJI1n01HdXpm2GizKTrSU9xnMZTp3nl36gGKr2oUo2lZN+x+WUsC4PSd+2fSeRlFOC5IIyOKryMHdJFiJWbIWDOh8ZReUIXlrEuokT/VNx6twVfOeVhGPVdUhau4993nbH/jOIXVOCWcEZSMgtYVqP1Gb7MJUuIvR87XXm3AlfuQOO6lwsXbsPtVdvY2lBGX4ITGOCkLl5v27x0+bAIKJDdHS0xIo2BJCz9SCe68L3X40lWJTukoPVmK7eBXvfzTh94Spa2YpqXABT03y7+3x3V1a58ns1D7nbD2Ln/tM4eOICRnstx4yQTESu2g4vTQ5btpDWjqYPSFNa6ubMp/BVwVBaVlCK8qqz2F15GtGZOxGUVIiUghLErN6OpXl7mDSSmqbjI90SmeRu3XscKfl7WBOQsGYXUtbtxaLE9dBm7EDmlkpkbamEozKHqWgajJi7cZMuIoVU8dpdR9ln4hcmbmKLoRXuPoLEvD3YW3UeqpU7kL5hL27XN77SkRSGYbOio+OZCeaRXliO5+xocS++L2vcFpPXa03xWSizDyE8batggRsT7ID2X7hi3a6WLd1nDAoKDIgrwL4jNTh06hL2HDyD0sNnmeOE2jW/mDzsP2racKMwYr+YfJytvcHU+9riI0wNUxtbcewc9h6uZlZz2eEaNl5NL65/TC4jalFiIaovXGX3WFd8GKlry9hKemRMkjSL95C6Mkkyj9ZcRunhGvZCXrx8AwtiC3Dx6m3WHJQdrkblifMtCnRkBFNUpaGr8qcRTNiwuwqv9fbSkSWV0H99E8wiNEuPXkGf2TRgIZFa4SX4n/7eKD5gekXY/wg8wzeVfgvo4qIN2+CWdZMawunz19hoEG906dvY1p0dUXvtFu7df4SXegj9ZUElU9qB8+Nw/rJpy/Z3tAxyV2XX5vuimwNSZ+lF5cy4Ik8XT6IjNpUew+GTl9hoEYXftrJ1QJdJStZm/pQ5yL/DEDzBxjFZPyPBIog06jaELt+McT4p2LDrMPZUnsH3fsuhWrkNVWdq/+O8QP8XIFPRbX5CN+kXwX/IoMJPHXj/rcAkOEr39VGRYL4NbiySoSUQLBKj4y3L++cqy/9vYBIsEsx7slxYR53ccdR+MjziQSEzejxmW/35x7o0xunF3wbnJfnq0hrlJb2/eJ1xfrL7PG4ojfA8suNGx4TrWXoT5/TnjZ5FvK9kawx6PvaMIp4IMEj3VH/8yRMW7sOuE/b543wa/W9DiGkJJ27eNCSYnPvt7FzQrrMjLAldCE5o11mEox62Dvx5XVontKPruzizfQY72qdjdE44xqDPR7dvlMa4DGI+uvPGsDO6j52kDLp9ceuiKxs7RvudJeVj5/gt5cunE485wbKrMyy/cIVldzdY9nCD5ZduaNfbA5b9vNCuvycs7b1hOdAbloO9YTnEG5Zf+6DdCD+0G+UPy9ELYDluISzHB8DyuwBYTlwEy0mL0G5KICxnBKHdrCBY/hAMyznBsJwXAkvHxWjnvBjt3EJh6REKS79wWC6MgGVABCyDVbBcooZluAaWmkj26aJ2Wg3aRRK0eC5Ki9aRGokni4XCOsCM+YXnM7DfgguR/ZZC55zguzlm9JUxAWKfVuwiseuF32L+dJ14H909jAcdTPioDdLSMRa7JbmnDX8Pg2t0+TjCTHCd8sfF9FKPmmH5xTRsAIS25H2juqLRrq4u4Lq5gOvhBq6XO7g+HjDrS3CHWX8PmA30gtlgb5gN9YHZMB9wI33BfeMHbrQfuLH+4MYvADdhAbiJC8FNCQA3bRG4GYvAzQoE90MQuHnB4ByCwTmHgHNbDM4rFJxvKDj/MHAB4eACI8AtoeUwhI+BaiTQqtE6SitpgwWCGQycD0aV3XEei796rRc/y8CwYgw9V7wfWnJe55vm76F7aQyu11eynkS6TiRSmj99IcURf/jSHX8dFqgLI9KlEUal9C+NtIwS6EiXl8HAp07kUjgR1RWNVRPBX7iC+1JP8OsjFuCPoxeBG+AJzt4T3GAvcEN9wBHBI3zBjTJF8AJwkxeCmxYgITgQ3LwgPcHuPMEK3zBwfmHgFvIEKxYr2SoAjGCtAI1KIFhqZHUWHshAYvQPT28yBaEPc1sGm+8j0HNWDL6cEcWn11WC+OUw4wqTnBdBxwwq3glm0nMSSbPs5soH+YnHJNvPJ4Sj/5xodPhOiREuibD8ws2IJON9KSTlMfUCiZCQTKqZCFbYuUBB0tudCHYH18sNvZxi0d0hCt2c4zHAeykUg7zADfEC97U3j+E+4Eb5Sgj25wn+XiB46kJw0wPAzQ4ENycIZozgIAMJZgSTBBPBQeGMYC5cIFgnwQLB0VIJNnb8i2+v5CHtJqtYG8TZOrMhwD8P8mYzGqSV1Ire8E6O/IA97Yvn6NtFBErT2RHmNg54riuF6IgvkvhtI2MSHPDx6BBhYMKwst/s7w3rMWHMYWLRxRWtu7qh16xog7K37uLMPlSlf3GEKJFODqznwJeNPpDhxKJaWBmlL7junry2+HjMEnCdnaHoQgS7QkGEf+mGf30fij+OCgLXxx2cvRdeHuWPDnO14AZ7gvvKE61G+aPdmAUCwb46glt/5w/ue39eRU9dAG7mIrSbGwxubhC4+UEwcwwC5xIsSPASHcEKkeAlSraGF1ueSiDWNMEyCZZKkSPa2Dmjw/dKvDt4AeaFZcMzqgBW3VzRdYoaCmFMl0iYtTgT7w0LwlcO8Xi1jxf+NjoM/xhFH6/wwx+HLGJTTwbOicQrAxbAWZMPm++V+N9Bfnh7UADeGRygJ1kipR+PDmbaw5jgzpPUrJlwiFjDBhLe7OeFf40KxB96eQmEOGDKonR0nxGF94f64+OxEaxsFGr0l+FB+H5BOiYFZOK9r/zwSm8vTAlchQ9GBKHjd+F496uFRuTSi+DECKbn5SXYTSDYFZ1nasH1dAXXzxNcf1LPHrCZr4VisAeT3o/mauCVVoQPZi3B/84IwVtzIvCxdxyc0tbhI+dw/NkzEu+6q/GGUyjGJ2fjfz3C8Y6fFq/5afCyn8qQ4AXhrA1WBEXoCGYrCWpUUIgEa1TMyJITbAA9wR+PXoy2ds5wUuexCAZCj5lR+PjbELS1o8+hO+Hv3wTDO64I4z0T4Be/Ht+4L4VqxVY4h66Gb+w6TF+UBv+YfASnbMLr/X3Rc6YGNpNVUKVvR0BsAZwjsg3uKVaw9egQ3t0pIZg0yGdjl+D5np5s6C4xZze8otfBorMTPhsXxspvbusI+/kJ6DErBhN9khAUnw9nVTbCUzdhYfx6eEfm44fglXCNWI2o1TsxKzAN/xodAjdNDr51T2D3kGonY4LNv3CDooc7XrT3xgfjlmBsQBo+nx2JTvMiMTYkDW+M9sefpoTx6nmoG2ZEr4ZH2gZMiFyN+M174bWqCP65OzBjWS6W76qAR942vO60BN55W/BtYjrGLM9GN80yjM0oAOexBJwnGVlhUDCCw+QE02qCArk8wZKQHQMjS0qwIEmfjlsCha0TvvPnv/hFBJMkvPClB96jt93WGd1nxuAb1zhM9l+GEZ6pmBqQBi9NLgbPj2cRCRN8lmKIQwLC07bgpV4emBO6BnMXr4anNg+DHBJgPyca731FUmxE8JgQiQTzqpIMK4rl+utQP8Rk7cZ7w0OQlF/KKp/Kylv38zDeZxmmBmdh2sI0jHaNxXDXJEwLzMAYjySM9UjC1IVprJyjvVLgplyDN+39MGfxKozzTeW/CC4hVySYLGgmwURwdzdYT1LCorcn9lSdw8qN5cgsPoTjNN491Bf/nqcFN9QT3FB3DFuyAh4rizApNgt+GYXoFZAAn5xt6B26DHNT8/HlkiRYzgnE2JQ8TFxZgM9D42EfuwL941cKBC8B5yNI8KJwKILDYb4kgq0ApCOYkaxkaIBgUZKNK5kiKOfh5d5e7PtA2/adYAF3VPEfjw7l22VbGkCYB3NxvzN9Is6BSQJNc1FQxXRxgbkQpGdOH4GiYICOc6Do7MKukUkwaY8xkjZYKM97Qxfild7eeHOAL/YdPQcHZS7CUrdAYUsv42LhxZwvlMMF5pQ/lYV+d5gLxedz2PMQiRSLLYYA03NQWVl8toH08jYFT7CLQLAruO5u+HxyBNr180RK4T4Ep22CMmsb0rcfxAvfBODj6fTpIC/WRVJ84wfzb3zQPzAJb81aDMV3C2H+nR8UkxdCMX0RFFN8wU1bAMWsAJg7LYHCMQSK+QHgXAUrmggWVLTCmGCp9NLni9REsIGKbkCChe3HRDAR12kevvNbjs9ISmycYGEznyeYRodsHaDown9MUdf9Ed9+m/lQdHZiarP1F2IbyUujQTtnimDRyJK0y38ZuhAv9/JiZBw8eZFFYwx1SWbW9mfjw3TGEnuBqPvEJJAk0pEnWGds8XOe6KWzoK+SsZdM0jWjrSC9BGspwcyKdsNnkyPwz7EBLLiuqPwUispPsGABO5dofDI7Atwwb57gEV7gRnkyA8t8rC8UE/xhMcEH5hN9YTYjENwMsqIXwPyHheDmBPAWtEuInOCF4VAEhoMLJiMrglfR9OExI4LbRGnYMlFm9x8+QnsqrDHBki4TDftRMDuFrZAq7DwtEuN9U/CHL93wl68DWRr7edGYH5aFtwcvRPcpEfhqfjT+Z6A/XunjDauuDrD5LhSfT9Ri9pIc/A+bgmrUzxQJlIIZWUYS3MkRL/V0x7tfBTCJDFm+BXfvPcRLvbyYBDOChXZ6iEMMhsyPxesD/PFqL3e8NcAHH41azJag+OtXvnj5Sze8be8HV2U2Jvim4VWaxWhQLj251D2yHhvKCObI4qYY8O6u+HhiGNr2ccHYxat5++TpU0yOzIXVME98Ok8D7msv2Lpo0M0vHm9PXYSXpwXiM984fB+9GiOUy/FZ8FK87RWFV+YF4SW3CIQUFeMjPxVe8QrHh2GJeClAizcDtfhTcCReD1ThHXU8Xg2PwvMRWihCqZskfGmOESsQrFGhfTS/2p4Zvf2sHTUmWOc4cGDt7TuD/FjYyLnLN1BWdQ5jfVfgn98E47lu9CFjRwx3TYRvTD7CU7dgQeJGzF68Ct6ROQhbvgUv9/VFj5laDHFZBt/ofNYO8zMIhUpkfVI5uSLBrA2WvAik+v89dgmT2C6Twlh4DJFt0cWZfd5VlL7JASvZLAmadTEvLAtTA9PZWh/0onpH5mFeaBY8IwsQklSIWQHLMYLmIRtrFqkECwTzEswT/OpgX7w7Pgxt7L0QkrEFypxiPD/KH29MDMV7M5SM4F5+CYgpLIFHehGcUtfBN2sz3NILMS15DRat3Qn//K1Qb9mDlz1V6Klailmr1yNkawncCzZh4eZizFqzDgGbdsBz43ZMW1uEuIoD6J6WAUUYERzBf+hEkFyR4PeXJbNIUTP6z35urEnvFQ9HtO3qgg4TwhmhrpHrMMZrKWvbbL9X8k4IW2d85ZIMx9AMuKlzMdYvA5MCMjAnJANjvJdD0dkVPtHrMMJ9Kb5xS8bc0GzmfZISqatYKcFSFa1Ly6frPFHJJLa1nStTz3TsH6OC8FJv+ngkn7bHzGgMmqPFBN9UJGSXsBkSfxsegJ6zo/FDSCbmhuVgTtAKzAlZhelBGeg2jT4oLd5D0owwgoV+sJ0rFF3FfrArFF+6wnZ2JLg+1E1yAzfIE9wgd9g5RcH8a19ww3xh5xWHbh7RmJWYj1lJ+Zi/NA+zl6/DEPUKOKStxQ+p+RizLJe5J7url2F+3mZMX7UWfRJWwim3CNPXrMP4rHX4KiMX47Py4blxG2xS06EIJRVNRpbw6UC1EgpmZKkwOD+PxX6ZkVUcvJRmB/J+ZWNyxQfsNTuaqWnWTbBxwJ8GeuOjkcG6iqAY51Z2bqxdJgmjL2i2IqNKMKBad+HbbPrdirxBOgk2rlCJZNs4spfKFMHvDPJnfWyqeCK6VTd39JwpxHoJ19PLxwy/zq4seoQZWjZOMKdy2ZKhR1/s5rtUrKxCOy176cg4kxpZEoLJ0fHpVDVeHeYHswEejOAXR/qgk2MM76Yc7gvzkb6wGO0Pi7ELYDEhABYTFsBiWjDMJ/rDYrI/LGYsgvnsIObgMHdYDAunEJg7BsHcbTEs3BfDwjscFn4RUPiFwmJRBCwCycBSMhVtQLBgQRPBi8v5lXEZwUdOX+KnoUiJlRJs44TWdvyHkalfajdVjR7TtTxJohozJkkHaYVJKs1AFYsGlvzaV/p4MmPKOB8iz26KBl9O1+Kf3wRhpFsyrMhVaXw/mUYSwIiTpjW2CSTlEAim/ju1v6KKVvRwg6KnOxS93THIeyk6zdXi87lqDFm4HIoh1P8lP7Qvb2R96w9uDMGP90N/vxDcJGGggVyUMxfxPui5gbyB5RTMG1lkYFE3yTuU90OLTo7F1A82kmCBYHONfrFzRjC1wz1mkHqSkCoSwGYn8BVMb/p7QwPwRn9fvX+YSYqUTDkZ0rxkxxqqVOM82DX8Od29bR3xSm8PfDBsEd+1keUn3qcBgnUwdUxvQYvdPua160K+aGdmRTOChcEGRV93/HFcEP40PgjcQPJDiwTTQIPgh/7WF2ZjfMGN8+N90MYEz14Ebk4guPmBMHOkgYZg3g/twXuy9AMN4eBCBIJZP1hPsEKrQq+cLF1oLiOYsKvyjLCCDl/RFCRHD822Rg8uc/4bVKYReVRxDbhA9deKLwm/ryNSqFz+mKl7CaNG4n2M0+iOG0I3EqZLZ4J4kVgducJIkkAw19VZUNGubLCB+aH7e/CjSETwYG8ohnrLCGa+aCL4O4HgqUTwIiOCg8CRH5oIpm6SSLDQTSJHB99NCtc7OoQuEjk4dl3ST43REUwISi4S2iEjgnWESCVIUvFS4nSVL6ngBgkW85NoAelx5jSR9Fml9zPOVwJd+aRpDWCirJLjrDziyyUMlBDBPNk8yUQwGy6kEOCeRLAbuH402EBGlijBcoLNdAT7N0JwIDidBEsJDjUiOILvJgmODvNINRaWGi4JaUAwWdSJuaVsXej2X7jAqpsLrGjbbDjz6EZb4Vg3J1h1FUDHRUjyp9kMVt1dYUVbybXtu7sxsOPstytfLnatM6y6OvJg92ykvOJxdm8nfTm7S9MI5RN/96AyCffs4cb/ZlsXWH3pAquerrDq7Qarvm6w6u8BS3sPWA7yhNVQb1h97QPL4b6wGukLq2/8YDXGH1bj/GE13h9W3y2A5cSFsJoSAKtpi2A1KwhWc4JhNS8EVvNDYOUYAivnEFi5LYGV+xJYeYfByjccVn7hsKKIjkAVrELUsArVwCpCAyu1Fu2jovBR6nIkHD4sWwDGgGAR1GGXxiDJwcdmGccpGR8zDfm1YixUw2mMfzcHpq6RHjPeN5W+IRhf+wQPxGNi/JYkHssQj00cMwGjOCsRD4z2xd8NhR+bJLg5MB012TR+UqRkM8Jpf1L+z4Bf637PUteEZyb4d5jCr0N2S/D/AEE47445Lw9yAAAAAElFTkSuQmCC";
    // ===== TOP BANNER (Dark Blue Panel) =====
    doc.setFillColor(26, 27, 84);
    doc.rect(0, 0, 210, 40, "F");
    // ===== ACCENT PANEL (Black Diagonal Bar) =====
    doc.setFillColor(0, 0, 0);
    doc.rect(150, 40, 60, 15, "F");
    doc.triangle(130, 40, 150, 40, 150, 55, "F");
    // ===== LOGO IN CIRCLE =====
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 20, 11, "F");
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", 16, 11, 18, 18);
    } else {
      doc.setTextColor(26, 27, 84);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("GJB", 25, 21.5, { align: "center" });
    }

    // ===== HEADER CONTACT INFO =====
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("inquire@gjbhospital.com", 45, 18);
    doc.text("+91 9080128109 | gjbhospital.com", 45, 24);

    // ===== TITLE =====
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Hospital Medical Billing Invoice", 105, 72, { align: "center" });

    // ===== INVOICE & DATE DETAILS =====
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Number:", 135, 88);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceNo, 190, 88, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Date:", 135, 94);
    doc.setFont("helvetica", "normal");
    doc.text(today, 190, 94, { align: "right" });

    // ===== PATIENT DETAILS =====
    const age = parseInt(lastBill.p.age) || 30;
    const birthYear = new Date().getFullYear() - age;
    const dob = `05/12/${birthYear}`;

    doc.setFont("helvetica", "bold");
    doc.text("Name:", 20, 88);
    doc.setFont("helvetica", "normal");
    doc.text(lastBill.p.name, 48, 88);

    doc.setFont("helvetica", "bold");
    doc.text("Date of Birth:", 20, 94);
    doc.setFont("helvetica", "normal");
    doc.text(dob, 48, 94);

    doc.setFont("helvetica", "bold");
    doc.text("Patient ID:", 20, 100);
    doc.setFont("helvetica", "normal");
    doc.text(lastBill.p.id.toString(), 48, 100);

    // ===== BILL TABLE =====
    const subTotal = lastBill.total / 1.05;
    const cgst = subTotal * 0.025;
    const sgst = subTotal * 0.025;

    // Header background
    doc.setFillColor(241, 245, 249);
    doc.rect(20, 115, 170, 8, "F");

    // Header border
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 115, 170, 8, "S");
    doc.line(100, 115, 100, 123);
    doc.line(145, 115, 145, 123);

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("Service Description", 60, 120, { align: "center" });
    doc.text("Date", 122.5, 120, { align: "center" });
    doc.text("Cost (Rs.)", 167.5, 120, { align: "center" });

    const rowHeight = 8;
    const startY = 123;
    const lineItems = [
      { desc: "Treatment Charges", date: today, cost: "Rs. " + subTotal.toFixed(2) },
      { desc: "CGST (2.5%)", date: today, cost: "Rs. " + cgst.toFixed(2) },
      { desc: "SGST (2.5%)", date: today, cost: "Rs. " + sgst.toFixed(2) },
      { desc: "", date: "", cost: "" }
    ];

    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);

    lineItems.forEach((item, index) => {
      const y = startY + index * rowHeight;

      // Draw row box
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, y, 170, rowHeight, "S");

      // Column dividers
      doc.line(100, y, 100, y + rowHeight);
      doc.line(145, y, 145, y + rowHeight);

      // Text
      if (item.desc) {
        doc.text(item.desc, 22, y + 5.5);
        doc.text(item.date, 122.5, y + 5.5, { align: "center" });
        doc.text(item.cost, 188, y + 5.5, { align: "right" });
      }
    });

    // ===== TOTAL AMOUNT =====
    const endTableY = startY + lineItems.length * rowHeight;
    const totalY = endTableY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Amount : ", 20, totalY);
    const labelWidth = doc.getTextWidth("Total Amount : ");
    const valStr = "Rs. " + lastBill.total.toFixed(2);
    doc.text(valStr, 20 + labelWidth, totalY);

    // Underline amount
    const valWidth = doc.getTextWidth(valStr);
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(20 + labelWidth, totalY + 1.5, 20 + labelWidth + valWidth, totalY + 1.5);

    // ===== PAYMENT INSTRUCTIONS =====
    const instructY = totalY + 15;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toLocaleDateString();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Payment Instructions:", 20, instructY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    const instructionText = `Please make payment by ${dueDateStr} via online portal, check, or credit card. For inquiries, contact us at +91 9080128109. Thank you!`;

    const wrappedLines = doc.splitTextToSize(instructionText, 170);
    doc.text(wrappedLines, 20, instructY + 7);

    // ===== FOOTER SECTION =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.text("GJB Hospital @ gjbhospital.com", 105, 255, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text("GOKUL S  ||  CSE B  ||  2117240020107", 105, 280, { align: "center" });

    // ===== DOWNLOAD =====
    doc.save("Hospital_Invoice.pdf");
  } catch (err) {
    console.error("PDF generation failed:", err);
    await showAlert("PDF generation failed: " + err.message + "\n" + err.stack, "Error");
  }
}

function searchPatients() {
  const value = document.getElementById("searchPatient").value.toLowerCase();
  const rows = document.querySelectorAll("#dashTable tr");

  rows.forEach((row, index) => {
    if (index === 0) return; // skip table header
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
}

async function logout() {
  const confirmed = await showConfirm("Are you sure you want to logout?");
  if (!confirmed) return;
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
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

/* ---------- PATIENT & DOCTOR SEARCH ---------- */
function searchPatientsListFunc() {
  const searchInput = document.getElementById("searchPatientsList");
  if (!searchInput) return;
  const value = searchInput.value.toLowerCase();
  const rows = document.querySelectorAll("#pt tr");

  rows.forEach((row, index) => {
    if (index === 0) return; // skip table header
    row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
  });
}

function searchDoctorsListFunc() {
  const searchInput = document.getElementById("searchDoctorsList");
  if (!searchInput) return;
  const value = searchInput.value.toLowerCase();
  const rows = document.querySelectorAll("#dt tr");

  rows.forEach((row, index) => {
    if (index === 0) return; // skip table header
    row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
  });
}

/* ---------- APPOINTMENT MODULE ---------- */
function syncAppointments() {
  // Omit since we save to db
}

function populateDoctorDropdowns() {
  const select = document.getElementById("apptDoctor");
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Select Doctor --</option>';
  doctors.forEach(d => {
    select.innerHTML += `<option value="${d.id}">${d.name} (${d.spec})</option>`;
  });
  if (currentVal) select.value = currentVal;
}

async function bookAppointment() {
  const nameInput = document.getElementById("apptPatientName");
  const doctorSelect = document.getElementById("apptDoctor");
  const dateInput = document.getElementById("apptDate");
  const timeInput = document.getElementById("apptTime");

  let patientName = nameInput.value.trim();
  let doctorIdVal = doctorSelect.value ? parseInt(doctorSelect.value) : null;
  let apptDateVal = dateInput.value;
  let apptTimeVal = timeInput.value;

  if (!patientName) {
    await showAlert("Please enter a patient name.");
    return;
  }
  if (!doctorIdVal) {
    await showAlert("Please select a doctor.");
    return;
  }
  if (!apptDateVal || !apptTimeVal) {
    await showAlert("Please select both date and time.");
    return;
  }

  try {
    const res = await fetch(API_BASE + "/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: patientName,
        doctor_id: doctorIdVal,
        date: apptDateVal,
        time: apptTimeVal
      })
    });
    const newAppt = await res.json();

    // Clear fields
    nameInput.value = "";
    doctorSelect.value = "";
    dateInput.value = "";
    timeInput.value = "";

    // Reset filters to ensure the new appointment is displayed immediately
    singleApptViewId = null;
    const filterStatus = document.getElementById("filterApptStatus");
    if (filterStatus) {
      filterStatus.value = "All";
    }

    await fetchAllData();
    await showAlert("Appointment booked successfully! ID: " + newAppt.id);
  } catch (err) {
    console.error(err);
    await showAlert("Failed to book appointment");
  }
}

async function viewSingleAppointment() {
  const searchInputVal = document.getElementById("searchApptInput").value.trim();
  if (!searchInputVal) {
    await showAlert("Please enter an Appointment ID.");
    return;
  }
  const idNum = parseInt(searchInputVal);
  const found = appointments.find(a => a.id === idNum);
  if (found) {
    singleApptViewId = idNum;
    renderAppointments();
  } else {
    await showAlert("Appointment ID " + searchInputVal + " not found.");
  }
}

function viewAllAppointments() {
  singleApptViewId = null;
  document.getElementById("searchApptInput").value = "";
  document.getElementById("filterApptStatus").value = "All";
  renderAppointments();
}

function renderAppointments() {
  const table = document.getElementById("apptTable");
  if (!table) return;

  const statusFilter = document.getElementById("filterApptStatus").value;

  table.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Patient</th>
      <th>Date & Time</th>
      <th>Doctor</th>
      <th>Status</th>
      <th>Actions</th>
      <th>Remove</th>
    </tr>
  `;

  let filtered = appointments;

  if (singleApptViewId !== null) {
    filtered = appointments.filter(a => a.id === singleApptViewId);
  } else {
    if (statusFilter !== "All") {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
  }

  if (filtered.length === 0) {
    table.innerHTML += `<tr><td colspan="6" style="text-align:center;">No appointments found.</td></tr>`;
    return;
  }

  filtered.forEach(a => {
    // Generate inline dropdown for doctor assignment
    let doctorSelectHtml = `<select onchange="assignDoctor(${a.id}, this.value)">`;
    doctors.forEach(d => {
      const selected = d.id === a.doctorId ? "selected" : "";
      doctorSelectHtml += `<option value="${d.id}" ${selected}>${d.name}</option>`;
    });
    doctorSelectHtml += `</select>`;

    let approveBtn = "";
    let cancelBtn = "";
    let completeBtn = "";

    if (a.status === "Pending") {
      approveBtn = `<button onclick="approveAppointment(${a.id})" class="badge on" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;">Approve</button>`;
    }
    if (a.status !== "Cancelled" && a.status !== "Completed") {
      cancelBtn = `<button onclick="cancelAppointment(${a.id})" class="badge off" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;">Cancel</button>`;
      if (a.status === "Confirmed") {
        completeBtn = `<button onclick="completeAppointment(${a.id})" style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 4px 8px; font-size: 11px; border-radius: 20px;">Complete</button>`;
      }
    }

    let statusColorClass = "";
    if (a.status === "Pending") statusColorClass = "status-pending";
    else if (a.status === "Confirmed") statusColorClass = "status-confirmed";
    else if (a.status === "Completed") statusColorClass = "status-completed";
    else if (a.status === "Cancelled") statusColorClass = "status-cancelled";

    table.innerHTML += `
      <tr>
        <td>${a.id}</td>
        <td style="text-align: left;">${a.patientName} ${a.patientId ? `<small style="color: #6b7280; display:block;">ID: ${a.patientId}</small>` : ''}</td>
        <td>${a.date} <br> <small>${a.time}</small></td>
        <td>${doctorSelectHtml}</td>
        <td><span class="status-badge ${statusColorClass}">${a.status}</span></td>
        <td>
          ${approveBtn}
          ${cancelBtn}
          ${completeBtn}
        </td>
        <td>
          <button onclick="removeAppointment(${a.id})" class="badge off" style="padding: 4px 8px; font-size: 11px; cursor: pointer;">Remove</button>
        </td>
      </tr>
    `;
  });
}

async function updateAppointmentField(id, body) {
  try {
    const res = await fetch(API_BASE + `/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
    }
  } catch (err) {
    console.error(err);
    await showAlert("Failed to update appointment");
  }
}

async function approveAppointment(id) {
  await updateAppointmentField(id, { status: "Confirmed" });
}

async function cancelAppointment(id) {
  await updateAppointmentField(id, { status: "Cancelled" });
}

async function completeAppointment(id) {
  await updateAppointmentField(id, { status: "Completed" });
}

async function assignDoctor(apptId, newDocId) {
  await updateAppointmentField(apptId, { doctor_id: parseInt(newDocId) });
}

async function removeAppointment(id) {
  const confirmed = await showConfirm("Are you sure you want to remove this appointment?");
  if (confirmed) {
    try {
      const res = await fetch(API_BASE + `/api/appointments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
      await showAlert("Failed to remove appointment");
    }
  }
}

function updateDashboardStats() {
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const totalStaff = totalDoctors + 12; // Realistic staff count
  const totalBeds = 50; // Total bed capacity
  const occupiedBeds = totalPatients;
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  // Calculate Emergency Patients: patients with Heart Problem, Bone Fracture, or Asthma
  const emergencyPatients = patients.filter(p =>
    p.disease.toLowerCase().includes("heart") ||
    p.disease.toLowerCase().includes("fracture") ||
    p.disease.toLowerCase().includes("asthma")
  ).length;

  // Calculate Today Appointments
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const todayAppointments = appointments.filter(a => a.date === todayStr).length;

  // Calculate Operations
  const operations = 12;

  // Set DOM values if elements exist
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setVal("statTotalPatients", totalPatients);
  setVal("statTotalDoctors", totalDoctors);
  setVal("statTotalStaff", totalStaff);
  setVal("statAvailableBeds", availableBeds);
  setVal("statOccupiedBeds", occupiedBeds);
  setVal("statEmergencyPatients", emergencyPatients);
  setVal("statTodayAppointments", todayAppointments);
  setVal("statOperations", operations);
}

/* ====================================
   SMART ASSISTANT CLINICAL ENGINE
   ==================================== */

async function analyzeSymptoms() {
  const name = document.getElementById("assistantName").value.trim();
  const age = document.getElementById("assistantAge").value.trim();
  const gender = document.getElementById("assistantGender").value;
  const phone = document.getElementById("assistantPhone").value.trim();
  const symptomsText = document.getElementById("assistantSymptoms").value.trim();
  const duration = document.getElementById("assistantDuration").value.trim();
  const medHistory = document.getElementById("assistantMedHistory").value;
  const allergies = document.getElementById("assistantAllergies").value;

  if (!name || !age || !gender || !phone || !symptomsText || !duration) {
    await showAlert("Please fill in all the required fields including Name, Age, Gender, Phone, Symptoms, and Duration.");
    return;
  }

  // Disable the form fieldset
  const fieldset = document.getElementById("assistantFields");
  if (fieldset) fieldset.disabled = true;

  // Hide any existing results
  const resultCard = document.getElementById("assistantResultCard");
  resultCard.style.display = "none";

  // Show loader card with transition
  const loader = document.getElementById("assistantLoader");
  loader.style.display = "flex";
  loader.style.opacity = "0";
  // Force reflow
  void loader.offsetWidth;
  loader.style.opacity = "1";

  // Simulate loading delay (randomly between 2s and 3s)
  const delay = Math.floor(Math.random() * 1000) + 2000; // 2000ms - 3000ms

  setTimeout(async () => {
    try {
      const symptoms = symptomsText.toLowerCase();

      // If user types "fail" or "error", trigger simulated failure
      if (symptoms.includes("fail") || symptoms.includes("error")) {
        throw new Error("Simulated AI Model Failure");
      }

      // Default values
      let conditions = [];
      let department = "General Medicine";
      let urgencyText = "Low";
      let urgencyClass = "urgency-low";
      let urgencyEmoji = "ðŸŸ¢";
      let tests = ["General Blood Panel", "Urine Analysis"];

      // Decision Logic
      if (symptoms.includes("chest pain") || symptoms.includes("heart attack") || symptoms.includes("difficulty breathing") || symptoms.includes("shortness of breath") || symptoms.includes("unconscious") || symptoms.includes("heavy bleeding") || symptoms.includes("poison") || symptoms.includes("stroke")) {
        urgencyText = "Critical";
        urgencyClass = "urgency-critical";
        urgencyEmoji = "ðŸ”´";

        if (symptoms.includes("chest pain") || symptoms.includes("heart")) {
          department = "Cardiology";
          conditions = ["Myocardial Infarction", "Angina Pectoris", "Arrhythmia"];
          tests = ["Electrocardiogram (ECG)", "Troponin Blood Test", "Chest X-Ray"];
        } else if (symptoms.includes("stroke") || symptoms.includes("numbness") || symptoms.includes("paralysis")) {
          department = "Neurology";
          conditions = ["Acute Stroke", "Transient Ischemic Attack"];
          tests = ["CT Scan of Brain", "MRI Brain", "Carotid Ultrasound"];
        } else {
          department = "Emergency";
          conditions = ["Respiratory Distress", "Acute Shock", "Severe Trauma"];
          tests = ["Arterial Blood Gas (ABG)", "Rapid Ultrasound", "Vitals Monitoring"];
        }
      }
      else if (symptoms.includes("headache") || symptoms.includes("seizure") || symptoms.includes("dizzy") || symptoms.includes("numb") || symptoms.includes("confusion")) {
        urgencyText = "High";
        urgencyClass = "urgency-high";
        urgencyEmoji = "ðŸŸ ";
        department = "Neurology";
        conditions = ["Migraine", "Epilepsy", "Tension Headache"];
        tests = ["Electroencephalogram (EEG)", "MRI Brain", "Basic Metabolic Panel"];
      }
      else if (symptoms.includes("fracture") || symptoms.includes("bone") || symptoms.includes("joint") || symptoms.includes("back pain") || symptoms.includes("knee") || symptoms.includes("sprain") || symptoms.includes("fall")) {
        urgencyText = "High";
        urgencyClass = "urgency-high";
        urgencyEmoji = "ðŸŸ ";
        department = "Orthopedics";
        conditions = ["Bone Fracture", "Ligament Sprain", "Osteoarthritis"];
        tests = ["X-Ray", "MRI of affected joint", "CT Scan (Bone detail)"];
      }
      else if (symptoms.includes("rash") || symptoms.includes("itch") || symptoms.includes("skin") || symptoms.includes("hives") || symptoms.includes("redness") || symptoms.includes("burn")) {
        urgencyText = symptoms.includes("burn") ? "High" : "Medium";
        urgencyClass = symptoms.includes("burn") ? "urgency-high" : "urgency-medium";
        urgencyEmoji = symptoms.includes("burn") ? "ðŸŸ " : "ðŸŸ¡";
        department = "Dermatology";
        conditions = ["Contact Dermatitis", "Urticaria (Hives)", "Eczema"];
        tests = ["Allergy Patch Test", "Skin Biopsy", "Complete Blood Count (CBC)"];
      }
      else if (symptoms.includes("ear") || symptoms.includes("nose") || symptoms.includes("throat") || symptoms.includes("hearing") || symptoms.includes("sinus") || symptoms.includes("tonsil")) {
        urgencyText = "Medium";
        urgencyClass = "urgency-medium";
        urgencyEmoji = "ðŸŸ¡";
        department = "ENT";
        conditions = ["Sinusitis", "Otitis Media (Ear Infection)", "Acute Tonsillitis"];
        tests = ["Otoscopy", "Nasal Endoscopy", "Throat Culture swab"];
      }
      else if (symptoms.includes("stomach") || symptoms.includes("abdominal") || symptoms.includes("vomit") || symptoms.includes("nausea") || symptoms.includes("diarrhea")) {
        urgencyText = "Medium";
        urgencyClass = "urgency-medium";
        urgencyEmoji = "ðŸŸ¡";
        department = "General Medicine";
        conditions = ["Gastroenteritis", "Food Poisoning", "Acid Reflux"];
        tests = ["Abdominal Ultrasound", "Stool Test", "Complete Blood Count (CBC)"];
      }
      else if (symptoms.includes("fever") || symptoms.includes("cough") || symptoms.includes("flu") || symptoms.includes("cold") || symptoms.includes("body ache") || symptoms.includes("chills")) {
        urgencyText = "Medium";
        urgencyClass = "urgency-medium";
        urgencyEmoji = "ðŸŸ¡";

        // Check age for pediatrics override
        const ageVal = parseInt(age);
        if (ageVal <= 12) {
          department = "Pediatrics";
          conditions = ["Pediatric Viral Fever", "Influenza", "Dengue"];
          tests = ["Complete Blood Count (CBC)", "Dengue NS1 Antigen", "Urine Routine"];
        } else {
          department = "General Medicine";
          conditions = ["Viral Fever", "Influenza", "Dengue"];
          tests = ["Complete Blood Count (CBC)", "Dengue NS1 Antigen Test", "Flu Swab Test"];
        }
      }
      else {
        const ageVal = parseInt(age);
        if (ageVal <= 12) {
          department = "Pediatrics";
          conditions = ["Common Pediatric Infection", "Fatigue"];
        } else {
          department = "General Medicine";
          conditions = ["Common Viral Infection", "Fatigue", "Mild Inflammation"];
        }
      }

      // Adjust urgency if allergies or medical history are present
      if (medHistory === "yes" || allergies === "yes") {
        if (urgencyText === "Low") {
          urgencyText = "Medium";
          urgencyClass = "urgency-medium";
          urgencyEmoji = "ðŸŸ¡";
        } else if (urgencyText === "Medium") {
          urgencyText = "High";
          urgencyClass = "urgency-high";
          urgencyEmoji = "ðŸŸ ";
        }
      }

      // Populate Result Card
      const conditionsUl = document.getElementById("resConditions");
      conditionsUl.innerHTML = "";
      conditions.forEach(cond => {
        conditionsUl.innerHTML += `<li>${cond}</li>`;
      });

      document.getElementById("resDepartment").innerText = department;

      const resUrgency = document.getElementById("resUrgency");
      resUrgency.innerText = `${urgencyEmoji} ${urgencyText}`;
      resUrgency.className = `urgency-badge ${urgencyClass}`;

      const testsUl = document.getElementById("resTests");
      testsUl.innerHTML = "";
      tests.forEach(test => {
        testsUl.innerHTML += `<li>${test}</li>`;
      });

      // Fade out loader
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
        // Show result card & enable form
        resultCard.style.display = "block";
        if (fieldset) fieldset.disabled = false;
      }, 300);

    } catch (err) {
      // Fade out loader
      loader.style.opacity = "0";
      setTimeout(async () => {
        loader.style.display = "none";
        if (fieldset) fieldset.disabled = false;
        await showAlert("âŒ Unable to analyze symptoms at the moment. Please try again.");
      }, 300);
    }
  }, delay);
}

function clearAssistantForm() {
  document.getElementById("assistantName").value = "";
  document.getElementById("assistantAge").value = "";
  document.getElementById("assistantGender").value = "";
  document.getElementById("assistantPhone").value = "";
  document.getElementById("assistantSymptoms").value = "";
  document.getElementById("assistantMedHistory").value = "no";
  document.getElementById("assistantAllergies").value = "no";
  document.getElementById("assistantDuration").value = "";
  document.getElementById("assistantResultCard").style.display = "none";

  const loader = document.getElementById("assistantLoader");
  loader.style.display = "none";
  loader.style.opacity = "0";

  const fieldset = document.getElementById("assistantFields");
  if (fieldset) fieldset.disabled = false;
}
