const mysql=require("mysql")
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
})

const adminModel={
    insertAdmin:(adminData,callback)=>{
        const query='INSERT INTO admin SET?';
        pool.query(query,adminData,callback);
    },
    viewAdmin:(callback)=>{
        const query='SELECT * FROM admin';
        pool.query(query,callback);
    }
   
}


module.exports=adminModel;