const mysql = require("mysql")
require("dotenv").config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS
});

const paymentModel = {
  insertPaymentUser: (paymentUser, callback) => {
    const query = 'INSERT INTO payment_user SET ?';
    pool.query(query, paymentUser, (error, results) => {
      if (error) {
        console.error('Error inserting payment details:', error);
        return callback(error);
      }
      console.log('Inserted payment details successfully:', results);
      callback(null, results);
    });
  },

  viewPayments: (callback) => {
    const query = 'SELECT * FROM payment_user';
    pool.query(query, callback)
  },

  viewPaymentHistory: (email, callback) => {
    const query = `
      SELECT 
        pu.payment_amount, 
        pu.payment_date, 
        pu.status, 
        ep.event_public_name, 
        ep.event_public_image 
      FROM 
        payment_user pu 
      JOIN 
        event_public ep ON pu.payment_event_id = ep.event_public_id 
      JOIN 
        user u ON pu.user_id = u.user_id 
      WHERE 
        u.user_email = ?
      ORDER BY pu.payment_date DESC
    `;

    pool.query(query, [email], (error, results) => {
      if (error) {
        return callback(error, null);
      }

      // Return all payment history records for the user
      return callback(null, results);
    });
  },

  viewUserPaymentHistory: (callback) => {
    const query = 'SELECT p.payment_user_id, p.user_id,u.user_name,u.user_email,u.user_contact_no, p.payment_event_id, e.event_public_name, p.payment_amount,p.payment_date, p.order_id, p.currency, p.status, p.created_at, p.updated_at,p.razorpay_signature, p.notes FROM payment_user p JOIN user u ON p.user_id = u.user_id JOIN event_public e ON p.payment_event_id = e.event_public_id ORDER BY p.payment_user_id DESC';
    pool.query(query, callback)
  }

}
module.exports = paymentModel;