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
    insertCertificateCollege: (certificateData, callback) => {
        const query = 'INSERT INTO certificate_college SET ?';
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
    findAllColleges: (callback) => {
        const query = 'SELECT * FROM college';
        pool.query(query, callback);
    },
    findAllStudents: (callback) => {
        const query = 'SELECT * FROM student';
        pool.query(query, callback);
    },
    findAllColleges: (searchKeyword, callback) => {
    let query = 'SELECT * FROM college';
    const params = [];
    if (searchKeyword) {
        query += ' WHERE college_name LIKE ?';
        params.push('%' + searchKeyword + '%');
    }
    pool.query(query, params, callback);
    },
    findStudentsByCollegeId: (college_id, callback) => {
        const query = `
            SELECT *
            FROM student
            WHERE student_college_id = ?
        `;
        pool.query(query, [college_id], callback);
    },
    findCertificatesByPublicEvent: (callback) => {
        const query = `SELECT u.user_name AS Name,u.user_email AS Email,e.event_public_name AS Event,c.certificate_name,c.issued_date,c.Issued_By, c.status,c.expiration_date, CASE WHEN p.user_id IS NOT NULL THEN 'paid' ELSE 'not paid' END AS Payment_Status FROM certificate_user c INNER JOIN user u ON c.certificate_user_id = u.user_id INNER JOIN event_public e ON c.certificate_public_event_id = e.event_public_id LEFT JOIN payment_user p ON u.user_id = p.user_id WHERE c.status = 'pending'`;
        pool.query(query, callback);
    },
    findCertificatesByCollegePrivateEvent: (callback) => {
        const query = `SELECT DISTINCT s.student_name,s.student_email,s.student_admno,c.college_name,ep.event_private_name,cc.certificate_name,cc.issued_date,
        cc.Issued_By,cc.status,cc.expiration_date,CASE WHEN pc.college_id IS NOT NULL THEN 'paid' ELSE 'not paid' END AS payment_status
       FROM student s INNER JOIN college c ON s.student_college_id = c.college_id INNER JOIN event_private ep ON s.event_id = ep.event_private_id INNER JOIN certificate_college cc ON ep.event_private_id = cc.certificate_private_event_id AND cc.certificate_college_id = c.college_id LEFT JOIN payment_college pc ON ep.event_private_id = pc.private_event_id AND c.college_id = pc.college_id WHERE cc.status = 'pending'`;
        pool.query(query, callback);
    },
    findCertificatesByPrivateEvent: (callback) => {
        const query = `SELECT s.student_name AS student_name,s.student_email AS student_email,s.student_admno AS student_admn,cl.college_name AS college_name,e.event_private_name AS event_private_name,cs.certificate_name AS certificate_name,cs.issued_date AS issued_date,
        cs.Issued_By AS Issued_By,cs.status AS status,cs.expiration_date AS expiration_date,CASE WHEN pc.college_id IS NOT NULL THEN 'paid' ELSE 'not paid' END AS payment_status FROM certificate_stud cs INNER JOIN student s ON cs.certificate_student_id = s.student_id INNER JOIN event_private e ON cs.certificate_private_event_id = e.event_private_id INNER JOIN college cl ON s.student_college_id = cl.college_id LEFT JOIN payment_college pc ON cl.college_id = pc.college_id AND e.event_private_id = pc.private_event_id WHERE cs.status = 'pending'`;
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
    findCertificatesByStudent: (student_id, callback) => {
        const query = `
            SELECT DISTINCT s.student_name AS Name, s.student_email AS Email, s.student_admno AS Admno, cl.college_name AS College, e.event_private_name AS Event, c.certificate_name, c.issued_date, c.Issued_By, c.status, c.expiration_date 
            FROM certificate_college c 
            INNER JOIN college cl ON c.certificate_college_id = cl.college_id 
            INNER JOIN event_private e ON c.certificate_private_event_id = e.event_private_id 
            INNER JOIN student s ON cl.college_id = s.student_college_id AND e.event_private_id = s.event_id 
            WHERE s.student_id = ?`;
        pool.query(query, [student_id], callback);
    },
    findCertificatesByCollege: (college_id, callback) => {
        const query = `
        SELECT DISTINCT s.student_name AS Name, s.student_email AS Email, s.student_admno AS Admno, cl.college_name AS College,e.event_private_name AS Event, c.certificate_name, c.issued_date, c.Issued_By, c.status, c.expiration_date 
        FROM certificate_college c INNER JOIN college cl ON c.certificate_college_id = cl.college_id INNER JOIN event_private e ON c.certificate_private_event_id = e.event_private_id INNER JOIN student s ON cl.college_id = s.student_college_id 
        AND e.event_private_id = s.event_id WHERE cl.college_id = ?
        `;
        pool.query(query, [college_id], callback);
    },
    updateCertificateStatusUser: (certificate_user_id, status, callback) => {
        const query = 'UPDATE certificate_user SET status = ? WHERE certificate_user_id = ?';
        pool.query(query, [status, certificate_user_id], callback);
    },
    updateCertificateStatusStudent: (certificate_student_id, status, callback) => {
        const query = 'UPDATE certificate_stud SET status = ? WHERE certificate_student_id = ?';
        pool.query(query, [status, certificate_student_id], callback);
    },
    updateCertificateStatusForRequests: (certificate_college_id, status, callback) => {
        const query = `
            UPDATE certificate_college
            SET status = ?
            WHERE certificate_college_id IN (?)
        `;
        pool.query(query, [status, certificate_college_id], callback);
    },
    findPrivateEventsByStudentId: (certificate_student_id, callback) => {
        const query = `
            SELECT event_id
            FROM student
            WHERE student_id = ?
        `;
        pool.query(query, [certificate_student_id], callback);
    },
    findPrivateEventsByStudentIds: (studentIds, callback) => {
        const query = `
        SELECT event_id
        FROM student
        WHERE student_id IN (?)
        `;
        pool.query(query, [studentIds], callback);
    },
    findEventsByStudentId: (studentId, callback) => {
        const query = `
            SELECT event_id
            FROM student
            WHERE student_id = ?
        `;
        pool.query(query, [studentId], callback);
    },
    findPublicEventsByUserId: (user_id, callback) => {
        const query = `
            SELECT payment_event_id
            FROM payment_user
            WHERE user_id = ?
        `;
        pool.query(query, [user_id], callback);
    },
    findExistingCertificateRequests: (studentIds, eventIds, callback) => {
        const query = 'SELECT * FROM certificate_college WHERE certificate_college_id IN (?) AND certificate_private_event_id IN (?)';
        pool.query(query, [studentIds, eventIds], callback);
    },
    updateCollegePermission: (college_id, college_certificate_request, callback) => {
        const sql = 'UPDATE college SET college_certificate_request = ? WHERE college_id = ?';
        pool.query(sql, [college_certificate_request, college_id], callback);
    },
    updateStudentPermission: (studentId, student_certificate_request, callback) => {
        const sql = 'UPDATE student SET student_certificate_request = ? WHERE student_id = ?';
        pool.query(sql, [student_certificate_request, studentId], callback);
    },
    findStudentsByCollegeId: (collegeId, callback) => {
        const sql = 'SELECT * FROM student WHERE student_college_id = ?';
        pool.query(sql, [collegeId], (err, students) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, students);
        });
    },
    checkCollegeCertificateRequestPermission: (collegeId, callback) => {
        const sql = 'SELECT college_certificate_request FROM college WHERE college_id = ?';
        pool.query(sql, [collegeId], (err, result) => {
            if (err) {
                callback(err, null);
                return;
            }
            if (result.length === 0) {
                callback(null, false);
                return;
            }
            const hasPermission = result[0].college_certificate_request === 0;
            callback(null, hasPermission);
        });
    },
    checkStudentCertificateRequestPermission: (certificate_student_id, callback) => {
        const sql = 'SELECT c.college_certificate_request FROM college c INNER JOIN student s ON c.college_id = s.student_college_id WHERE student_id = ?';
        pool.query(sql, [certificate_student_id], (err, result) => {
            if (err) {
                callback(err, null);
                return;
            }
            if (result.length === 0) {
                callback(null, false);
                return;
            }
            const hasPermission = result[0].college_certificate_request === 1;
            console.log(hasPermission)
            callback(null, hasPermission);
        });
    },
    checkEventsPaidForCollege: (college_id, eventIds) => {
        return new Promise((resolve, reject) => {
            let count = 0;
            const checkPaymentForEvent = (index) => {
                if (index >= eventIds.length) {
                    resolve(count);
                    return;
                }
                const event_id = eventIds[index];
                const sql = 'SELECT COUNT(*) AS count FROM payment_college WHERE college_id = ? AND private_event_id = ?';
                pool.query(sql, [college_id, event_id], (err, result) => {
                    if (err) {
                        console.error('Error checking payment for college event:', err);
                        reject(err);
                        return;
                    }
                    count += result[0].count;
                    checkPaymentForEvent(index + 1);
                });
            };
            checkPaymentForEvent(0);
        });
    },
    checkEventsPaidForStudents: (student_id, eventIds) => {
        return new Promise((resolve, reject) => {
            let count = 0;
            const checkPaymentForEvent = (index) => {
                if (index >= eventIds.length) {
                    resolve(count);
                    return;
                }
                const event_id = eventIds[index];
                const sql = 'SELECT COUNT(*) AS count FROM payment_college pc INNER JOIN college c ON pc.college_id = c.college_id INNER JOIN student s ON s.student_college_id = c.college_id AND s.event_id = pc.private_event_id WHERE s.student_id = ? AND s.event_id = ?';
                pool.query(sql, [student_id, event_id], (err, result) => {
                    if (err) {
                        console.error('Error checking payment for college event:', err);
                        reject(err);
                        return;
                    }
                    count += result[0].count;
                    checkPaymentForEvent(index + 1);
                });
            };
            checkPaymentForEvent(0);
        });
    },
    findCertificateDetails: (studentId, eventId, certificateName, issuedBy) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT s.student_name AS Name, s.student_email AS Email, s.student_admno AS Admno, cl.college_name AS College, e.event_private_name AS Event,
                    '${certificateName}' AS certificate_name, '${issuedBy}' AS Issued_By, cs.expiration_date AS expiration_date
                FROM student s
                INNER JOIN college cl ON s.student_college_id = cl.college_id
                INNER JOIN event_private e ON s.event_id = e.event_private_id
                INNER JOIN certificate_stud cs ON s.student_id = cs.certificate_student_id
                WHERE s.student_id = ? AND e.event_private_id = ?;
            `;
            const params = [studentId, eventId];
    
            pool.query(query, params, (err, results) => {
                if (err) {
                    console.error('Error fetching certificate details: ' + err);
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    }    
};

module.exports = certificateModel;