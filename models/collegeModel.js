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

    findCollegeByEmail: (college_email) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM college WHERE college_email = ?';
            pool.query(query, [college_email], (error, results) => {
                
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]); 
                }
            });
        });
    },

    findCollege:(callback)=>{
        const query='SELECT * FROM college';
        pool.query(query,callback)
    },
    deleteCollegeById: (college_id, callback) => {
        console.log("mod clg",college_id)
        const query =  'UPDATE college SET delete_status=1 WHERE college_id = ?';

        pool.query(query, [college_id], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    },
    findCollegeById: (college_id, callback) => {
        const query = 'SELECT * FROM college WHERE college_id = ?';
        pool.query(query, [college_id], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    }

};

module.exports = collegeModel;

