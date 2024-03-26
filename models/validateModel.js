// validationModel.js

const validationModel = {
    // Validate password complexity
    validatePassword: function(password) {
        // Check if the length is exactly 8 characters
        if (password.length !== 8) {
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
    }
};

module.exports = validationModel;