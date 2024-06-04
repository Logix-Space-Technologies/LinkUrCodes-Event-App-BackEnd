const mysql = require('mysql');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // Ensure your environment variable is correctly set
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const attendencemodel = {
  updateAttendence: (student_id, session_id, callback) => {
    const query = 'UPDATE attendance SET status = 1, added_date = CURDATE() WHERE student_id = ? AND session_id = ?';
    pool.query(query, [student_id, session_id], callback);
  },
};

module.exports = attendencemodel;