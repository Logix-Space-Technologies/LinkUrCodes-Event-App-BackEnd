
const express = require("express")
const userModel = require("../models/userModel")
const validateModel = require("../models/validateModel")
const mailerModel = require("../models/mailerModel")
const uploadModel = require("../models/uploadModel")
const bcrypt = require("bcryptjs")
const publicEventModel = require("../models/publicEventModel")


const { error } = require("console");

const jwt = require("jsonwebtoken")
const UploadModel = require("../models/uploadModel")


hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}

const hashPasswordGenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pass, salt)
}


// Function to remove expired verification codes
function removeExpiredCodes() {
    console.log("Checking for expired verification codes...");
    const currentTime = Date.now();
    for (const email in verificationCodes) {
        if (currentTime - verificationCodes[email].timestamp > codeExpirationThreshold) {
            console.log(`Expired code found for ${email}. Removing...`);
            delete verificationCodes[email];
        }
    }
}

const router = express.Router()


router.post('/signup', UploadModel.UserImageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ status: "file not chosen", message: "Choose a file" });
        }

        let { data } = { "data": req.body };
        let password = data.user_password;
        let email = data.user_email;
        const hashedPassword = await hashPasswordgenerator(password);
        data.user_password = hashedPassword;
        const imagePath = req.file.path;
        const newData = {
            user_name: data.user_name,
            user_email: data.user_email,
            user_password: data.user_password,
            user_contact_no: data.user_contact_no,
            user_image: imagePath,
            user_qualification: data.user_qualification,
            user_skills: data.user_skills
        };

        const { isValid, message } = await validateModel.validateAndCheckEmail(email);
        if (!isValid) {
            return res.json({
                status: "enter Password",
                message: "Password should be 8 characters long with at least one uppercase, lowercase, special character, and a digit"
            });
        }
        if (!validateModel.validatePassword(password)) {
            console.log("pass")
            return res.json({
                status: "check Password",
                message: "Password should be 8 characters long with at least one uppercase, lowercase, special character, and a digit"
            });
        }

        // Insert the user into the database
        userModel.insertUser(newData, async (error, results) => {
            if (error) {
                res.status(500).send('Error inserting user data: ' + error);
                return;
            }

            try {
                let user_name = newData.user_name;
                let textContent = `Dear ${user_name},\n\nYou have successfully registered.`;
                let subjectheading = 'Successfully Registered';

                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Registration Successful</title>
                        <style>
                            body { background-color: #faf4f4; color: #140101; font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                            .container { border-radius: 8px; background-color: #ece9e9; padding: 20px; margin: 20px auto; max-width: 600px; }
                            .logo-header img { max-width: 30%; height: auto; }
                            .content { margin-top: 20px; border: 2px solid #a3a0a0; padding: 20px; }
                            h2 { text-align: center; }
                            .footer { text-align: center; margin-top: 30px; font-size: smaller; color: grey; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="logo-header">
                                <img src="https://www.linkurcodes.com/images/logo.png" alt="Link Ur Codes Logo">
                            </div>
                            <div class="content">
                                <h2>Registration Successful</h2>
                                <p>Dear ${user_name},</p>
                                <p>You have successfully registered.</p>
                                <p>Note: You can update your profile at any time.</p>
                                <p>Best regards,</p>
                                <p>Link Ur Codes Team</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Link Ur Codes. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // Send registration email
                await mailerModel.sendEmail(email, subjectheading, htmlContent, textContent);
                userModel.logUserAction(results.insertId, 'User Signup');
                return res.json({ status: "success", message: "Message has been sent to your email" });
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
            jwt.sign({ email: user_email }, "user-eventapp", { expiresIn: "1d" },
                (error, token) => {
                    if (error) {
                        res.json({
                            status: "error",
                            "error": error
                        })
                    } else {
                        userModel.logUserAction(user.user_id, 'User logged in');
                        return res.json({
                            status: "Success",
                            userData: user, "token": token
                        });
                    }
                })
        });
    });
});
//route to view a user

