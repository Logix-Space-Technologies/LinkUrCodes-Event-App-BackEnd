const mysql = require("mysql")
require("dotenv").config()
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

const eventModel = {
    insertEvents: (eventData, callback) => {
        const query = 'INSERT INTO event SET ?';
        pool.query(query, eventData, callback);
    },
    viewEvents: (callback) => {
        const query = 'SELECT * FROM event';
        pool.query(query, callback);
    }
   
}

module.exports = eventModel;