const mysql = require('mysql');
require("dotenv").config()
const bcrypt = require("bcryptjs")

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS
});


const departmentModel = {
  // Insert a new department
  insertDepartment: (departmentData, callback) => {
    const query = 'INSERT INTO department SET ?';

    // Hash the faculty phone number to use as the default password
    const hashedPassword = bcrypt.hashSync(departmentData.faculty_phone, 10);

    // Add hashed password to departmentData
    const departmentWithPassword = { ...departmentData, faculty_password: hashedPassword };

    // Insert department data into the database
    pool.query(query, departmentWithPassword, (error, result) => {
      if (error) {
        return callback(error, null);
      }
      return callback(null, result);
    });
  },



  findFacultyByEmail: (faculty_email, callback) => {
    const query = 'SELECT * FROM department WHERE faculty_email = ? LIMIT 1';
    pool.query(query, [faculty_email], (error, results) => {
      if (error) {
        return callback(error, null);
      }
      if (results.length === 0) {
        return callback(null, null);
      }
      return callback(null, results[0]);
    });
  },

  findFacultyByCollegeId: (college_id, callback) => {
    const query = 'SELECT department_name, faculty_name, faculty_email, faculty_phone FROM department WHERE college_id = ?';
    pool.query(query, [college_id], (error, results) => {
      if (error) {
        return callback(error, null);
      }
      return callback(null, results);
    });
  },
  findFacultyById: (id, callback) => {
    const query = 'SELECT d.department_id, c.college_name,c.college_image,d.department_name,d.faculty_name,d.faculty_email,d.faculty_phone FROM department d JOIN college c ON d.college_id=c.college_id WHERE d.department_id = ?';
    pool.query(query, [id], (error, results) => {
      if (error) {
        return callback(error, null);
      }
      if (results.length === 0) {
        return callback(null, null);
      }
      return callback(null, results[0]);
    });
  },
  updatePassword: (faculty_email, new_password, callback) => {
    const query = 'UPDATE department SET faculty_password = ? WHERE faculty_email = ?';
    console.log('Hashed Password to be stored:', new_password); // Debug logging
    pool.query(query, [new_password, faculty_email], (error, result) => {
      if (error) {
        console.error('Database error:', error.message); // Debug logging
        return callback(error, null);
      }
      console.log('Database update result:', result); // Debug logging
      return callback(null, result);
    });
  },
  updateFaculty: (newData, id, callback) => {
    const query = 'UPDATE department SET ? WHERE department_id = ?';
    pool.query(query, [newData, id], (error, result) => {
      if (error) {
        console.error('Database error:', error.message); // Debug logging
        return callback(error, null);
      }
      console.log('Database update result:', result); // Debug logging
      return callback(null, result);
    });
  },

  logFacultyAction: (department_id, action) => {
    const facultyLogs = {
      department_id: department_id,
      action: action,
      date_time: new Date() // Optional: Add a timestamp for when the action was logged
    };
    pool.query("INSERT INTO faculty_logs SET ?", facultyLogs, (logErr, logRes) => {
      if (logErr) {
        console.log("error: ", logErr);
        return;
      }
    });
  },
  viewFacultyLogs: (callback) => {
    const query = 'SELECT * FROM faculty_logs';
    pool.query(query, callback)

  }

};


module.exports = departmentModel;
