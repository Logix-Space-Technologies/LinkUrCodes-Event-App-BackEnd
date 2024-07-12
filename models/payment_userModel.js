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
  }
}
module.exports = paymentModel;