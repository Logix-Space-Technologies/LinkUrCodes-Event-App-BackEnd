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
    },
    viewstud1: (student_id, callback) => {
        const query = 'SELECT s.student_id, s.student_name, s.student_rollno, s.student_admno, s.student_email, s.student_phone_no, s.event_id, c.college_name, c.college_email, c.college_phone FROM student s JOIN college c ON s.student_college_id = c.college_id WHERE s.student_id = ?';
        pool.query(query, [student_id], callback)
    },
    viewstudevent: (student_id, callback) => {
        const query = 'SELECT ep.* FROM event_private AS ep INNER JOIN student AS s ON ep.event_private_id = s.event_id WHERE s.student_id = ?';
        pool.query(query, [student_id], callback)
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
      },
    updatePassword :(student_email, hashedPassword, callback) => {
    const query = 'UPDATE student SET student_password = ? WHERE student_email = ?';
    pool.query(query, [hashedPassword, student_email], callback);
    },
    sortStudentsByCollege: (student_college_id, callback) => {
        const query = 'SELECT * FROM student WHERE student_college_id = 1 GROUP BY student_name'; // Assuming you want to sort them by name, adjust as necessary
        pool.query(query, [student_college_id], callback);
    },
    sortStudentsByEvent: (event_id, callback) => {
        const query = 'SELECT * FROM student WHERE event_id = 1 GROUP BY student_name'; 
        pool.query(query, [event_id], callback);
    },
}

module.exports=studentModel