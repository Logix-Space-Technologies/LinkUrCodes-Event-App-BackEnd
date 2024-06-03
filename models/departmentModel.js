const mysql = require('mysql');
require("dotenv").config()
const bcrypt=require("bcryptjs")

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: '',
  database: process.env.DB_NAME,
  port:process.env.DB_PORT
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

  findFacultyByEmail : (faculty_email, callback) => {
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

};
  
  module.exports = departmentModel;
  