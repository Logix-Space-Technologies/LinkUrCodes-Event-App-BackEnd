const mysql = require("mysql")
require("dotenv").config()
const bcrypt = require('bcryptjs');

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
    password:process.env.DB_PASS
});


const attendencemodel = {
  addAttendance: (data, callback) => {
    const query = "INSERT INTO attendance SET ?";
    pool.query(query, [data], callback);
  },
  updateAttendence: (student_id, session_id, callback) => {
    const query = 'UPDATE attendance SET status = 1 WHERE student_id = ? AND session_id = ?';
    pool.query(query, [student_id, session_id], callback);
  },
  viewattendence: (session_id, callback) => {
    const query = 'SELECT a.id, a.session_id,a.student_id ,s.student_name,s.student_rollno,s.student_admno , a.status, a.added_date FROM attendance a JOIN student s ON a.student_id=s.student_id WHERE a.session_id = ?;'
    pool.query(query, [session_id], callback);
  },
  viewAbsentattendence: (session_id, callback) => {
    const query = 'SELECT a.id, a.session_id,a.student_id, s.student_name,s.student_rollno,s.student_admno, a.status, a.added_date FROM attendance a JOIN student s ON a.student_id=s.student_id WHERE a.status=0 AND a.session_id = ? ;'
    pool.query(query, [session_id], callback);
  },
  addPublicAttendance: (data, callback) => {
    const query = "INSERT INTO attendance_user SET ?";
    pool.query(query, [data], callback);
  },
  updatePublicAttendence: (user_id, session_id, callback) => {
    const query = 'UPDATE attendance_user SET status = 1 WHERE user_id = ? AND session_id = ?';
    pool.query(query, [user_id, session_id], callback);
  },
  viewPublicAttendence: (session_id, callback) => {
    const query = 'SELECT a.id, a.session_id,a.user_id ,u.user_name,u.user_email,u.user_contact_no, a.status, a.added_date FROM attendance_user a JOIN user u ON a.user_id=u.user_id WHERE a.session_id = ?;'
    pool.query(query, [session_id], callback);
  },
  viewPublicAbsentAttendence: (session_id, callback) => {
    const query = 'SELECT a.id, a.session_id,a.user_id,u.user_name,u.user_email,u.user_contact_no, a.status, a.added_date FROM attendance_user a JOIN user u ON a.user_id=u.user_id WHERE a.status=0 AND a.session_id = ? ;'
    pool.query(query, [session_id], callback);
  }


};

module.exports = attendencemodel;
