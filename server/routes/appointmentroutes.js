// backend/routes/appointmentRoutes.js
import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const router = express.Router();
const JWT_SECRET = "your_jwt_secret_here"; 

// -----------------------------
// Helpers
// -----------------------------
function generateAppointmentId() {
  return `APT${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
}

// convert "9:00 AM" -> minutes integer
function convertToMinutes(time) {
  if (!time) return 0;
  // Accept both "09:00", "9:00 AM", "09:00 AM", "09:00:00"
  if (time.includes("AM") || time.includes("PM")) {
    const [hhmm, ampm] = time.split(" ");
    let [h, m] = hhmm.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  } else {
    // 24h format "09:00" or "09:00:00"
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  }
}

// convert minutes -> "HH:MM:SS" (24h DB time) and also return display string "h:mm AM/PM"
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

// -----------------------------
// 1. DOCTOR REGISTRATION (self-register)
// -----------------------------
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



router.post("/doctor/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  try {
    const userRes = await pool.query("SELECT * FROM doctors WHERE email=$1", [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    // generate JWT token
    const token = jwt.sign({ doctor_id: user.id, name: user.full_name }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { doctor_id: user.id, name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// GET DOCTORS (for patient dropdown)
// -----------------------------
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

// -----------------------------
// GENERATE SLOTS (idempotent for date)
// -----------------------------
router.post("/doctor/generate-slots", async (req, res) => {
  const { doctor_id, date } = req.body;
  if (!doctor_id || !date) return res.status(400).json({ error: "doctor_id and date required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check doctor
    const docRes = await client.query(
      "SELECT start_time, end_time, slot_duration FROM doctors WHERE id=$1",
      [doctor_id]
    );
    if (docRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Doctor not found" });
    }
    const { start_time, end_time, slot_duration } = docRes.rows[0];

    // ensure we don't double-generate
    const check = await client.query("SELECT COUNT(*) FROM time_slots WHERE doctor_id=$1 AND date=$2", [doctor_id, date]);
    if (parseInt(check.rows[0].count) > 0) {
      await client.query("COMMIT");
      return res.json({ message: "Slots already generated" });
    }

    const start = convertToMinutes(start_time || "09:00");
    const end = convertToMinutes(end_time || "17:00");
    const dur = parseInt(slot_duration) || 15;

    for (let t = start; t < end; t += dur) {
      const { dbTime } = minutesToTimeFormats(t);
      // INSERT; UNIQUE constraint on (doctor_id,date,time) prevents duplicates.
      await client.query(
        `INSERT INTO time_slots (doctor_id, date, time, is_booked)
         VALUES ($1, $2, $3, false)`,
        [doctor_id, date, dbTime]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Slots generated" });
  } catch (err) {
    await client.query("ROLLBACK");
    // possible unique violation from concurrency; ignore as idempotent
    if (err.code === "23505") {
      res.json({ message: "Some slots already existed; generation skipped where duplicates occurred." });
    } else res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// -----------------------------
// GET AVAILABLE TIME SLOTS (for date)
// -----------------------------
router.get("/doctor/:doctor_id/timeslots/:date", async (req, res) => {
  const { doctor_id, date } = req.params;
  try {
    const slots = await pool.query(
      `SELECT id, time::text AS time_24, to_char(time, 'HH12:MI AM') AS display_time, date
       FROM time_slots
       WHERE doctor_id=$1 AND date=$2 AND is_booked=false
       ORDER BY time ASC`,
      [doctor_id, date]
    );
    res.json(slots.rows.map(s => ({ id: s.id, time: s.time_24, display_time: s.display_time, date: s.date })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// BOOK APPOINTMENT BY SLOT (atomic)
// -----------------------------
router.post("/book/slot", async (req, res) => {
  const { doctor_id, slot_id, patient_name, patient_email, patient_phone, patient_age } = req.body;
  if (!doctor_id || !slot_id || !patient_name) return res.status(400).json({ error: "doctor_id, slot_id and patient_name required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Lock & mark slot as booked atomically
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

    // 2) Ensure patient exists (create if not)
    let patientId;
    if (patient_email) {
      const p = await client.query("SELECT id FROM patients WHERE email=$1", [patient_email]);
      if (p.rows.length > 0) patientId = p.rows[0].id;
      else {
        const ins = await client.query(
          `INSERT INTO patients (full_name, email, phone, created_at)
           VALUES ($1,$2,$3,NOW()) RETURNING id`,
          [patient_name, patient_email || null, patient_phone || null]
        );
        patientId = ins.rows[0].id;
      }
    } else {
      // no email supplied: create patient row without email
      const ins = await client.query(
        `INSERT INTO patients (full_name, email, phone, created_at)
         VALUES ($1,$2,$3,NOW()) RETURNING id`,
        [patient_name, null, patient_phone || null]
      );
      patientId = ins.rows[0].id;
    }

    // 3) Calculate next queue number for that doctor and date
    const q = await client.query(
      `SELECT COALESCE(MAX(queue_number),0) + 1 AS next
       FROM appointments
       WHERE doctor_id=$1 AND appointment_date=$2`,
      [doctor_id, slot.appointment_date]
    );
    const queue_number = q.rows[0].next;

    // 4) Insert appointment; generate appointment_id
    // 4) Insert appointment; generate appointment_id
const appointment_id = generateAppointmentId();
const insert = await client.query(
  `INSERT INTO appointments
   (appointment_id, doctor_id, patient_id, slot_id, queue_number, status, created_at, patient_name, patient_email, patient_phone, appointment_date, appointment_time)
   VALUES ($1,$2,$3,$4,$5,'scheduled',NOW(),$6,$7,$8,$9,$10)
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
    new Date(slot.appointment_date), // <-- force DATE object
    slot.appointment_time
  ]
);


    await client.query("COMMIT");

    // format appointment_time for frontend (HH12:MI AM)
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
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// -----------------------------
// TRACK APPOINTMENT
// -----------------------------
router.get("/track/:appointment_id", async (req, res) => {
  const { appointment_id } = req.params;
  try {
    const ap = await pool.query(
      `SELECT a.appointment_id, a.patient_name, a.patient_age, a.patient_email, a.patient_phone,
              a.queue_number, a.status, a.appointment_date, to_char(a.appointment_time, 'HH12:MI AM') AS slot_time,
              -- compute number ahead
              (SELECT COUNT(*) FROM appointments a2
               WHERE a2.doctor_id = a.doctor_id AND a2.appointment_date = a.appointment_date AND a2.status='scheduled' AND a2.queue_number < a.queue_number) AS patients_ahead
       FROM appointments a
       WHERE a.appointment_id = $1`,
      [appointment_id]
    );
    if (ap.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });
    const row = ap.rows[0];
    // compute estimated delay (simple heuristic: patients_ahead * avg consult time)
    // Try to read doctor's slot_duration
    const doc = await pool.query("SELECT slot_duration FROM doctors WHERE id = (SELECT doctor_id FROM appointments WHERE appointment_id=$1)", [appointment_id]);
    const avg = doc.rows[0]?.slot_duration || 15;
    const delay_mins = row.patients_ahead * avg;
    // compute expected_time (naive): take slot_time and add delay
    // For simplicity, return slot_time and delay_mins
    res.json({
      appointment_id: row.appointment_id,
      patient_name: row.patient_name,
      status: row.status,
      slot_time: row.slot_time,
      patients_ahead: parseInt(row.patients_ahead, 10),
      delay_mins,
      expected_time: row.slot_time // frontend can add delay_mins to this if needed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -----------------------------
// DOCTOR: GET APPOINTMENTS (for dashboard) - FIXED
// -----------------------------
router.get("/doctor/appointments/:doctor_id", async (req, res) => {
  const { doctor_id } = req.params;
  // Use the 'target_date' query parameter, or default to 'CURRENT_DATE' (PostgreSQL function)
  const targetDate = req.query.target_date || 'CURRENT_DATE'; 

  try {
    // 1) Fetch doctor info
    const doc = await pool.query(
      `SELECT id AS doctor_id, full_name AS name, start_time, end_time, slot_duration 
       FROM doctors 
       WHERE id=$1`,
      [doctor_id]
    );
    if (doc.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

    // 2) Fetch appointments for the specified targetDate
    // We use dynamic query construction to handle 'CURRENT_DATE' function or a passed string date.
    let appts;
    if (targetDate === 'CURRENT_DATE') {
        appts = await pool.query(
            `SELECT a.appointment_id, a.patient_name, a.patient_age, a.status, a.queue_number,
                    to_char(a.appointment_time, 'HH12:MI AM') AS slot_time, a.appointment_date
             FROM appointments a
             WHERE a.doctor_id=$1
               AND a.appointment_date = CURRENT_DATE
             ORDER BY a.queue_number ASC`,
            [doctor_id]
        );
    } else {
        appts = await pool.query(
            `SELECT a.appointment_id, a.patient_name, a.patient_age, a.status, a.queue_number,
                    to_char(a.appointment_time, 'HH12:MI AM') AS slot_time, a.appointment_date
             FROM appointments a
             WHERE a.doctor_id=$1
               AND a.appointment_date = $2
             ORDER BY a.queue_number ASC`,
            [doctor_id, targetDate]
        );
    }
    
    const scheduled = appts.rows.filter(a => a.status === 'scheduled');
    const nowServing = scheduled[0] || null;
    const waitingList = scheduled.slice(1);

    res.json({
      doctor: doc.rows[0],
      nowServing,
      waitingList,
      allAppointments: appts.rows,
      // Provide the date back for reference, especially if it was CURRENT_DATE
      targetDate: targetDate === 'CURRENT_DATE' ? new Date().toISOString().split('T')[0] : targetDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



// -----------------------------
// MARK APPOINTMENT COMPLETE
// -----------------------------
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


// GET logged-in doctor info
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
