const mysql=require("mysql")
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
    password:process.env.DB_PASS
});

const paymentModel={
    insertpayment: (payment_user_id,payment_event_id,callback)=>{
        const query='INSERT INTO payment_user (user_id, payment_event_id, payment_amount) SELECT ?,event_public_id,event_public_amount FROM event_public WHERE event_public_id = ?;';
        pool.query(query,[payment_user_id,payment_event_id],callback)
    },


    viewPayments:(callback)=>{
        const query='SELECT * FROM payment_user';
        pool.query(query,callback)
    }
}
module.exports=paymentModel;