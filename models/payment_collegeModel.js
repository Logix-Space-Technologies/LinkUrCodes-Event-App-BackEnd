const mysql=require("mysql")
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
    password:process.env.DB_PASS
});

const paymentcollegeModel={
    insertpayment: (paymentData,callback)=>{
        const query='INSERT INTO payment_college SET ?';
        pool.query(query,paymentData,callback)
    },


    viewPayments:(callback)=>{
        const query='SELECT * FROM payment_college';
        pool.query(query,callback)
    },
    sortPaymentByEventdate: (event_private_date,callback) => {
        const query = 'SELECT  c.college_id,  c.college_name, pc.college_payment_date, pe.event_private_name,  pe.event_private_date FROM  payment_college pc JOIN event_private pe ON pc.private_event_id = pe.event_private_id JOIN  college c ON pc.college_id = c.college_id WHERE MONTH(pe.event_private_date) = ? ORDER BY pe.event_private_date LIMIT  0, 25';
        // Assuming you want to sort them by name, adjust as necessary
        pool.query(query,event_private_date, callback);
    },
}
module.exports=paymentcollegeModel;