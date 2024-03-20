const mysql = require('mysql');
require("dotenv").config()
// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: '',
  database: process.env.DB_NAME,
  port:process.env.DB_PORT
});


const collegeModel = {
    insertCollege: (collegeData, callback) => {
        const query = 'INSERT INTO college SET ?';
        pool.query(query, collegeData, callback);
    },

    findCollegeByName: (college_name, callback) => {
        const query = 'SELECT * FROM college WHERE college_name = ?';
        pool.query(query, [college_name], callback);
    },

    findCollege:(callback)=>{
        const query='SELECT * FROM college';
        pool.query(query,callback)
    }
};

module.exports = collegeModel;

