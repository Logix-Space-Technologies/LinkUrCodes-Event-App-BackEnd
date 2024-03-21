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
    }
   
}

module.exports = publicEventModel;