const mysql = require("mysql");
require("dotenv").config();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const certificateModel = {
    insertCertificateUser: (certificateData, callback) => {
        const query = 'INSERT INTO certificate_user SET ?';
        pool.query(query, certificateData, callback);
    },
    insertCertificateStudent: (certificateData, callback) => {
        const query = 'INSERT INTO certificate_stud SET ?';
        pool.query(query, certificateData, callback);
    },
    findAllCertificatesuser: (callback) => {
        const query = 'SELECT * FROM certificate_user';
        pool.query(query, callback);
    },
    findAllCertificatesstudent: (callback) => {
        const query = 'SELECT * FROM certificate_stud';
        pool.query(query, callback);
    },
    findCertificatesByPublicEvent: (callback) => {
        const query = `SELECT u.user_name AS Name,u.user_email AS Email,e.event_public_name AS Event,c.certificate_name,c.issued_date,c.Issued_By, c.status,c.expiration_date, CASE WHEN p.user_id IS NOT NULL THEN 'paid' ELSE 'not paid' END AS Payment_Status FROM certificate_user c INNER JOIN user u ON c.certificate_user_id = u.user_id INNER JOIN event_public e ON c.certificate_public_event_id = e.event_public_id LEFT JOIN payment_user p ON u.user_id = p.user_id WHERE c.status = 'pending'`;
        pool.query(query, callback);
    },
    findCertificatesByPrivateEvent: (callback) => {
        const query = `SELECT s.student_name AS student_name,s.student_email AS student_email,s.student_admno AS student_admn,cl.college_name AS college_name,e.event_private_name AS event_private_name,cs.certificate_name AS certificate_name,cs.issued_date AS issued_date,
        cs.Issued_By AS Issued_By,cs.status AS status,cs.expiration_date AS expiration_date,CASE WHEN pc.college_id IS NOT NULL THEN 'paid' ELSE 'not paid' END AS payment_status FROM certificate_stud cs INNER JOIN student s ON cs.certificate_student_id = s.student_id INNER JOIN event_private e ON cs.certificate_private_event_id = e.event_private_id INNER JOIN college cl ON s.student_college_id = cl.college_id LEFT JOIN payment_college pc ON cl.college_id = pc.college_id AND e.event_private_id = pc.private_event_id`;
        pool.query(query, callback);
    },
    findCertificatesByUsers: (user_id,callback) => {
        const query = `
        SELECT u.user_name as Name,u.user_email as Email,e.event_public_name as Event,c.certificate_name,c.issued_date,c.Issued_By,c.status,c.expiration_date
        FROM certificate_user c
        INNER JOIN user u ON c.certificate_user_id = u.user_id
        INNER JOIN event_public e ON c.certificate_public_event_id = e.event_public_id
        where u.user_id = ?
        `;
        pool.query(query,[user_id], callback);
    },
    findCertificatesByStudents: (student_id, callback) => {
        const query = `
        SELECT s.student_name AS Name, s.student_email AS Email, s.student_admno AS Admno, cl.college_name AS College, e.event_private_name AS Event, c.certificate_name,
        c.issued_date, c.Issued_By, c.status, c.expiration_date FROM certificate_stud c INNER JOIN student s ON c.certificate_student_id = s.student_id INNER JOIN event_private e 
        ON c.certificate_private_event_id = e.event_private_id INNER JOIN college cl 
        ON cl.college_id = s.student_college_id 
        WHERE s.student_id = ?
        `;
        pool.query(query, [student_id], callback);
    },
    updateCertificateStatusUser: (certificate_user_id, status, callback) => {
        const query = 'UPDATE certificate_user SET status = ? WHERE certificate_user_id = ?';
        pool.query(query, [status, certificate_user_id], callback);
    },
    updateCertificateStatusStudent: (certificate_student_id, status, callback) => {
        const query = 'UPDATE certificate_stud SET status = ? WHERE certificate_student_id = ?';
        pool.query(query, [status, certificate_student_id], callback);
    },
    findPrivateEventsByStudentId: (student_id, callback) => {
        const query = `
            SELECT event_id
            FROM student
            WHERE student_id = ?
        `;
        pool.query(query, [student_id], callback);
    },
    findPublicEventsByUserId: (user_id, callback) => {
        const query = `
            SELECT payment_event_id
            FROM payment_user
            WHERE user_id = ?
        `;
        pool.query(query, [user_id], callback);
    },
};

module.exports = certificateModel;