router.post('/searchusers', (req, res) => {
    const term = req.body.term;
    const token = req.headers["token"];

    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (error) {
            return res.status(401).json({
                status: "Unauthorized user",
                message: "Invalid token"
            });
        }

        if (decoded && decoded.adminUsername) {
            userModel.findUserByName(term, (error, results) => {
                if (error) {
                    return res.status(500).send('Error retrieving user data');
                }

                if (results.length > 0) {
                    // Log the search action for the admin user
                    userModel.logUserAction(decoded.adminUsername, 'Search Users');
                    return res.status(200).json(results);
                } else {
                    return res.status(404).json({
                        status: 'No users found'
                    });
                }
            });
        } else {
            return res.status(401).json({
                status: "Unauthorized user",
                message: "Admin privileges required"
            });
        }
    });
});



router.post('/viewusers', (req, res) => {
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            userModel.viewUsers((error, results) => {
                if (error) {
                    res.status(500).send('Error fetching users:' + error)
                    return
                }
                res.status(200).json(results);

            })
        } else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    })
})

router.post('/delete-users', (req, res) => {
    const user_id = req.body.user_id; // Extract user_id from req.body

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required in the request body' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            userModel.deleteUsers(user_id, (error, result) => {
                if (error) {
                    console.error('Error deleting user:', error);
                    res.status(500).json({ status: "success", error: 'Internal Server Error' });
                } else {
                    if (result.affectedRows > 0) {
                        console.log('User deleted successfully');
                        res.status(200).json({ status: "success", message: 'User deleted successfully' });
                    } else {
                        console.log('User not found');
                        res.status(404).json({ status: "error", error: 'User not found' });
                    }
                }
            });
        }
        else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    })
});

router.post('/sortuserbyeventid', (req, res) => {
    const { payment_event_id } = req.body; // Assuming the event_id is provided in the request body
    console.log("hai"); // Correctly using console.log here

    if (!payment_event_id) {
        return res.status(400).json({ message: 'Event ID is required' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            userModel.sortStudentsByevent(payment_event_id, (error, users) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                res.json({ users });
            });
        }
        else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    })
});

// Route to view logged-in user's profile
router.post('/view-user-profile', (req, res) => {
    const token = req.headers["token"];

    // Verify the token
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.status(401).json({ status: "Unauthorized" });
        }

        // Extract user_email from the decoded token
        const user_email = decoded.email;

        // Fetch user information from the database based on user_email
        userModel.getUserByEmail(user_email, (error, user) => {
            if (error) {
                console.error('Error fetching user data:', error);
                return res.status(500).json({ status: "Internal Server Error" });
            }

            if (!user) {
                // If user not found
                return res.status(404).json({ status: "User Not Found" });
            }

            // Prepare response data
            const responseData = {
                name: user.user_name,
                email: user.user_email,
                contact: user.user_contact_no,
                image: user.user_image,
                qualification: user.user_qualification,
                skills: user.user_skills

                // Add more fields as needed
            };

            return res.json(responseData);
        });
    });
});

// Temporary storage for verification codes
const verificationCodes = {};

// Time threshold for code expiration (in milliseconds)
const codeExpirationThreshold = 300000; // 5 minutes

