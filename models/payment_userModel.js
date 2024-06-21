const mysql = require("mysql")
require("dotenv").config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS
});

// const paymentModel = {
//     insertPayment: (data, callback) => {
//       const query = 'INSERT INTO payment_user (user_id, payment_event_id, payment_amount, currency, order_id, razorpay_order_id, status) VALUES (?, ?, ?, ?, ?, ?, "created")';
//       const params = [data.user_id, data.payment_event_id, data.payment_amount, data.currency, data.order_id, data.razorpay_order_id];
//       pool.query(query, params, callback);
//     },
//     updatePayment: (data, callback) => {
//       const query = `UPDATE payment_user SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'captured', updated_at = CURRENT_TIMESTAMP WHERE razorpay_order_id = ?`;
//       const params = [data.razorpay_payment_id, data.razorpay_signature, data.razorpay_order_id];
//       pool.query(query, params, callback);
//     },
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

 updatePaymentUserStatus :(orderId, paymentId, signature, status, callback) => {
  const query = 'UPDATE payment_user SET razorpay_payment_id = ?, razorpay_signature = ?, status = ?, updated_at = ? WHERE order_id = ?';
  pool.query(query, [paymentId, signature, status, new Date(), orderId], callback);
},









    // {
    //     insertpayment: (payment_user_id,payment_event_id,callback)=>{
    //         const query='INSERT INTO payment_user (user_id, payment_event_id, payment_amount) SELECT ?,event_public_id,event_public_amount FROM event_public WHERE event_public_id = ?;';
    //         pool.query(query,[payment_user_id,payment_event_id],callback)
    //     },


    viewPayments: (callback) => {
        const query = 'SELECT * FROM payment_user';
        pool.query(query, callback)
    }
}
module.exports = paymentModel;