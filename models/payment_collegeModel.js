const mysql=require("mysql")
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:'',
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
});

const paymentcollegeModel={
    insertpayment: (paymentData,callback)=>{
        const query='INSERT INTO payment_college SET ?';
        pool.query(query,paymentData,callback)
    },


    viewPayments:(callback)=>{
        const query='SELECT * FROM payment_college';
        pool.query(query,callback)
    }
}
module.exports=paymentcollegeModel;