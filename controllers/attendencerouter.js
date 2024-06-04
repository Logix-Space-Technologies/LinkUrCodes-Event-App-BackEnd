const express = require('express');
const attendencemodel = require('../models/attendenceModel');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

/**
 * Update attendance
 * Route: POST /updateAttendence
 * Body: { student_id: number, session_id: number }
 */
router.post('/updateAttendence', (req, res) => {
  const admintoken = req.headers['token'];
  const { student_id, session_id } = req.body;

  jwt.verify(admintoken, 'eventAdmin', async (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!student_id || !session_id) {
      return res.status(400).json({ error: 'student_id and session_id are required' });
    }

    attendencemodel.updateAttendence(student_id, session_id, (error, results) => {
      if (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'No record found to update' });
      }

      res.json({ message: 'Attendance updated successfully' });
    });
  });
});

module.exports = router;
