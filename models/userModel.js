const mysql=require("mysql")
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:'',
    database:process.env.DB_NAME
})

const userModel={
    insertUser:(userData,callback)=>{
        const query='INSERT INTO user SET ?';
        pool.query(query,userData,callback)
    },

    searchUser:(email,callback)=>{
        const query='SELECT * FROM user WHERE user_email = ?';
        pool.query(query,[email],callback)
    },
    viewUsers:(callback)=>{
        const query='SELECT * FROM user';
        pool.query(query,callback)
    }
}

module.exports=userModel