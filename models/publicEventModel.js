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
    },
    searchPublicEvents: (searchTerm, callback) => {
        const query = 'SELECT * FROM event_public WHERE event_public_name LIKE ?';
        pool.query(query, [`%${searchTerm}%`], callback);
    },
    deletePublicEvent: (event_ptivate_id, callback) => {
        const query = 'UPDATE event_public SET delete_status=1 , cancel_status=1 WHERE event_public_id = ?';
        pool.query(query, [event_ptivate_id], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    },
    retrivePublicEvent: (event_ptivate_id, callback) => {
        const query = 'UPDATE event_public SET delete_status=0 , cancel_status=0 WHERE event_public_id = ?';
        pool.query(query, [event_ptivate_id], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    },
    viewPublicEventsForUser: (callback) => {
        const query = 'SELECT * FROM event_public';
        pool.query(query, callback);
    }
}

module.exports = publicEventModel;