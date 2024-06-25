const mysql = require("mysql")
require("dotenv").config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password:process.env.DB_PASS
})

const userModel = {
    insertUser: (userData, callback) => {
        const query = 'INSERT INTO user SET ?';
        pool.query(query, userData, callback)
    },


    userLogin: (user_email, callback) => { // Remove user_password parameter
        // Your user table needs to have an 'email' and 'password' column
        const query = 'SELECT * FROM user WHERE user_email = ? LIMIT 1'; // Assuming your table is named 'admin'
        pool.query(query, [user_email], (error, results) => {
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

    },

    findUserByName: (term, callback) => {
        if (!term) {
            return callback(null, []); // Return an empty array if the search term is empty
        }
        const query = 'SELECT * FROM user WHERE user_name LIKE ? AND user_delete_status = 0';
        const searchTermPattern = `%${term}%`;
        pool.query(query, [searchTermPattern], callback);
    },

    viewUsersFull: (callback) => {
        const query = 'SELECT * FROM user';
        pool.query(query, callback)
    },
    viewUsers:(callback)=>{
        const query='SELECT * FROM user WHERE user_delete_status=0';
        pool.query(query,callback)

    },
    deleteUsers: (user_id, callback) => {
        const query = 'UPDATE user SET user_delete_status=1 WHERE user_id = ?';
        pool.query(query, [user_id], callback);
    },

    sortStudentsByevent: (payment_event_id, callback) => {
        const query = 'SELECT * FROM user JOIN payment_user ON user.user_id = payment_user.user_id WHERE payment_user.payment_event_id=?'; // Assuming you want to sort them by name, adjust as necessary
        pool.query(query, [payment_event_id], callback);
    },
    // userModel.js

// Function to fetch user by user_id from the database
    getUserByEmail:(email, callback) => {
    const query = "SELECT * FROM user WHERE user_email = ?";
    pool.query(query, [email], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        
        // If user is found, return the user object
        if (results.length > 0) {
            return callback(null, results[0]);
        } else {
            // If user is not found, return null
            return callback(null, null);
        }
    });
},
 updatePassword : (user_email, hashedPassword, callback) => {
    const query = 'UPDATE user SET user_password = ? WHERE user_email = ?';
    pool.query(query, [hashedPassword, user_email], callback);
},
    
     findUserByEmail: (user_email, callback) => {
        const query = 'SELECT * FROM user WHERE user_email = ?';
        pool.query(query, [user_email], callback);
    },

     logUserAction : (user_id, action) => {
        const userLog = {
            user_id: user_id,
            action: action,
            date_time: new Date() // Optional: Add a timestamp for when the action was logged
        };
        pool.query("INSERT INTO user_logs SET ?", userLog, (logErr, logRes) => {
            if (logErr) {
                console.log("error: ", logErr);
                return;
            }
        });
    },
    viewUserLogs:(callback)=>{
        const query='SELECT * FROM user_logs';
        pool.query(query,callback)

    }
    

}

module.exports = userModel