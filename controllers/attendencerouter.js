const express = require('express');
const attendencemodel = require('../models/attendenceModel');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());


router.post('/updateAttendence', (req, res) => {
  const admintoken = req.headers['token'];
  const { student_id, session_id } = req.body;

  jwt.verify(admintoken, 'eventAdmin', async (error, decoded) => {
    if (error) {
      console.error('JWT verification error:', error);
      return res.json({ status: "error", error: 'Unauthorized' });
    }

    if (!student_id || !session_id) {
      console.error('Missing student_id or session_id');
      return res.json({ status: "error", message: 'student_id and session_id are required' });
    }

    try {
      // Ensure student_id is an array
      const studentIds = Array.isArray(student_id) ? student_id : [student_id];

      // Use Promise.all to update attendance for all student IDs
      const updatePromises = studentIds.map(id => {
        return new Promise((resolve, reject) => {
          attendencemodel.updateAttendence(id, session_id, (error, results) => {
            if (error) {
              console.error('Error updating attendance for student_id:', id, error);
              return reject({ id, status: "error", message: 'Internal server error' });
            }

            if (results.affectedRows === 0) {
              console.warn('No record found to update for student_id:', id);
              return resolve({ id, status: 'error', message: 'No record found to update' });
            }

            console.log('Attendance updated successfully for student_id:', id);
            resolve({ id, status: "success", message: 'Attendance updated successfully' });
          });
        });
      });
      const results = await Promise.all(updatePromises);
      res.json({ status: "success", results });
    } catch (error) {
      console.error('Error processing updatePromises:', error);
      res.json({ status: "error", message: 'Internal server error' });
    }
  });
});



  router.post('/viewattendence', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
      if (error) {
        console.log({ "status": "error", "message": "Failed to verify token" })
        return res.json({ "status": "unauthorised user" });
      }
      if (decoded && decoded.adminUsername) {
        const { session_id } = req.body
        attendencemodel.viewattendence(session_id, (error, results) => {
          if (error) {
            return res.json({ status: "error", error })
          }
          const formattedResults = results.map(attendence => {
            const added_date = new Date(attendence.added_date);
            const formattedDate = `${added_date.getDate().toString().padStart(2, '0')}-${(added_date.getMonth() + 1).toString().padStart(2, '0')}-${added_date.getFullYear()}`;
            attendence.added_date = formattedDate; // DD-MM-YYYY format
            return attendence;
          });
          res.json({ formattedResults });
        })
      }
    });
  })

  router.post('/viewAbsentAttendence', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
      if (error) {
        console.log({ "status": "error", "message": "Failed to verify token" })
        return res.json({ "status": "unauthorised user" });
      }
      if (decoded && decoded.adminUsername) {
        const { session_id } = req.body
        attendencemodel.viewAbsentattendence(session_id, (error, results) => {
          if (error) {
            return res.json({ status: "error", error })
          }
          const formattedResults = results.map(attendence => {
            const added_date = new Date(attendence.added_date);
            const formattedDate = `${added_date.getDate().toString().padStart(2, '0')}-${(added_date.getMonth() + 1).toString().padStart(2, '0')}-${added_date.getFullYear()}`;
            attendence.added_date = formattedDate; // DD-MM-YYYY format
            return attendence;
          });
          res.json({ formattedResults });
        })
      }
    });
  })

  module.exports = router;
