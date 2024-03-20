const mysql=require('mysql')
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    password:'',
    port:process.env.DB_PORT
})

const studentModel={
    insertStudent:(studentData,callback)=>{
        const query='INSERT INTO student SET?';
        pool.query(query,studentData,callback);
    },
    viewStudent:(callback)=>{
        const query='SELECT * FROM student';
        pool.query(query,callback);
    }
}

module.exports=studentModel