const mysql = require('mysql2/promise');
require('dotenv').config();

// Note: mysql2's createPool is Promise-aware
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const validationModel = {
    validateAndCheckEmail: async function (email) {
        // Validate email format first
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: "Invalid email format" };
        }

        try {
            // Adjusted to use mysql2's promise-based query execution
            const [rows] = await pool.query('SELECT COUNT(*) AS count FROM user WHERE user_email = ?', [email]);
            if (rows[0].count > 0) {
                return { isValid: false, message: "Email already exists" };
            }
            return { isValid: true, message: "" };
        } catch (error) {
            console.error('Error checking email existence:', error);
            return { isValid: false, message: "Error validating email" };
        }
    },
    validatePassword: function(password) {
        // Check if the length is exactly 8 characters
        if (password.length < 8) {
            return false;
        }

        // Regular expressions for checking different criteria
        const uppercaseCheck = /[A-Z]/;
        const lowercaseCheck = /[a-z]/;
        const digitCheck = /[0-9]/;
        const specialCharCheck = /[^A-Za-z0-9]/;

        // Check if the password meets all the criteria
        if (!uppercaseCheck.test(password) ||
            !lowercaseCheck.test(password) ||
            !digitCheck.test(password) ||
            !specialCharCheck.test(password)) {
            return false;
        }

        return true;
    },

   

    // validatePhoneNumber: function (phoneNumber) {
    //     // Basic regex for phone number validation - adjust as necessary for specific requirements
    //     const phoneCheck = /^\+?[1-9]\d{1,14}$/; // E.164 format
    //     return phoneCheck.test(phoneNumber);
    // },
    validateName: function (name) {
        // Allows letters, spaces, apostrophes, and hyphens. Adjust as needed.
        const nameCheck = /^[A-Za-z\s'-]+$/;
        return nameCheck.test(name);
    }
};

module.exports = validationModel;