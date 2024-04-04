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


const collegeModel = {
// Modify the insertCollege function to use phone number as default password
insertCollege: (collegeData, callback) => {
  const query = 'INSERT INTO college SET ?';

  // Hash the college phone number to use as the default password
  const hashedPassword = bcrypt.hashSync(collegeData.college_phone, 10);
  
  // Add hashed password to collegeData
  const collegeWithPassword = { ...collegeData, college_password: hashedPassword };
  
  // Insert college data into the database
  pool.query(query, collegeWithPassword, (error, result) => {
      if (error) {
          return callback(error, null);
      }
      return callback(null, result);
  });
},

  

    findCollegeByName: (term, callback) => {
        // SELECT * FROM college WHERE user_email LIKE ? OR user_name LIKE ?
        const query = 'SELECT * FROM college WHERE college_name LIKE ?';
        const searchTermPattern = `%${term}%`;
        pool.query(query, [searchTermPattern], callback);
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
    },
  
    collegeLogin: (college_email, callback) => {
      const query = 'SELECT * FROM college  WHERE college_email = ? LIMIT 1'; // Assuming your table is named 'admin'
      pool.query(query, [college_email], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        // If no admin found, results array will be empty
        if (results.length === 0) {
          return callback(null, null);
        }
        // Return the first admin found (there should only be one due to the 'LIMIT 1' in the query)
        return callback(null, results[0]);
      });
    },
updateCollegePassword: (college_id, newPassword, callback) => {
  const query = 'UPDATE college SET college_password = ? WHERE college_id = ?';
  pool.query(query, [newPassword, college_id], (error, result) => {
      if (error) {
          console.error('Error updating college password:', error);
          return callback(error, null);
      }
      console.log('Password updated successfully:', result);
      callback(null, result);
  });
}

  

};

module.exports = collegeModel;

