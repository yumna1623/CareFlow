// backend/routes/appointmentRoutes.js
import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "your_jwt_secret_here";

// Helper Functions
function generateAppointmentId() {
  return `APT${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
}

function convertToMinutes(time) {
  if (!time) return 0;
  if (time.includes("AM") || time.includes("PM")) {
    const [hhmm, ampm] = time.split(" ");
    let [h, m] = hhmm.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  } else {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  }
}

function minutesToTimeFormats(total) {
  let h = Math.floor(total / 60);
  let m = total % 60;
  const dbTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  const ampm = h >= 12 ? "PM" : "AM";
  let dh = h % 12;
  if (dh === 0) dh = 12;
  const display = `${dh}:${String(m).padStart(2, "0")} ${ampm}`;
  return { dbTime, display };
}

function formatDateString(dateInput) {
  if (!dateInput) return null;
  if (typeof dateInput === 'string') {
    return dateInput.split('T')[0];
  }
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ===== DOCTOR REGISTRATION =====
router.post("/doctor/register", async (req, res) => {
  const { name, specialization, email, password, start_time, end_time, slot_duration } = req.body;

  if (!name || !specialization || !email || !password) {
    return res.status(400).json({ error: "name, specialization, email and password are required" });
  }

  if (password.length < 5) {
    return res.status(400).json({ error: "Password must be at least 5 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO doctors (full_name, specialization, email, password, start_time, end_time, slot_duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id AS doctor_id, full_name AS name, specialization, email, start_time, end_time, slot_duration`,
      [name, specialization, email, hashedPassword, start_time || null, end_time || null, slot_duration || 15]
    );

    res.status(201).json({ message: "Registered successfully! Please login.", doctor: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Doctor with this email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// ===== DOCTOR LOGIN =====
router.post("/doctor/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  try {
    const userRes = await pool.query("SELECT * FROM doctors WHERE email=$1", [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ doctor_id: user.id, name: user.full_name }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { doctor_id: user.id, name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GET DOCTORS =====
router.get("/doctors", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id AS doctor_id, full_name AS name, specialization, start_time, end_time, slot_duration
       FROM doctors
       ORDER BY full_name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GENERATE SLOTS =====
router.post("/doctor/generate-slots", async (req, res) => {
  const { doctor_id, date } = req.body;
  if (!doctor_id || !date) return res.status(400).json({ error: "doctor_id and date required" });

  const formattedDate = formatDateString(date);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const docRes = await client.query(
      "SELECT start_time, end_time, slot_duration FROM doctors WHERE id=$1",
      [doctor_id]
    );
    if (docRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Doctor not found" });
    }
    const { start_time, end_time, slot_duration } = docRes.rows[0];

    const check = await client.query("SELECT COUNT(*) FROM time_slots WHERE doctor_id=$1 AND date=$2", [doctor_id, formattedDate]);
    if (parseInt(check.rows[0].count) > 0) {
      await client.query("COMMIT");
      return res.json({ message: "Slots already generated" });
    }

    const start = convertToMinutes(start_time || "09:00 AM");
    const end = convertToMinutes(end_time || "05:00 PM");
    const dur = parseInt(slot_duration) || 15;

    for (let t = start; t < end; t += dur) {
      const { dbTime } = minutesToTimeFormats(t);
      await client.query(
        `INSERT INTO time_slots (doctor_id, date, time, is_booked)
         VALUES ($1, $2, $3, false)`,
        [doctor_id, formattedDate, dbTime]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Slots generated" });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      res.json({ message: "Some slots already existed" });
    } else res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ===== GET AVAILABLE TIME SLOTS =====
router.get("/doctor/:doctor_id/timeslots/:date", async (req, res) => {
  const { doctor_id, date } = req.params;
  const formattedDate = formatDateString(date);

  try {
    const slots = await pool.query(
      `SELECT id, time::text AS time_24, to_char(time, 'HH12:MI AM') AS display_time, date
       FROM time_slots
       WHERE doctor_id=$1 AND date=$2 AND is_booked=false
       ORDER BY time ASC`,
      [doctor_id, formattedDate]
    );
    res.json(slots.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== BOOK APPOINTMENT BY SLOT =====
router.post("/book/slot", async (req, res) => {
  const { doctor_id, slot_id, patient_name, patient_email, patient_phone, patient_age } = req.body;
  
  if (!doctor_id || !slot_id || !patient_name) {
    return res.status(400).json({ error: "doctor_id, slot_id and patient_name required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const slotRes = await client.query(
      `UPDATE time_slots
       SET is_booked = true
       WHERE id = $1 AND is_booked = false
       RETURNING id, doctor_id, date AS appointment_date, time AS appointment_time`,
      [slot_id]
    );

    if (slotRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Slot already booked or not found" });
    }
    
    const slot = slotRes.rows[0];
    const cleanDate = formatDateString(slot.appointment_date);

    let patientId;
    if (patient_email) {
      const p = await client.query("SELECT id FROM patients WHERE email=$1", [patient_email]);
      if (p.rows.length > 0) {
        patientId = p.rows[0].id;
      } else {
        const ins = await client.query(
          `INSERT INTO patients (full_name, email, phone, created_at)
           VALUES ($1,$2,$3,NOW()) RETURNING id`,
          [patient_name, patient_email, patient_phone || null]
        );
        patientId = ins.rows[0].id;
      }
    } else {
      const ins = await client.query(
        `INSERT INTO patients (full_name, email, phone, created_at)
         VALUES ($1,$2,$3,NOW()) RETURNING id`,
        [patient_name, null, patient_phone || null]
      );
      patientId = ins.rows[0].id;
    }

    const q = await client.query(
      `SELECT COALESCE(MAX(queue_number),0) + 1 AS next
       FROM appointments
       WHERE doctor_id=$1 AND appointment_date=$2::DATE`,
      [doctor_id, cleanDate]
    );
    const queue_number = q.rows[0].next;

    const appointment_id = generateAppointmentId();
    const insert = await client.query(
      `INSERT INTO appointments
       (appointment_id, doctor_id, patient_id, slot_id, queue_number, status, created_at, patient_name, patient_email, patient_phone, patient_age, appointment_date, appointment_time)
       VALUES ($1,$2,$3,$4,$5,'scheduled',NOW(),$6,$7,$8,$9,$10::DATE,$11)
       RETURNING appointment_id, queue_number, appointment_time, appointment_date`,
      [
        appointment_id,
        doctor_id,
        patientId,
        slot_id,
        queue_number,
        patient_name,
        patient_email || null,
        patient_phone || null,
        patient_age || null,
        cleanDate,
        slot.appointment_time
      ]
    );

    await client.query("COMMIT");

    const a = insert.rows[0];
    const apptTimeRes = await pool.query("SELECT to_char($1::time, 'HH12:MI AM') AS display_time", [a.appointment_time]);
    const display_time = apptTimeRes.rows[0].display_time;

    res.status(201).json({
      appointment_id: a.appointment_id,
      queue_number: a.queue_number,
      appointment_time: display_time,
      appointment_date: a.appointment_date
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ===== TRACK APPOINTMENT =====
router.get("/track/:appointment_id", async (req, res) => {
  const { appointment_id } = req.params;
  try {
    const ap = await pool.query(
      `SELECT a.appointment_id, a.patient_name, a.patient_age, a.patient_email, a.patient_phone,
              a.queue_number, a.status, a.appointment_date, to_char(a.appointment_time, 'HH12:MI AM') AS slot_time,
              (SELECT COUNT(*) FROM appointments a2
               WHERE a2.doctor_id = a.doctor_id AND a2.appointment_date = a.appointment_date AND a2.status='scheduled' AND a2.queue_number < a.queue_number) AS patients_ahead
       FROM appointments a
       WHERE a.appointment_id = $1`,
      [appointment_id]
    );
    
    if (ap.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });
    
    const row = ap.rows[0];
    const doc = await pool.query(
      "SELECT slot_duration FROM doctors WHERE id = (SELECT doctor_id FROM appointments WHERE appointment_id=$1)",
      [appointment_id]
    );
    
    const avg = doc.rows[0]?.slot_duration || 15;
    const delay_mins = row.patients_ahead * avg;

    res.json({
      appointment_id: row.appointment_id,
      patient_name: row.patient_name,
      patient_age: row.patient_age,
      status: row.status,
      slot_time: row.slot_time,
      appointment_date: row.appointment_date,
      queue_number: row.queue_number,           // ✅ ADD THIS
      patients_ahead: parseInt(row.patients_ahead, 10),
      delay_mins,
      expected_time: row.slot_time
    });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== GET DOCTOR APPOINTMENTS - FIXED WITH DEBUG =====
router.get("/doctor/appointments/:doctor_id", async (req, res) => {
  const { doctor_id } = req.params;
  const targetDate = req.query.target_date;

  console.log("📋 FETCHING APPOINTMENTS FOR DOCTOR:", {
    doctor_id,
    targetDate,
    timestamp: new Date().toISOString()
  });

  try {
    // 1) Check if doctor exists
    const doc = await pool.query(
      `SELECT id AS doctor_id, full_name AS name, start_time, end_time, slot_duration 
       FROM doctors 
       WHERE id=$1`,
      [doctor_id]
    );
    
    if (doc.rows.length === 0) {
      console.error("❌ Doctor not found:", doctor_id);
      return res.status(404).json({ error: "Doctor not found" });
    }

    console.log("✅ Doctor found:", doc.rows[0]);

    let appts;
    let queryDate;

    if (targetDate) {
      queryDate = formatDateString(targetDate);
      console.log("🔍 Querying for specific date:", queryDate);

      appts = await pool.query(
        `SELECT a.appointment_id, a.patient_name, a.patient_age, a.status, a.queue_number,
                to_char(a.appointment_time, 'HH12:MI AM') AS slot_time, a.appointment_date
         FROM appointments a
         WHERE a.doctor_id=$1
           AND a.appointment_date=$2::DATE
         ORDER BY a.queue_number ASC`,
        [doctor_id, queryDate]
      );
    } else {
      console.log("🔍 Querying for TODAY");

      appts = await pool.query(
        `SELECT a.appointment_id, a.patient_name, a.patient_age, a.status, a.queue_number,
                to_char(a.appointment_time, 'HH12:MI AM') AS slot_time, a.appointment_date
         FROM appointments a
         WHERE a.doctor_id=$1
           AND a.appointment_date=CURRENT_DATE
         ORDER BY a.queue_number ASC`,
        [doctor_id]
      );
    }

    console.log(`✅ Found ${appts.rows.length} appointments`);
    console.log("📊 Appointments data:", appts.rows);

    const scheduled = appts.rows.filter(a => a.status === 'scheduled');
    const nowServing = scheduled[0] || null;
    const waitingList = scheduled.slice(1);

    res.json({
      doctor: doc.rows[0],
      nowServing,
      waitingList,
      allAppointments: appts.rows,
      targetDate: queryDate || new Date().toISOString().split('T')[0]
    });
  } catch (err) {
    console.error("❌ ERROR IN /doctor/appointments:", err);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});

// ===== MARK APPOINTMENT COMPLETE =====
router.put("/complete/:appointment_id", async (req, res) => {
  const { appointment_id } = req.params;
  try {
    const upd = await pool.query("UPDATE appointments SET status='completed' WHERE appointment_id=$1 RETURNING *", [appointment_id]);
    if (upd.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json({ success: true, appointment: upd.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GET LOGGED-IN DOCTOR INFO =====
router.get("/doctor/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const docRes = await pool.query(
      `SELECT id AS doctor_id, full_name AS name, start_time, end_time, slot_duration
       FROM doctors WHERE id=$1`,
      [decoded.doctor_id]
    );

    if (docRes.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

    res.json({ doctor: docRes.rows[0] });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;