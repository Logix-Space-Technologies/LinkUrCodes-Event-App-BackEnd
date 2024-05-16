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
        const query = 'SELECT e.event_private_id, e.event_private_name, e.event_private_amount, e.event_private_description, e.event_private_date, e.event_private_time, e.event_private_image, c.college_name, a_added.admin_username as event_addedby, a_updated.admin_username as event_updatedby,e.event_added_date,e.event_updated_date, CASE WHEN e.delete_status = 0 THEN "active" ELSE "deleted" END AS delete_status, CASE WHEN e.cancel_status = 0 THEN "active" ELSE "cancelled" END AS cancel_status FROM event_private e JOIN college c ON e.event_private_clgid = c.college_id JOIN admin a_added ON e.event_addedby = a_added.admin_id JOIN admin a_updated ON e.event_updatedby = a_updated.admin_id ORDER BY e.event_private_id;';
        pool.query(query, callback);
    },
    updatePrivateEvents: (event_private_id, updatedFields, callback) => {
        const query = 'UPDATE event_private SET ? WHERE event_private_id = ?';
        pool.query(query, [updatedFields, event_private_id], callback);
    },
    searchPrivateEvents: (searchTerm, callback) => {
        const query = 'SELECT * FROM event_private WHERE event_private_name LIKE ?';
        pool.query(query, [`%${searchTerm}%`], callback);
    },
    deletePrivateEvent: (event_ptivate_id, callback) => {
        const query = 'UPDATE event_private SET delete_status=1 , cancel_status=1 WHERE event_private_id = ?';
        pool.query(query, [event_ptivate_id], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    },
    retrivePrivateEvent: (event_ptivate_id, callback) => {
        const query = 'UPDATE event_private SET delete_status=0 , cancel_status=0 WHERE event_private_id = ?';
        pool.query(query, [event_ptivate_id], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    },
    viewActiveEvents: (callback) => {
        const query = 'SELECT e.event_private_id, e.event_private_name, e.event_private_amount, e.event_private_description, e.event_private_date, e.event_private_time, e.event_private_image, c.college_name, a_added.admin_username as event_addedby, a_updated.admin_username as event_updatedby, CASE WHEN e.delete_status = 0 THEN "active" ELSE "deleted" END AS delete_status, CASE WHEN e.cancel_status = 0 THEN "active" ELSE "cancelled" END AS cancel_status FROM event_private e JOIN college c ON e.event_private_clgid = c.college_id JOIN admin a_added ON e.event_addedby = a_added.admin_id JOIN admin a_updated ON e.event_updatedby = a_updated.admin_id where e.delete_status=0 and e.cancel_status=0 ORDER BY e.event_private_id;';
        pool.query(query, callback);
    },
    viewDeletedEvents: (callback) => {
        const query = 'SELECT e.event_private_id, e.event_private_name, e.event_private_amount, e.event_private_description, e.event_private_date, e.event_private_time, e.event_private_image, c.college_name, a_added.admin_username as event_addedby, a_updated.admin_username as event_updatedby, CASE WHEN e.delete_status = 0 THEN "active" ELSE "deleted" END AS delete_status, CASE WHEN e.cancel_status = 0 THEN "active" ELSE "cancelled" END AS cancel_status FROM event_private e JOIN college c ON e.event_private_clgid = c.college_id JOIN admin a_added ON e.event_addedby = a_added.admin_id JOIN admin a_updated ON e.event_updatedby = a_updated.admin_id where e.delete_status=1 and e.cancel_status=1 ORDER BY e.event_private_id;';
        pool.query(query, callback);
    },
    viewEventSByCollege: (event_clgid, callback) => {
        const event_private_clgid =event_clgid.event_private_clgid
        const query = 'SELECT e.event_private_id, e.event_private_name, e.event_private_amount, e.event_private_description, e.event_private_date, e.event_private_time, e.event_private_image, c.college_name, a_added.admin_username as event_addedby, a_updated.admin_username as event_updatedby,e.event_added_date,e.event_updated_date, CASE WHEN e.delete_status = 0 THEN "active" ELSE "deleted" END AS delete_status, CASE WHEN e.cancel_status = 0 THEN "active" ELSE "cancelled" END AS cancel_status FROM event_private e JOIN college c ON e.event_private_clgid = c.college_id JOIN admin a_added ON e.event_addedby = a_added.admin_id JOIN admin a_updated ON e.event_updatedby = a_updated.admin_id WHERE event_private_clgid  = ?';
        console.log("test", query)
        pool.query(query, [event_private_clgid], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            console.log('Query result:', result);
            callback(null, result);
        });
    }

}

module.exports = privateEventModel;