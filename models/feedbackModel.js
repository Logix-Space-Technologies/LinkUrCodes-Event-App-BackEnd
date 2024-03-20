const mysql = require("mysql")
require("dotenv").config()
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

const packageModel = {
    insertFeedback: (feedbackData, callback) => {
        let values = [feedbackData.feedback_student_id, feedbackData.feedback_event_id, feedbackData.feedback_content];
        const query = 'INSERT INTO feedback(`feedback_student_id`, `feedback_event_id`, `feedback_content`) VALUES ?';
        console.log("feed",values)
        pool.query(query, values, callback);
    },
    viewFeedback: (callback) => {
        const query = 'SELECT * FROM feedback';
        pool.query(query, callback);
    }
   //SELECT s.student_name,s.student_college, e.event_name,f.feedback_content 
   //FROM student s join event e join feedback f on f.feedback_student_id =s.student_id 
   //where f.feedback_event_id=e.event_id;
    // ,
    // updatePackage: (admin_email, callback) => {
    //     const query = 'SELECT * FROM admin WHERE admin_email = ?';
    //     pool.query(query, [admin_email], callback);
    // }
}

module.exports = packageModel;