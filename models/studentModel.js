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
    // loginStudent:(studentData,callback)=>{
    //     const query='SELECT * FROM student WHERE student_email=? AND student_password=?'
    //     pool.query(query,studentData,callback);
    // }
    loginStudent: (studentData, callback) => {
        const query = 'SELECT * FROM student WHERE student_email=? AND student_password=?';
        // Ensure studentData is an array containing email and password
        const values = [studentData.student_email, studentData.student_password];
        pool.query(query, values, callback);
    }
    
}

module.exports=studentModel