const mysql = require("mysql")
require("dotenv").config()
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

const privateEventModel = {
    insertPrivateEvents: (eventData, callback) => {
        const query = 'INSERT INTO event_private SET ?';
        pool.query(query, eventData, callback);
    },
    viewPrivateEvents: (callback) => {
        const query = 'SELECT * FROM event_private';
        pool.query(query, callback);
    },
    updatePrivateEvents: (event_private_id, updatedFields, callback) => {
        const query = 'UPDATE event_private SET ? WHERE event_private_id = ?';
        pool.query(query, [updatedFields, event_private_id], callback);
    }
   
}

module.exports = privateEventModel;