
const express = require("express")
const userModel = require("../models/userModel")
const bcrypt = require("bcryptjs")
const nodemailer = require('nodemailer');

hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}

const router = express.Router()

// Function to validate password
function validatePassword(password) {
    // Check if the length is at most 8 characters
    if (password.length !== 8) {
        return false;
    }

    // Regular expressions for checking different criteria
    const uppercaseCheck = /[A-Z]/;
    const lowercaseCheck = /[a-z]/;
    const digitCheck = /[0-9]/;
    const specialCharCheck = /[^A-Za-z0-9]/;

    // Check if the password contains at least one uppercase letter
    if (!uppercaseCheck.test(password)) {
        return false;
    }

    // Check if the password contains at least one lowercase letter
    if (!lowercaseCheck.test(password)) {
        return false;
    }

    // Check if the password contains at least one digit
    if (!digitCheck.test(password)) {
        return false;
    }

    // Check if the password contains at least one special character
    if (!specialCharCheck.test(password)) {
        return false;
    }

    return true;
}





const transporter = nodemailer.createTransport({
    // Configuration for your email service provider
    service: 'gmail',
    auth: {
        user: process.env.DB_USER_EMAIL, // Your email address
        pass: process.env.DB_USER_PASS // Your email password (or app password if 2-factor authentication is enabled)
    }
});

// Route for signing up a new user
router.post('/signup', async (req, res) => {
    try {
        let { data } = { "data": req.body };
        let password = data.user_password;

        if (!validatePassword(password)) {
            return res.status(400).send('Invalid password.Password should be 8 character long with atleast one uppercase,lowercase,special character and a digit');
        }
        


        const hashedPassword = await hashPasswordgenerator(password);
        data.user_password = hashedPassword;

        // Insert the user into the database
        userModel.insertUser(data, (error, results) => {
            if (error) {
                res.status(500).send('Error inserting user data: ' + error);
                return;
            }

            // Send a welcome email
            const mailOptions = {
                from: process.env.DB_USER_EMAIL, // Sender's email address
                to: data.user_email, // Recipient's email address
                subject: 'Welcome!', // Email subject
                text: `Dear ${data.user_name},\n\nWelcome to our platform! We're excited to have you as a new user.\n\nBest regards,\nThe Team` // Email body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending welcome email:', error);
                    
                } else {
                    console.log('Welcome email sent:', info.response);
                    
                }
            });

            res.status(201).send('User added with ID: ' + results.insertId+'\nPlease check your mailbox');
        });
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }2
});


router.post('/loginuser', (req, res) => {
    const { user_email, user_password } = req.body;

    userModel.userLogin(user_email, (error, user) => { 
        if (error) {
            return res.json({
                status: "Error"
            });
        }
        if (!user) {
            return res.json({
                status: "Invalid Email ID"
            });
        }
        // Compare the password retrieved from the database with the provided password
        bcrypt.compare(user_password, user.user_password, (err, isMatch) => {
            if (err) {
                return res.json({
                    status: "Error"
                });
            }
            if (!isMatch) {
                return res.json({
                    status: "Invalid Password"
                });
            }
            // Successful login
            return res.json({
                status: "Success",
                userData: user
            });
        });
    });
});



//route to view a user
router.post('/searchusers', (req, res) => {
    var useremail = req.body.user_email;

    userModel.searchUser(useremail, (error, results) => {
        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).json({
                status: "Internal Server Error"
            });
        }

        if (results.length === 0) {
            // If no user found with the provided ID
            return res.status(404).json({
                status: "User Not Found"
            });
        }

        // Assuming there is only one matching row, extract user data
        const userData = results[0];

        // Prepare response data
        const responseData = {
            name: userData.user_name,
            email: userData.user_email
        };

        console.log(responseData);

        return res.json(responseData);
    });
});


router.get('/viewusers', (req, res) => {
    userModel.viewUsers((error, results) => {
        if (error) {
            res.status(500).send('Error fetching users:' + error)
            return
        }
        res.status(200).json(results);
    })
})

router.get('/viewusers',(req,res)=>{
    userModel.viewUsers((error,results)=>{
      if(error){
        res.status(500).send('Error fetching users:'+error)
        return
      }
      res.status(200).json(results);

    })
})

  router.post('/delete-users', (req, res) => {
    const user_id = req.body.user_id; // Extract user_id from req.body

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required in the request body' });
    }

    userModel.deleteUsers(user_id, (error, result) => {
        if (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (result.affectedRows > 0) {
                console.log('User deleted successfully');
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                console.log('User not found');
                res.status(404).json({ error: 'User not found' });
            }
        }
    });
});


module.exports = router
