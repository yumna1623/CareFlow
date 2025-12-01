import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";
const router = express.Router();

const ADMIN_PASSCODE = "HOSPITAL_SECRET"; 

// --- DOCTOR ROUTES ---

// 1. Doctor Registration (With Passcode Protection)
router.post("/doctor/register", async (req, res) => {
  const { name, specialization, email, password, admin_code } = req.body;
  if (admin_code !== ADMIN_PASSCODE) {
    return res.status(403).json({ error: "Invalid Admin Passcode. Contact Management." });
  }

  try {
    const newDoc = await pool.query(
      "INSERT INTO doctors (name, specialization, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, specialization, email, password]
    );
    res.json(newDoc.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

// 2. Doctor Login
router.post("/doctor/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM doctors WHERE email = $1 AND password = $2", [email, password]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    
    const token = jwt.sign({ id: result.rows[0].doctor_id }, process.env.JWT_SECRET);
    res.json({ token, user: result.rows[0] });
  } catch (err) { res.status(500).send(err.message); }
});

// 3. Doctor Dashboard Data (Get Queue)
router.get("/doctor/queue/:doctor_id", async (req, res) => {
  try {
    const queue = await pool.query(
      "SELECT * FROM appointments WHERE doctor_id = $1 AND status = 'pending' ORDER BY queue_number ASC",
      [req.params.doctor_id]
    );
    res.json(queue.rows);
  } catch (err) { res.status(500).send(err.message); }
});

// 4. Mark Patient Completed (Call Next)
router.put("/complete/:appointment_id", async (req, res) => {
  try {
    await pool.query("UPDATE appointments SET status = 'completed' WHERE appointment_id = $1", [req.params.appointment_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).send(err.message); }
});

// --- PATIENT ROUTES (No Login) ---

// 5. Get Doctor List
router.get("/doctors", async (req, res) => {
  const result = await pool.query("SELECT doctor_id, name, specialization, avg_consult_time FROM doctors");
  res.json(result.rows);
});

// 6. Guest Booking
router.post("/book", async (req, res) => {
  const { doctor_id, patient_name, patient_age } = req.body;
  try {
    // Calculate Queue Number
    const lastQueue = await pool.query(
      "SELECT MAX(queue_number) as max_q FROM appointments WHERE doctor_id = $1 AND status = 'pending'",
      [doctor_id]
    );
    const nextQueue = (lastQueue.rows[0].max_q || 0) + 1;

    const newAppt = await pool.query(
      "INSERT INTO appointments (doctor_id, patient_name, patient_age, queue_number) VALUES ($1, $2, $3, $4) RETURNING appointment_id, queue_number",
      [doctor_id, patient_name, patient_age, nextQueue]
    );
    
    res.json(newAppt.rows[0]); 
  } catch (err) { res.status(500).send(err.message); }
});

// 7. Track Status by ID
router.get("/track/:appointment_id", async (req, res) => {
  try {
    const apptResult = await pool.query("SELECT * FROM appointments WHERE appointment_id = $1", [req.params.appointment_id]);
    
    if (apptResult.rows.length === 0) return res.status(404).json({ error: "Invalid ID" });
    const appt = apptResult.rows[0];

    if (appt.status !== 'pending') return res.json({ status: appt.status });

    // Calculate Wait Time
    const peopleAhead = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'pending' AND queue_number < $2",
      [appt.doctor_id, appt.queue_number]
    );
    
    const doc = await pool.query("SELECT avg_consult_time FROM doctors WHERE doctor_id = $1", [appt.doctor_id]);
    
    const countAhead = parseInt(peopleAhead.rows[0].count);
    const waitTime = countAhead * doc.rows[0].avg_consult_time;

    res.json({
      status: 'pending',
      queue_number: appt.queue_number,
      people_ahead: countAhead,
      estimated_wait: waitTime,
      patient_name: appt.patient_name
    });

  } catch (err) { res.status(500).send(err.message); }
});

export default router