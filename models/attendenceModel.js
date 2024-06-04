const mysql=require("mysql")
require("dotenv").config()
const bcrypt = require('bcryptjs');

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
})

const attendencemodel = {
  addAttendance: (data, callback) => {
    const query = "INSERT INTO attendance SET ?";
    pool.query(query, [data], callback);
},
  updateAttendence: (student_id, session_id, callback) => {
    const query = 'UPDATE attendance SET status = 1 WHERE student_id = ? AND session_id = ?';
    pool.query(query, [student_id, session_id], callback);
  },
  viewattendence:(session_id,callback)=>{
    const query='SELECT a.id, a.session_id, s.student_name,s.student_rollno ,a.student_id, a.status, a.added_date FROM attendance a JOIN student s ON a.student_id=s.student_id WHERE a.session_id= ? ;'
    pool.query(query, [session_id], callback);
  }
};

module.exports = attendencemodel;
