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
        const query = 'SELECT * FROM event_public WHERE delete_status=0';
        pool.query(query, callback);
    },
    updatePublicEvents: (event_public_id, updatedFields, callback) => {
        const query = 'UPDATE event_public SET ? WHERE event_public_id = ?';
        pool.query(query, [updatedFields, event_public_id], callback);
    },
    searchPublicEvents: (searchTerm, callback) => {
        const query = 'SELECT e.event_public_id, e.event_public_name, e.event_public_amount, e.event_public_description, e.event_public_date, e.event_public_time, e.event_public_image, e.event_syllabus, e.event_venue, a_added.admin_username as event_addedby, a_updated.admin_username as event_updatedby, e.event_added_date, e.event_updated_date, CASE WHEN e.delete_status = 0 THEN "active" ELSE "deleted" END AS delete_status, CASE WHEN e.cancel_status = 0 THEN "active" ELSE "cancelled" END AS cancel_status FROM event_public e JOIN admin a_added ON e.event_addedby = a_added.admin_id JOIN admin a_updated ON e.event_updatedby = a_updated.admin_id where e.event_public_name LIKE ? ORDER BY e.event_public_name ASC';
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
    retrivePublicEvent: (event_public_id, callback) => {
        const query = 'UPDATE event_public SET delete_status=0 , cancel_status=0 WHERE event_public_id = ?';
        pool.query(query, [event_public_id], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    },
    viewActivePublicEvents: (callback) => {
        const query = 'SELECT e.event_public_id, e.event_public_name, e.event_public_amount, e.event_public_description, e.event_public_date, e.event_public_time, e.event_public_image, e.event_syllabus, e.event_venue, a_added.admin_username as event_addedby, a_updated.admin_username as event_updatedby, e.event_added_date, e.event_updated_date, CASE WHEN e.delete_status = 0 THEN "active" ELSE "deleted" END AS delete_status, CASE WHEN e.cancel_status = 0 THEN "active" ELSE "cancelled" END AS cancel_status FROM event_public e JOIN admin a_added ON e.event_addedby = a_added.admin_id JOIN admin a_updated ON e.event_updatedby = a_updated.admin_id where e.delete_status=0 and e.cancel_status=0 ORDER BY e.event_public_id';
        pool.query(query, callback);
    },
    viewDeletedPublicEvents: (callback) => {
        const query = 'SELECT e.event_public_id, e.event_public_name, e.event_public_amount, e.event_public_description, e.event_public_date, e.event_public_time, e.event_public_image, e.event_syllabus, e.event_venue, a_added.admin_username as event_addedby, a_updated.admin_username as event_updatedby, e.event_added_date, e.event_updated_date, CASE WHEN e.delete_status = 0 THEN "active" ELSE "deleted" END AS delete_status, CASE WHEN e.cancel_status = 0 THEN "active" ELSE "cancelled" END AS cancel_status FROM event_public e JOIN admin a_added ON e.event_addedby = a_added.admin_id JOIN admin a_updated ON e.event_updatedby = a_updated.admin_id where e.delete_status=1 and e.cancel_status=1 ORDER BY e.event_public_id';
        pool.query(query, callback);
    }
}

module.exports = publicEventModel;