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
    }
}
module.exports = paymentModel;