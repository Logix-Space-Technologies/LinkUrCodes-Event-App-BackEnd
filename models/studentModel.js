const mysql=require('mysql')
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    password:'',
    port:process.env.DB_PORT
})

const studentModel={
    insertStudent:(studentData,callback)=>{
        const query='INSERT INTO student SET?';
        pool.query(query,studentData,callback);
    },
    viewStudent:(callback)=>{
        const query='SELECT * FROM student';
        pool.query(query,callback);
    },
    loginStudent: (student_email, callback) => {
        // Your student table needs to have an 'email' and 'password' column
        const query = 'SELECT * FROM student WHERE student_email = ? LIMIT 1'; // Assuming your table is named 'student'
        pool.query(query, [student_email], (error, results) => {
          if (error) {
            return callback(error, null);
          }
          // If no student found, results array will be empty
          if (results.length === 0) {
            return callback(null, null);
          }
          // Return the first student found (there should only be one due to the 'LIMIT 1' in the query)
          return callback(null, results[0]);
        });
      }
    
}

module.exports=studentModel