// Route for resetting password using verification code
router.post("/forgotpassword", async (req, res) => {
    try {
        const { user_email } = req.body;
        const subjectheading = 'Password Reset';

        userModel.findUserByEmail(user_email, async (error, user) => {
            if (error) {
                return res.json({ status: "success", message: error.message });
            }
            if (!user) {
                return res.json({ status: "Invalid user email", message: "Invalid user email" });
            }
            try {
                // Generate a random 6-digit number
                const randomCode = Math.floor(100000 + Math.random() * 900000);

                // Store the code with timestamp
                verificationCodes[user_email] = {
                    code: randomCode,
                    timestamp: Date.now()
                };

                let user_name = user.user_name;
                let sending_email = user_email;
                let textContent = `Dear ${user_name},\n\nYou have requested to reset your password. Your verification code is: ${randomCode}.\n\nPlease use this code to reset your password. If you did not request this, please contact the administrator.`;

                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Password Reset</title>
                        <style>
                            body { background-color: #faf4f4; color: #140101; font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                            .container { border-radius: 8px; background-color: #ece9e9; padding: 20px; margin: 20px auto; max-width: 600px; }
                            .logo-header img { max-width: 30%; height: auto; }
                            .content { margin-top: 20px; border: 2px solid #a3a0a0; padding: 20px; }
                            h2 { text-align: center; }
                            .footer { text-align: center; margin-top: 30px; font-size: smaller; color: grey; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="logo-header">
                                <img src="https://www.linkurcodes.com/images/logo.png" alt="Link Ur Codes Logo">
                            </div>
                            <div class="content">
                                <h2>Password Reset</h2>
                                <p>Dear ${user_name},</p>
                                <p>You have requested to reset your password. Your verification code is: <strong style="color: blue;">${randomCode}</strong>.</p>
                                <p>Please use this code to reset your password. If you did not request this, please contact the administrator.</p>
                                <p>Best regards,</p>
                                <p>Link Ur Codes Team</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Link Ur Codes. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // Send password reset email
                await mailerModel.sendEmail(sending_email, subjectheading, htmlContent, textContent);

                return res.json({ status: "success", message: "Password reset message has been sent to your email" });
            } catch (error) {
                return res.json({ status: "error", message: error.message });
            }
        });
    } catch (error) {
        return res.json({ status: "error", message: error.message });
    }
});



router.put('/updatePassword', async (req, res) => {
    try {
        const { user_email, verification_code, user_password } = req.body;
        // Check if all required fields are provided
        if (!user_email || !verification_code || !user_password) {
            return res.json({ status: "all fields required", message: 'Email, verification code, and new password are required' });
        }

        // Check if the email exists in the database
        userModel.findUserByEmail(user_email, async (error, user) => {
            if (error) {
                return res.status(500).json({ status: 'error', message: error.message });
            }

            if (!user) {
                // Email not found in the table
                return res.status(404).json({ status: 'Invalid email', message: 'Invalid email' });
            }

            // Check if verification code matches the stored code and has not expired
            const verificationData = verificationCodes[user_email];
            if (!verificationData || verificationData.code !== parseInt(verification_code)) {
                return res.json({ status: "invalid", message: "Invalid or expired verification code" });
            }

            const currentTime = Date.now();
            if (currentTime - verificationData.timestamp > codeExpirationThreshold) {
                delete verificationCodes[user_email]; // Remove expired verification code
                return res.json({ status: "expired", message: "Verification code has expired" });
            }

            try {
                // Hash the new password
                const hashedNewPassword = await hashPasswordGenerator(user_password);

                // Update the password in the database
                userModel.updatePassword(user_email, hashedNewPassword, (error, updateResult) => {
                    if (error) {
                        return res.json({ status: 'error', message: error.message });
                    }
                    // Password updated successfully
                    res.json({ status: 'success', message: 'Password updated successfully' });

                    // Remove the verification code after password update
                    delete verificationCodes[user_email];
                });
            } catch (error) {
                return res.json({ status: 'error', message: error.message });
            }
        });
    } catch (err) {
        res.json({ status: 'error', message: err.message });
    }
});

router.post('/viewPublicSession', (req, res) => {
    const token = req.headers["token"];
    // Verify the token
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.json({ status: "Unauthorized" });
        }
        const { event_public_id } = req.body;

        publicEventModel.viewSession(event_public_id, (err, results) => {
            if (err) {
                return res.json({ "status": "error", "message": err.message });
            }

            // Format the session_date for each result
            const formattedResults = results.map(session => {
                const sessionDate = new Date(session.session_date);
                const formattedDate = `${sessionDate.getDate().toString().padStart(2, '0')}-${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}-${sessionDate.getFullYear()}`;
                session.session_date = formattedDate; // DD-MM-YYYY format
                return session;
            });

            res.json({ "data": formattedResults });
        });
    });
});



module.exports = router