const mysql = require("mysql")
require("dotenv").config()
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

const packageModel = {

    //student feedback 
    insertFeedbackStud: (feedbackStudData, callback) => {
        const query = 'INSERT INTO feedback_stud SET ? ';
        pool.query(query, feedbackStudData, callback);
    },
    viewFeedbackStud: (callback) => {
        const query = 'SELECT s.student_name, e.event_private_name,c.college_name,f.feedback_content FROM student s join event_private e join feedback_stud f join college c on f.feedback_student_id = s.student_id where f.feedback_event_id = e.event_private_id and s.student_college_id=c.college_id';
        pool.query(query, callback);
    },

    //user feedback   
    insertFeedbackUser: (feedbackUserData, callback) => {
        const query = 'INSERT INTO feedback_user SET ? ';
        pool.query(query, feedbackUserData, callback);
    },
    viewFeedbackUser: (callback) => {
        const query = 'SELECT u.user_name, e.event_public_name,f.feedback_content FROM user u join event_public e join feedback_user f on f.feedback_user_id = u.user_id where f.feedback_event_id = e.event_public_id';
        pool.query(query, callback);
    },

    // session feedback
    insertFeedbackSessionStud: (feedbackSessionStudData, callback) => {
        const query = 'INSERT INTO feedback_session_private SET ? ';
        pool.query(query, feedbackSessionStudData, callback);
    },
    viewFeedbackSessionStud: (callback) => {
        const query = 'SELECT fs.feedback_id,s.student_name,sp.session_topic_description,sp.type,fs.feedback_contents,fs.addedby_date FROM feedback_session_private fs JOIN  student s ON fs.student_id = s.student_id  JOIN  session_private sp ON fs.session_id = sp.session_private_id;';
        pool.query(query, callback);
    },
}

module.exports = packageModel;