require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from the current folder
app.use(express.static(__dirname));

// --- DB INITIALIZATION AND SEEDING ---
const initDb = async () => {
  try {
    // 1. Create Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id VARCHAR(50) PRIMARY KEY,
        password VARCHAR(255),
        role VARCHAR(20)
      )
    `);

    // 2. Create Patients table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Patients (
        patient_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        age INT,
        gender VARCHAR(20) DEFAULT NULL,
        disease VARCHAR(100),
        days INT,
        bed VARCHAR(20)
      )
    `);

    // 3. Create Doctors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Doctors (
        doctor_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        specialization VARCHAR(100),
        status VARCHAR(20)
      )
    `);

    // 4. Create Nurses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Nurses (
        nurse_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        gender VARCHAR(20),
        shift VARCHAR(20),
        status VARCHAR(20)
      )
    `);

    // 5. Create Appointments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Appointments (
        appointment_id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        doctor_id INT,
        date VARCHAR(20),
        time VARCHAR(20),
        status VARCHAR(20)
      )
    `);

    // 6. Create Inventory table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Inventory (
        inventory_id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(100),
        type VARCHAR(50),
        quantity INT
      )
    `);

    // 7. Create Billing table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Billing (
        bill_id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        patient_name VARCHAR(100),
        amount DECIMAL(10, 2),
        payment_mode VARCHAR(50),
        invoice_no VARCHAR(50),
        date VARCHAR(50)
      )
    `);

    // --- SEED DATA IF EMPTY ---
    
    // Seed Users
    const [users] = await db.query("SELECT * FROM Users");
    if (users.length === 0) {
      await db.query("INSERT INTO Users (id, password, role) VALUES ('1001', 'staff123', 'staff'), ('9999', 'admin123', 'admin')");
      console.log("Seeded Users table.");
    }

    // Seed Doctors
    const [docs] = await db.query("SELECT * FROM Doctors");
    if (docs.length === 0) {
      const docNames = ["Arun", "Meena", "Ravi", "Priya", "Karthik", "Suresh", "Nisha", "Kumar", "Divya", "Bala", "Asha", "John", "Paul", "Anita", "Ramesh", "Sneha"];
      const specs = ["Cardiology", "Dermatology", "Neurology", "Orthopedic surgery", "Pediatrics"];
      for (let i = 0; i < docNames.length; i++) {
        await db.query("INSERT INTO Doctors (name, specialization, status) VALUES (?, ?, ?)", [
          "Dr " + docNames[i],
          specs[i % specs.length],
          i < 12 ? 'on' : 'off'
        ]);
      }
      console.log("Seeded Doctors table.");
    }

    // Seed Patients
    const [pats] = await db.query("SELECT * FROM Patients");
    if (pats.length === 0) {
      const patNames = ["Rahul", "Anjali", "Suresh", "Kavya", "Vikram", "Divya", "Arjun", "Meena", "Rohan", "Pooja", "Manoj", "Priyanka", "Amit", "Sneha", "Kiran", "Lakshmi", "Nitin", "Swathi", "Ajay", "Neha"];
      const diseases = ["Fever", "Heart Problem", "Skin Allergy", "Bone Fracture", "Asthma"];
      const randomDays = (d) => {
        d = d.toLowerCase();
        if (d.includes("fever")) return 2 + Math.floor(Math.random() * 2);
        return 4 + Math.floor(Math.random() * 5);
      };
      for (let i = 0; i < patNames.length; i++) {
        let dis = diseases[i % diseases.length];
        await db.query("INSERT INTO Patients (name, age, gender, disease, days, bed) VALUES (?, ?, ?, ?, ?, ?)", [
          patNames[i],
          20 + (i % 40),
          i % 2 === 0 ? "Male" : "Female",
          dis,
          randomDays(dis),
          "B" + (i + 1)
        ]);
      }
      console.log("Seeded Patients table.");
    }

    // Seed Nurses
    const [nurs] = await db.query("SELECT * FROM Nurses");
    if (nurs.length === 0) {
      const nursesList = [
        {name:"Anita",gender:"Female",shift:"Day",status:"true"},
        {name:"Kavya",gender:"Female",shift:"Night",status:"true"},
        {name:"Priya",gender:"Female",shift:"Day",status:"true"},
        {name:"Meena",gender:"Female",shift:"Night",status:"true"},
        {name:"Sangeetha",gender:"Female",shift:"Day",status:"true"},
        {name:"Divya",gender:"Female",shift:"Night",status:"true"},
        {name:"Lakshmi",gender:"Female",shift:"Day",status:"true"},
        {name:"Radha",gender:"Female",shift:"Night",status:"true"},
        {name:"Swathi",gender:"Female",shift:"Day",status:"true"},
        {name:"Pavithra",gender:"Female",shift:"Night",status:"true"},
        {name:"Keerthi",gender:"Female",shift:"Day",status:"true"},
        {name:"Nithya",gender:"Female",shift:"Night",status:"true"},
        {name:"Arun",gender:"Male",shift:"Day",status:"true"},
        {name:"Ravi",gender:"Male",shift:"Night",status:"true"},
        {name:"Karthik",gender:"Male",shift:"Day",status:"true"},
        {name:"Suresh",gender:"Male",shift:"Night",status:"true"},
        {name:"Vijay",gender:"Male",shift:"Day",status:"true"},
        {name:"Manoj",gender:"Male",shift:"Night",status:"true"},
        {name:"Rajesh",gender:"Male",shift:"Day",status:"true"},
        {name:"Santhosh",gender:"Male",shift:"Night",status:"true"},
        {name:"Ajith",gender:"Male",shift:"Day",status:"true"},
        {name:"Prakash",gender:"Male",shift:"Night",status:"true"}
      ];
      // Randomly set 5 to off duty
      const shuffled = [...nursesList].sort(() => 0.5 - Math.random());
      for (let i = 0; i < 5; i++) {
        shuffled[i].status = "false";
      }
      for (const n of nursesList) {
        await db.query("INSERT INTO Nurses (name, gender, shift, status) VALUES (?, ?, ?, ?)", [
          n.name, n.gender, n.shift, n.status
        ]);
      }
      console.log("Seeded Nurses table.");
    }

    // Seed Appointments
    const [appts] = await db.query("SELECT * FROM Appointments");
    if (appts.length === 0) {
      const [[p1]] = await db.query("SELECT patient_id FROM Patients LIMIT 1 OFFSET 0");
      const [[p2]] = await db.query("SELECT patient_id FROM Patients LIMIT 1 OFFSET 1");
      const [[p3]] = await db.query("SELECT patient_id FROM Patients LIMIT 1 OFFSET 2");

      const [[d1]] = await db.query("SELECT doctor_id FROM Doctors LIMIT 1 OFFSET 0");
      const [[d2]] = await db.query("SELECT doctor_id FROM Doctors LIMIT 1 OFFSET 1");
      const [[d3]] = await db.query("SELECT doctor_id FROM Doctors LIMIT 1 OFFSET 2");

      if (p1 && d1) {
        await db.query("INSERT INTO Appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)", [
          p1.patient_id, d1.doctor_id, "2026-06-29", "10:30", "Confirmed"
        ]);
      }
      if (p2 && d2) {
        await db.query("INSERT INTO Appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)", [
          p2.patient_id, d2.doctor_id, "2026-06-29", "11:45", "Pending"
        ]);
      }
      if (p3 && d3) {
        await db.query("INSERT INTO Appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)", [
          p3.patient_id, d3.doctor_id, "2026-06-28", "09:00", "Completed"
        ]);
      }
      console.log("Seeded Appointments table.");
    }

    // Seed Inventory
    const [inv] = await db.query("SELECT * FROM Inventory");
    if (inv.length === 0) {
      const items = [
        {name:"Patient Monitor",        type:"Equipment", qty:150},
        {name:"Ventilator",             type:"Equipment", qty:150},
        {name:"Defibrillator",          type:"Equipment", qty:15},
        {name:"Infusion Pump",          type:"Equipment", qty:15},
        {name:"X-ray Machine",          type:"Equipment", qty:5},
        {name:"ECG Machine",            type:"Equipment", qty:5},
        {name:"Surgical Light",         type:"Equipment", qty:30},
        {name:"Anesthesia Machine",     type:"Equipment", qty:25},
        {name:"Sterilizer",             type:"Equipment", qty:10},
        {name:"Suction Machine",        type:"Equipment", qty:9},
        {name:"Oxygen Cylinder",        type:"Equipment", qty:500},
        {name:"Hospital Stretcher",     type:"Equipment", qty:45},
        {name:"Wheel Chair",            type:"Equipment", qty:40},
        {name:"Blood Pressure Monitor", type:"Equipment", qty:120},
        {name:"Pulse Oximeter",         type:"Equipment", qty:200},
        {name:"Nebulizer",              type:"Equipment", qty:80},
        {name:"IV Stand",               type:"Equipment", qty:300},
        {name:"Crash Cart",             type:"Equipment", qty:12},
        {name:"Paracetamol",            type:"Medicine",  qty:500000},
        {name:"Insulin",                type:"Medicine",  qty:120000},
        {name:"Antibiotics",            type:"Medicine",  qty:300000},
        {name:"Pain Killers",            type:"Medicine",  qty:250000},
        {name:"Aspirin",                type:"Medicine",  qty:180000},
        {name:"Amoxicillin",            type:"Medicine",  qty:200000},
        {name:"Metformin",              type:"Medicine",  qty:150000},
        {name:"Saline (IV Fluids)",     type:"Medicine",  qty:400000},
        {name:"Cough Syrup",             type:"Medicine",  qty:100000},
        {name:"Vitamin Supplements",    type:"Medicine",  qty:220000},
        {name:"Antiseptic Solution",    type:"Medicine",  qty:160000},
        {name:"Ibuprofen",              type:"Medicine",  qty:170000},
        {name:"Cetirizine",             type:"Medicine",  qty:190000},
        {name:"Omeprazole",             type:"Medicine",  qty:140000},
        {name:"Azithromycin",           type:"Medicine",  qty:130000},
        {name:"ORS Powder",              type:"Medicine",  qty:300000}
      ];
      for (const item of items) {
        await db.query("INSERT INTO Inventory (item_name, type, quantity) VALUES (?, ?, ?)", [
          item.name, item.type, item.qty
        ]);
      }
      console.log("Seeded Inventory table.");
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
};

initDb();

// --- API ENDPOINTS --- //


// 1. Auth Endpoint
app.post("/api/login", async (req, res) => {
  const { id, password, role } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM Users WHERE id = ? AND password = ? AND role = ?", [id, password, role]);
    if (rows.length > 0) {
      res.json({ success: true, user: { id: rows[0].id, role: rows[0].role } });
    } else {
      res.json({ success: false, message: "Invalid ID or Password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Patients Endpoints
app.get("/api/patients", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Patients");
    // Map to front-end schema
    const mapped = rows.map(p => ({
      id: p.patient_id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      disease: p.disease,
      days: p.days,
      bed: p.bed
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/patients", async (req, res) => {
  const { name, age, disease, gender } = req.body;
  
  const randomDays = (d) => {
    d = d.toLowerCase();
    if (d.includes("fever")) return 2 + Math.floor(Math.random() * 2);
    return 4 + Math.floor(Math.random() * 5);
  };

  const days = randomDays(disease);
  
  try {
    // Determine the next bed number
    const [activePatients] = await db.query("SELECT bed FROM Patients");
    const activeBeds = activePatients.map(p => parseInt(p.bed.replace("B", ""))).filter(n => !isNaN(n));
    const nextBedNo = activeBeds.length ? Math.max(...activeBeds) + 1 : 1;
    const bed = "B" + nextBedNo;

    const [result] = await db.query(
      "INSERT INTO Patients (name, age, gender, disease, days, bed) VALUES (?, ?, ?, ?, ?, ?)",
      [name, age, gender || "Other", disease, days, bed]
    );
    res.json({ id: result.insertId, name, age, gender, disease, days, bed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Patients WHERE patient_id = ?", [id]);
    await db.query("DELETE FROM Appointments WHERE patient_id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Doctors Endpoints
app.get("/api/doctors", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Doctors");
    const mapped = rows.map(d => ({
      id: d.doctor_id,
      name: d.name,
      spec: d.specialization,
      on: d.status === "on"
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/doctors", async (req, res) => {
  const { name, spec, status } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO Doctors (name, specialization, status) VALUES (?, ?, ?)",
      ["Dr " + name, spec, status]
    );
    res.json({ id: result.insertId, name: "Dr " + name, spec, on: status === "on" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Nurses Endpoints
app.get("/api/nurses", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Nurses");
    const mapped = rows.map(n => ({
      id: n.nurse_id,
      name: n.name,
      gender: n.gender,
      shift: n.shift,
      on: n.status === "true"
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/nurses", async (req, res) => {
  const { nurse_id, name, gender, shift, status } = req.body;
  try {
    if (nurse_id) {
      // Update
      await db.query(
        "UPDATE Nurses SET name = ?, gender = ?, shift = ?, status = ? WHERE nurse_id = ?",
        [name, gender, shift, status, nurse_id]
      );
      res.json({ id: nurse_id, name, gender, shift, on: status === "true" });
    } else {
      // Insert
      const [result] = await db.query(
        "INSERT INTO Nurses (name, gender, shift, status) VALUES (?, ?, ?, ?)",
        [name, gender, shift, status]
      );
      res.json({ id: result.insertId, name, gender, shift, on: status === "true" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/nurses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Nurses WHERE nurse_id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Appointments Endpoints
app.get("/api/appointments", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, p.name AS patientName, d.name AS doctorName
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
    `);
    const mapped = rows.map(a => ({
      id: a.appointment_id,
      patientId: a.patient_id,
      patientName: a.patientName || "Unknown",
      doctorId: a.doctor_id,
      doctorName: a.doctorName || "Unknown",
      date: a.date,
      time: a.time,
      status: a.status
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/appointments", async (req, res) => {
  let { patient_id, patientName, doctor_id, date, time } = req.body;
  try {
    if (!patient_id && patientName) {
      const [pRows] = await db.query("SELECT patient_id FROM Patients WHERE name = ? LIMIT 1", [patientName]);
      if (pRows.length > 0) {
        patient_id = pRows[0].patient_id;
      } else {
        const [result] = await db.query(
          "INSERT INTO Patients (name, age, gender, disease, days, bed) VALUES (?, ?, ?, ?, ?, ?)",
          [patientName, 30, "Other", "Outpatient", 0, "OPD"]
        );
        patient_id = result.insertId;
      }
    }

    const [result] = await db.query(
      "INSERT INTO Appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)",
      [patient_id, doctor_id, date, time, "Pending"]
    );
    
    const [[p]] = await db.query("SELECT name FROM Patients WHERE patient_id = ?", [patient_id]);
    const [[d]] = await db.query("SELECT name FROM Doctors WHERE doctor_id = ?", [doctor_id]);

    res.json({
      id: result.insertId,
      patientId: patient_id,
      patientName: p ? p.name : "Unknown",
      doctorId: doctor_id,
      doctorName: d ? d.name : "Unknown",
      date,
      time,
      status: "Pending"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { status, doctor_id } = req.body;
  try {
    if (status !== undefined) {
      await db.query("UPDATE Appointments SET status = ? WHERE appointment_id = ?", [status, id]);
    }
    if (doctor_id !== undefined) {
      await db.query("UPDATE Appointments SET doctor_id = ? WHERE appointment_id = ?", [doctor_id, id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Appointments WHERE appointment_id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Inventory Endpoints
app.get("/api/inventory", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Inventory");
    const mapped = rows.map(i => ({
      id: i.inventory_id,
      name: i.item_name,
      type: i.type,
      qty: i.quantity
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  const { item_name, type, quantity } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO Inventory (item_name, type, quantity) VALUES (?, ?, ?)",
      [item_name, type, quantity]
    );
    res.json({ id: result.insertId, name: item_name, type, qty: quantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    await db.query("UPDATE Inventory SET quantity = ? WHERE inventory_id = ?", [quantity, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/inventory/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Inventory WHERE inventory_id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Billing Endpoints
app.get("/api/billing", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Billing ORDER BY bill_id DESC LIMIT 5");
    const mapped = rows.map(b => ({
      date: b.date,
      name: b.patient_name,
      mode: b.payment_mode,
      amount: parseFloat(b.amount).toFixed(2)
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/billing", async (req, res) => {
  const { patient_id, amount, payment_mode } = req.body;
  const invoice_no = "INV-" + Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toLocaleString();
  
  try {
    // Get patient details first
    const [[p]] = await db.query("SELECT * FROM Patients WHERE patient_id = ?", [patient_id]);
    if (!p) {
      return res.status(404).json({ error: "Invalid Patient ID" });
    }

    // Insert Billing
    await db.query(
      "INSERT INTO Billing (patient_id, patient_name, amount, payment_mode, invoice_no, date) VALUES (?, ?, ?, ?, ?, ?)",
      [patient_id, p.name, amount, payment_mode, invoice_no, date]
    );

    // Discharge patient (removes patient and appointments)
    await db.query("DELETE FROM Patients WHERE patient_id = ?", [patient_id]);
    await db.query("DELETE FROM Appointments WHERE patient_id = ?", [patient_id]);

    res.json({
      success: true,
      bill: {
        p: {
          id: p.patient_id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          disease: p.disease,
          days: p.days,
          bed: p.bed
        },
        total: amount,
        invoice_no,
        date
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
