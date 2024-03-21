const mysql = require("mysql")
require("dotenv").config()
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

const publicEventModel = {
    insertPublicEvents: (eventData, callback) => {
        const query = 'INSERT INTO event_public SET ?';
        pool.query(query, eventData, callback);
    },
    viewPublicEvents: (callback) => {
        const query = 'SELECT * FROM event_public';
        pool.query(query, callback);
    },
    updatePublicEvents: (event_public_id, updatedFields, callback) => {
        const query = 'UPDATE event_public SET ? WHERE event_public_id = ?';
        pool.query(query, [updatedFields, event_public_id], callback);
    }
   
}

module.exports = publicEventModel;