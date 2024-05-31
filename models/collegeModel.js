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
        const query='SELECT * FROM college WHERE delete_status=0';
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
    updateCollege: (college_id, updatedFields, callback) => {
        const query = 'UPDATE college SET ? WHERE college_id = ?';
        pool.query(query, [updatedFields, college_id], callback);
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
},

findCollegeStudents: (student_college_id_obj, callback) => {
    console.log("clg", student_college_id_obj)
    const student_college_id=student_college_id_obj.student_college_id
    const query = 'SELECT s.student_id, s.student_name, s.student_rollno, s.student_admno, s.student_email, s.student_phone_no, s.student_password, e.event_private_name FROM event_private e JOIN student s ON s.event_id=e.event_private_id WHERE s.student_college_id = ? ORDER BY e.event_private_name ASC,s.student_name ASC';
    console.log(query)
    pool.query(query, [student_college_id], (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            return callback(error);
        }
        console.log('Query result:', result);
        callback(null, result);
    });
},


findEventsByCollegeId: (collegeId, callback) => {
    const query = `
        SELECT event_private_id,event_private_name, event_private_amount, event_private_description,event_private_date, event_private_time, event_private_image 
        FROM event_private WHERE event_private_clgid = ?;`;
    pool.query(query, [collegeId], callback);
},

findEventsByEventId: (eventId, callback) => {
    const query = `
    SELECT student_name,student_rollno,student_admno,student_email,student_phone_no FROM student WHERE event_id = ?;`;
    pool.query(query, [eventId], callback);
},

  getEventsByCollegeId: (collegeId, callback) => {
    const query = `
    SELECT event_private_id,event_private_name,event_private_amount,event_private_description,event_private_date,event_private_time,event_private_image,event_private_clgid,delete_status,cancel_status,
        CASE
            WHEN delete_status = 1 THEN 'Deleted'
            WHEN cancel_status = 1 THEN 'Cancelled'
            WHEN CONCAT(event_private_date, ' ', event_private_time) < NOW() THEN 'Expired'
            ELSE 'Active'
        END AS status FROM event_private WHERE event_private_clgid = ? AND delete_status = 0 ORDER BY
        CASE
            WHEN delete_status = 1 THEN 4
            WHEN cancel_status = 1 THEN 3
            WHEN CONCAT(event_private_date, ' ', event_private_time) < NOW() THEN 2
            ELSE 1
        END,
        event_private_date DESC,event_private_time DESC`;
    pool.query(query, [collegeId], callback);
},
  
   insertStudent: (studentData, callback) => {
        try {
            const { student_name, student_rollno, student_admno, student_email, student_phone_no, event_id, student_college_id } = studentData;
            const student_password = bcrypt.hashSync(student_admno.toString(), 10);

            const query = `INSERT INTO student (student_name, student_rollno, student_admno, student_email, student_phone_no, student_password, event_id, student_college_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            pool.query(query, [student_name, student_rollno, student_admno, student_email, student_phone_no, student_password, event_id, student_college_id], (error, result) => {
                if (error) {
                    console.error('Error inserting student data:', error);
                    return callback(error, null);
                }
                console.log('Inserted student data:', result);
                return callback(null, result);
            });
        } catch (error) {
            console.error('Error processing request:', error);
            return callback(error, null);
        }
    }
};

module.exports = collegeModel;

