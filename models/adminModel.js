const mysql = require("mysql")
require("dotenv").config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS
})

const adminModel = {
  insertAdmin: (adminData, callback) => {
    const query = 'INSERT INTO admin SET?';
    pool.query(query, adminData, callback);
  },
  viewAdmin: (callback) => {
    const query = 'SELECT * FROM admin';
    pool.query(query, callback);
  },
  loginAdmin: (admin_username, callback) => {
    const query = 'SELECT * FROM admin WHERE admin_username = ? LIMIT 1'; // Assuming your table is named 'admin'
    pool.query(query, [admin_username], (error, results) => {
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

  logAdminAction: (admin_id, action) => {
    const adminLog = {
      admin_id: admin_id,
      action: action
    };
    pool.query("INSERT INTO admin_logs SET ?", adminLog, (logErr, logRes) => {
      if (logErr) {
        console.log("error: ", logErr);
        return;
      }
    });
  },

  insertPayment: (paymentData, callback) => {
    const query = 'INSERT INTO payment_college (college_id, private_event_id, amount, invoice_no) VALUES (?, ?, ?, ?)';
    const values = [paymentData.college_id, paymentData.private_event_id, paymentData.amount, paymentData.invoice_no];
    pool.query(query, values, callback);
  },
  getCollegeNameById: (college_id, callback) => {
    const query = 'SELECT college_name FROM college WHERE college_id = ?';
    pool.query(query, [college_id], (error, results) => {
      if (error) {
        return callback(error);
      }
      if (results.length > 0) {
        callback(null, results[0].college_name);
      } else {
        callback(new Error('College not found'));
      }
    });
  },
  getAllPayments: (callback) => {
    const query = `SELECT p.payment_college_id AS paymentId,c.college_name AS College,e.event_private_name AS Event,
               e.event_private_description AS EventDescription,p.amount AS Amount,p.invoice_no AS Invoice,
               p.college_payment_date AS Date FROM payment_college p INNER JOIN college c ON p.college_id = c.college_id
        INNER JOIN event_private e ON p.private_event_id = e.event_private_id;`;
    pool.query(query, callback);
  },
  viewAdminLogs: (callback) => {
    const query = 'SELECT a.admin_username,al.action,al.date_time FROM admin_logs al JOIN admin a ON al.admin_id=a.admin_id';
    pool.query(query, callback);
  }
};


module.exports = adminModel;