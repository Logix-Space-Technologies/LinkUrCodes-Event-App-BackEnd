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
        insertStudent: (studentsData, callback) => {
            const query = 'INSERT INTO student (student_name, student_admno, student_email, student_password, event_id, student_college_id) VALUES ?';
            const values = studentsData.map(student => [
                student.student_name,
                student.student_admno,
                student.student_email,
                student.student_password,
                student.event_id,
                student.student_college_id
            ]);
            pool.query(query, [values], callback);
        }
,
    viewStudent:(callback)=>{
        const query='SELECT * FROM student';
        pool.query(query,callback);
    }
}

module.exports=studentModel