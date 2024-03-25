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


    userLogin: (user_email, callback) => { // Remove user_password parameter
        // Your user table needs to have an 'email' and 'password' column
        const query = 'SELECT * FROM user WHERE user_email = ? LIMIT 1'; // Assuming your table is named 'admin'
        pool.query(query, [user_email],(error, results) => {
          if (error) {
            return callback(error, null);
          }
          // If no user found, results array will be empty
          if (results.length === 0) {
            return callback(null, null);
          }
          // Return the first user found (there should only be one due to the 'LIMIT 1' in the query)
          return callback(null, results[0]);
      });
    }
    ,
    


    searchUser:(email,callback)=>{
        const query='SELECT * FROM user WHERE user_email = ?';
        pool.query(query,[email],callback)
    },
    viewUsers:(callback)=>{
        const query='SELECT * FROM user';
        pool.query(query,callback)
    },
    deleteUsers: (user_id, callback) => {
        const query = 'DELETE FROM user WHERE user_id = ?';
        pool.query(query, [user_id], callback);
    }
}

module.exports=userModel