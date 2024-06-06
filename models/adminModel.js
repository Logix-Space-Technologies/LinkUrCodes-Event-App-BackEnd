const mysql=require("mysql")
require("dotenv").config()

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
    password:process.env.DB_PASS
})

const adminModel={
    insertAdmin:(adminData,callback)=>{
        const query='INSERT INTO admin SET?';
        pool.query(query,adminData,callback);
    },
    viewAdmin:(callback)=>{
        const query='SELECT * FROM admin';
        pool.query(query,callback);
    },
    loginAdmin: (admin_username, callback) => {
        const query = 'SELECT * FROM admin WHERE admin_username = ? LIMIT 1'; // Assuming your table is named 'admin'
        pool.query(query, [admin_username], (error, results) => {
          if (error) {
            return callback(error, null);
          }
          // If no admin found, results array will be empty
          if (results.length === 0) {
            return callback(null, null);
          }
          // Return the first admin found (there should only be one due to the 'LIMIT 1' in the query)
          return callback(null, results[0]);
        });
      },

      logAdminAction: (admin_id, action) => {
        const adminLog = {
            admin_id: admin_id,
            action: action
        };
        pool.query("INSERT INTO admin_logs SET ?", adminLog, (logErr, logRes) => {
            if (logErr) {
                console.log("error: ", logErr);
                return;
            }
        });
    },

};
   

module.exports=adminModel;