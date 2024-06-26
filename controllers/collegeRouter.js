const express = require('express');
const collegeModel = require('../models/collegeModel');
const studentModel = require("../models/studentModel")
const multer = require('multer');
const moment = require('moment-timezone');
const xlsx = require('xlsx');
const fs = require('fs');
const axios = require('axios');
const validateModel = require("../models/validateModel")
const router = express.Router();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require('path');
const uploadModel = require("../models/uploadModel")
const privateEventModel = require("../models/privateEventModel")
const { sendEmail } = require('../models/mailerModel');
const departmentModel = require('../models/departmentModel');
const mailerModel = require("../models/mailerModel")
const adminModel = require("../models/adminModel")

hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}

const hashPasswordGenerator = async (pass) => {
    console.log(pass)
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



// Route to add a new College
router.post('/addCollege', uploadModel.CollegeImageupload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        let { data } = { "data": req.body };
        const imagePath = req.file.path;

      
        const newData = {
            college_name: data.college_name,
            college_email: data.college_email,
            college_phone: data.college_phone,
            college_website: data.college_website,
            college_password: data.college_phone,
            college_image: imagePath,
            college_addedby: data.college_addedby,
            college_updatedby: data.college_addedby
        }
        
        const token = req.headers["token"];
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                collegeModel.insertCollege(newData, (error, results) => {
                    if (error) {
                        res.json({ "status": "error", "error": error });
                        return;
                    }
                    //log action
                    adminModel.logAdminAction(data.college_addedby, `Added college: ${newData.college_name} `);
                    res.json({
                        "status": "success"
                    });
                });
            } else {
                res.json({
                    "status": "Unauthorized user"
                });
            }
        });
    } catch (error) {
        console.error('Error in addCollege route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/addDepartment', async (req, res) => {
    try {
        let data = req.body;
        const newData = {
            college_id: data.college_id,
            department_name: data.department_name,
            faculty_name: data.faculty_name,
            faculty_email: data.faculty_email,
            faculty_phone: data.faculty_phone,
            faculty_password: data.faculty_phone // This will be hashed in the model
        };

        const token = req.headers["token"];
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                // Check if the college_id exists
                collegeModel.findCollegeById(newData.college_id, (err, result) => {
                    if (err || !result.length) {
                        res.status(400).json({ status: "error", message: "Invalid college_id. College does not exist." });
                        return;
                    }

                    // If college_id exists, proceed with department insertion
                    departmentModel.insertDepartment(newData, async (error, results) => {
                        if (error) {
                            res.json({ "status": "error", "error": error });
                            return;
                        }

                        try {
                            const faculty_name = newData.faculty_name;
                            const faculty_email = newData.faculty_email;
                            const textContent = `
                  Dear ${faculty_name},
  
                  You have successfully registered as a faculty member.
  
                  Username: ${faculty_email}
                  Password is your phone number
  
                  Note: You can reset your password at any time.
  
                  Best regards,
                  Link Ur Codes Team
                `;
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
                        <p>Dear ${faculty_name},</p>
                        <p>You have successfully registered as a faculty member.</p>
                        <p><strong>Username:</strong> ${faculty_email}</p>
                        <p><strong>Password:</strong> Your phone number</p>
                        <p>Note: You can reset your password at any time.</p>
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

                            // Send confirmation email
                            await mailerModel.sendEmail(faculty_email, 'Successfully Registered', htmlContent, textContent);
                            collegeModel.logCollegeAction(data.college_id, `Added Department: ${newData.department_name} `);
                            res.json({ "status": "success", "message": "Department added, message has been sent to the faculty's email" });
                        } catch (emailError) {
                            res.status(500).json({ "status": "error sending mail", "error": emailError.message });
                        }
                    });
                });
            } else {
                res.json({ "status": "Unauthorized user" });
            }
        });
    } catch (error) {
        console.error('Error in addDepartment route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/addFaculty', async (req, res) => {
    try {
        let data = req.body;
        const newData = {
            college_id: data.college_id,
            department_name: data.department_name,
            faculty_name: data.faculty_name,
            faculty_email: data.faculty_email,
            faculty_phone: data.faculty_phone,
            faculty_password: data.faculty_phone // This will be hashed in the model
        };

        const collegetoken = req.headers["collegetoken"];
        jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
            if (error) {
                return res.json({ "status": "error", "message": "Failed to verify token" });
            }
            if (decoded && decoded.faculty_email) {
                // Check if the college_id exists
                collegeModel.findCollegeById(newData.college_id, (err, result) => {
                    if (err || !result.length) {
                        res.status(400).json({ status: "error", message: "Invalid college_id. College does not exist." });
                        return;
                    }

                    // If college_id exists, proceed with department insertion
                    departmentModel.insertDepartment(newData, async (error, results) => {
                        if (error) {
                            res.json({ "status": "error", "error": error });
                            return;
                        }

                        try {
                            const faculty_name = newData.faculty_name;
                            const faculty_email = newData.faculty_email;
                            const textContent = `
                  Dear ${faculty_name},
  
                  You have successfully registered as a faculty member.
  
                  Username: ${faculty_email}
                  Password is your phone number
  
                  Note: You can reset your password at any time.
  
                  Best regards,
                  Link Ur Codes Team
                `;
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
                        <p>Dear ${faculty_name},</p>
                        <p>You have successfully registered as a faculty member.</p>
                        <p><strong>Username:</strong> ${faculty_email}</p>
                        <p><strong>Password:</strong> Your phone number</p>
                        <p>Note: You can reset your password at any time.</p>
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

                            // Send confirmation email
                            await mailerModel.sendEmail(faculty_email, 'Successfully Registered', htmlContent, textContent);
                            res.json({ "status": "success", "message": "Department added, message has been sent to the faculty's email" });
                        } catch (emailError) {
                            res.status(500).json({ "status": "error sending mail", "error": emailError.message });
                        }
                    });
                });
            } else {
                res.json({ "status": "Unauthorized user" });
            }
        });
    } catch (error) {
        console.error('Error in addDepartment route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post("/departmentLogin", async (req, res) => {
    try {
        const { faculty_email, faculty_password } = req.body;

        // Fetch faculty using the provided email
        const faculty = await new Promise((resolve, reject) => {
            departmentModel.findFacultyByEmail(faculty_email, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });

        // If no faculty is found
        if (!faculty) {
            return res.json({ status: "incorrect email", error: "Faculty not found" });
        }

        // Compare passwords
        const match = await bcrypt.compare(faculty_password, faculty.faculty_password);
        if (!match) {
            return res.json({ status: "incorrect password", error: "Incorrect password" });
        }

        // Generate JWT token using "collegelogin" as the secret key
        jwt.sign({ faculty_email: faculty_email }, "collegelogin", { expiresIn: "1d" }, (error, facultyToken) => {
            if (error) {
                return res.json({ status: "error", error: "Token generation failed" });
            } else {
                departmentModel.logFacultyAction(faculty.department_id, 'Faculty logged in');
                return res.json({ status: "success", facultyData: faculty, collegetoken: facultyToken });
            }
        });
    } catch (error) {
        console.error(error);
        return res.json({ status: "error", message: "Failed to login faculty" });
    }
});

router.post('/viewFaculty', (req, res) => {
    const college_id = req.body.college_id; // Assuming college_id is sent in the request body

    // Verify college token
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Call the findFacultyByCollegeId function from the DepartmentModel
        departmentModel.findFacultyByCollegeId(college_id, (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // If no results found, return a custom message
            if (results.length === 0) {
                return res.json({ status: "No Faculties Found", message: 'No Faculties Found' });
            }

            // If results found, return the results
            departmentModel.logFacultyAction(decoded.admin_id, 'View Faculty');
            return res.status(200).json(results);
        });
    });
});

router.post('/viewFacultyProfile', (req, res) => {
    const id = req.body.id;
    // Verify college token
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ "status": "error", "message": "Failed to verify token" });
        }
        if (decoded && decoded.faculty_email) {

            departmentModel.findFacultyById(id, (error, results) => {
                if (error) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                // If no results found, return a custom message
                if (results.length === 0) {
                    return res.json({ status: "No Faculties Found", message: 'No Faculties Found' });
                }

                // If results found, return the results
                departmentModel.logFacultyAction(results.department_id, 'View FacultyProfile');
                return res.status(200).json(results);
            });
        }
    });
});

router.put('/updateDepartmentPassword', async (req, res) => {
    try {
        const { faculty_email, verification_code, faculty_password } = req.body;
        console.log(req.body)
        // Check if all required fields are provided
        if (!faculty_email || !verification_code || !faculty_password) {
            return res.json({ status: "all fields required",message: 'Email, verification code, and new password are required' });
        }

        // Check if the email exists in the database
        departmentModel.findFacultyByEmail(faculty_email, async (error, faculty) => {
            if (error) {
                return res.json({ status: 'error', message: error.message });
            }

            if (!faculty) {
                // Email not found in the table
                return res.json({ status: 'error', message: 'Invalid email' });
            }

            // Check if verification code matches the stored code and has not expired
            const verificationData = verificationCodes[faculty_email];
            if (!verificationData || verificationData.code !== parseInt(verification_code)) {
                return res.json({ status: "invalid", message: "Invalid or expired verification code" })
            }

            const currentTime = Date.now();
            if (currentTime - verificationData.timestamp > codeExpirationThreshold) {
                delete verificationCodes[faculty_email]; // Remove expired verification code
                return res.json({ status: "expired", message: "Verification code has expired" })
            }

            try {
                // Hash the new password
                const hashedNewPassword = await hashPasswordGenerator(faculty_password);

                // Update the password in the database
                departmentModel.updatePassword(faculty_email, hashedNewPassword, (error, updateResult) => {
                    if (error) {
                        return res.json({ status: "error", message: error.message });
                    }
                    departmentModel.logFacultyAction(faculty.department_id, 'Faculty Update Password');
                    res.json({ status: 'success', message: 'Password updated successfully' });

                    // Remove the verification code after password update
                    delete verificationCodes[faculty_email];
                });
            } catch (error) {
                return res.json({ status: "error", message: error.message });
            }
        });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
});



// Temporary storage for verification codes
const verificationCodes = {};

// Time threshold for code expiration (in milliseconds)
const codeExpirationThreshold = 300000; // 5 minutes

// Route for resetting password using verification code
router.post("/forgotDepartmentpassword", async (req, res) => {
    try {
        const { faculty_email } = req.body;
        const subjectheading = 'Password Reset';

        departmentModel.findFacultyByEmail(faculty_email, async (error, faculty) => {
            if (error) {
                return res.json({ status: "error",error: error.message });
            }
            if (!faculty) {
                return res.json({ status: "inavaild email", error: "Invalid faculty email" });
            }
            try {
                // Generate a random 6-digit number
                const randomCode = Math.floor(100000 + Math.random() * 900000);

                // Store the code with timestamp
                verificationCodes[faculty_email] = {
                    code: randomCode,
                    timestamp: Date.now()
                };

                let faculty_name = faculty.faculty_name;
                let sending_email = faculty_email;
                let textContent = `Dear ${faculty_name},\n\nYou have requested to reset your password. Your verification code is: ${randomCode}.\n\nPlease use this code to reset your password. If you did not request this, please contact the administrator.`;

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
                                <p>Dear ${faculty_name},</p>
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
                departmentModel.logFacultyAction(faculty.department_id, 'Faculty Reset Password');
                return res.json({ status: "success", message: "Password reset message has been sent to your email" });
            } catch (error) {
                return res.json({ status: "error", error: error.message });
            }
        });
    } catch (error) {
        return res.json({ status: "error", error: error.message });
    }
});

router.post('/update_faculty', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ "status": "error", "message": "Failed to verify token" });
        }

        if (decoded && decoded.faculty_email) {
            const id = req.body.id;
            const newData = {
                faculty_name: req.body.faculty_name,
                faculty_email: req.body.faculty_email,
                faculty_phone: req.body.faculty_phone
            };
            
            console.log('New faculty data:', newData);

            departmentModel.updateFaculty(newData, id, (updateError, updateResult) => {
                if (updateError) {
                    console.error('Error updating faculty:', updateError);
                    return res.json({ "status": "error", error: 'Internal Server Error' });
                }

                console.log('Faculty updated successfully');

                // Assuming decoded.department_id is the correct department_id
                departmentModel.logFacultyAction(id, 'Faculty Update', (logError, logResult) => {
                    if (logError) {
                        console.error('Error logging faculty action:', logError);
                        // Handle logging error, possibly return an error response
                    } else {
                        console.log('Faculty action logged successfully');
                    }
                });

                return res.json({ "status": "success", message: 'Faculty updated successfully' });
            });
        } else {
            res.json({ "status": "Unauthorized user" });
        }
    });
});




// router.post("/collegeLogin", async (req, res) => {
//     try {
//         const { college_email, college_password } = req.body;
//         const college = await collegeModel.findCollegeByEmail(college_email, (error, results) => {
//             if (error) {
//                 res.status(500).send({ status: "error", error: 'Error retrieving college data' });
//                 return;
//             }
//             if (results.length > 0) {
//                 res.status(200).json(results[0]);
//             } else {
//                 res.status(404).send({ status: "error", error: 'College not found' });
//             }
//         });
//         console.log(college)
//         if (!college) {
//             return res.json({ status: "Incorrect mailid" });
//         }
//         const match = await bcrypt.compare(college_password, college.college_password);
//         if (!match) {
//             return res.json({ status: "Incorrect password" });
//         }
//         jwt.sign({ college_email: college_email }, "collegelogin", { expiresIn: "1d" }, (error, collegetoken) => {
//             if (error) {
//                 return res.json({ status: "error", "error": error });
//             } else {
//                 return res.json({ status: "success", "collegedata": college, "collegetoken": collegetoken });
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ "status": "error", "message": "Failed to login college" });
//     }
// });

// Route to get a college by college name
router.post('/searchCollege', (req, res) => {
    var term = req.body.term; // Use req.body.name to retrieve college name
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            collegeModel.findCollegeByName(term, (error, results) => {
                if (error) {
                    res.status(500).send('Error retrieving college data');
                    return;
                }
                if (results.length > 0) {
                    res.status(200).json(results);
                } else {
                    res.status(404).send('No College found');
                }
            });
        }
        else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    });
});


// Route to fetch all colleges and log the action
router.post('/Viewcollege', (req, res) => {

    collegeModel.findCollege((error, results) => {
        if (error) {
            res.status(500).send('Error fetching college_details:' + error)
            return
        }
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                res.status(200).json(results);
            }
            else {
                res.json({
                    "status": "Unauthorized user"
                })
            }
        })
    });
});


// The following /Viewcollegedetail is created to test jwt token
router.post('/Viewcollegedetail', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ "status": "error", "message": "Failed to verify token" });
        }
        if (decoded && decoded.college_email) {
            const { college_email } = decoded;
            try {

                const college = await collegeModel.findCollegeByEmail(college_email, (error, results) => {
                    if (error) {
                        res.status(500).send('Error retrieving college data');
                        return;
                    }
                    if (results.length > 0) {
                        res.status(200).json(results[2]);
                    } else {
                        res.status(404).send('College not found');
                    }
                });
                console.log(college)
                if (!college) {
                    return res.json({ status: "Incorrect mailid" });
                }
                else {
                    return res.json({ status: "success", "collegedata": college });
                }
            } catch (error) {
                return res.status(500).json({ "status": "error", "message": "Failed to fetch college details" });
            }
        } else {
            return res.json({ "status": "unauthorised user" });
        }
    });
});

router.post('/student/add', async (req, res) => {
    try {
        const { student_name, student_rollno, student_admno, student_email, student_phone_no, event_id } = req.body;
        const collegetoken = req.headers["collegetoken"];
        jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
            if (error) {
                console.error('Error verifying college token:', error);
                res.status(401).json({ error: 'Unauthorized: Invalid token.' });
                return;
            }
            if (decoded && decoded.faculty_email) {
                // Call insertStudent function from collegeModel
                collegeModel.insertStudent({
                    student_name,
                    student_rollno,
                    student_admno,
                    student_email,
                    student_phone_no,
                    event_id
                }, async (error, results) => {
                    if (error) {
                        console.error('Error inserting student data:', error);
                        res.status(500).json({ error: 'Failed to insert student data into database.' });
                        return;
                    }
                    console.log('Inserted student data:', results);
                    const emailSubject = 'Registration Successful';
                    const emailText = `Dear ${student_name},\n\nYou have successfully registered.\nUsername: ${student_email}\nPassword: ${student_admno}\n\nNote: You can reset your password at any time.`;
                    try {
                        await sendEmail(student_email, emailSubject, emailText);
                        console.log('Email sent successfully.');
                    } catch (emailError) {
                        console.error('Error sending email:', emailError);
                    }

                    res.status(200).json({ status: 'Success', message: 'Student data inserted successfully.' });
                });
            } else {
                console.error('Invalid college token or missing college email.');
                res.status(401).json({ error: 'Unauthorized: Invalid token or missing college email.' });
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});




router.post('/studentupload', uploadModel.StudentFileUpload.single('file'), async (req, res) => {
    try {
        console.log('Received file:', req.file.originalname);
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const collegetoken = req.headers["collegetoken"];
        console.log('Received token:', collegetoken);
        jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
            if (decoded && decoded.faculty_email) {
                const workbook = xlsx.readFile(req.file.path);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(worksheet);
                const eventId = req.body.event_id;
                const newStudentData = data.map(student => ({
                    student_name: student.student_name,
                    student_rollno: student.student_rollno,
                    student_admno: student.student_admno,
                    student_email: student.student_email,
                    student_phone_no: student.student_phone_no,
                    student_password: student.student_admno.toString(),
                    event_id: eventId
                }))
                try {
                    const response = await axios.post('http://localhost:8085/api/student/addstudentuploaded', newStudentData);
                    console.log('Successfully inserted students:', response.data);
                    res.status(200).json({ status: 'Success', message: 'Students inserted', data: response.data });
                } catch (apiError) {
                    console.error('API Request Error:', apiError.response ? apiError.response.data : apiError.message);
                    res.status(400).json({ error: 'Failed to insert students via the API.' });
                }
            }
            else {
                return res.status(401).json({ "status": "Unauthorized user" });
            }
        })
    } catch (error) {
        console.error('Processing Error:', error.message);
        res.status(500).json({ error: 'An error occurred while processing the file.' });
    } finally {
        fs.unlink(req.file.path, (unlinkError) => {
            if (unlinkError) console.error('Error deleting file:', unlinkError);
        });
    }
});


router.post('/getallevents', (req, res) => {
    const collegeId = req.body.college_id;
    const collegeToken = req.headers["collegetoken"];
    if (!collegeId || !collegeToken) {
        return res.status(400).send('College ID and college token are required.');
    }
    jwt.verify(collegeToken, "collegelogin", (error, decoded) => {
        if (error) {
            return res.status(401).send('Unauthorized user');
        }
        collegeModel.getEventsByCollegeId(collegeId, (err, events) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to retrieve events' });
            }
            res.status(200).json(events);
        });
    });
});


router.put('/update_college', uploadModel.CollegeImageupload.single('image'), (req, res) => {
    const { college_id, updatedFields } = req.body;

    if (!college_id || !updatedFields) {
        return res.status(400).json({ error: 'College ID and updated fields are required' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            collegeModel.updateCollege(college_id, updatedFields, (error, result) => {
                if (error) {
                    console.error('Error updating event:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('College updated successfully');
                    res.status(200).json({ message: 'College updated successfully' });
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

router.post('/deleteCollege', async (req, res) => {
    try {
        const { college_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                collegeModel.deleteCollegeById(college_id, (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error deleting college' });
                    }
                    res.json({ status: 'College deleted successfully' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the college' });
    }
});



router.post('/resetPassword', async (req, res) => {
    try {
        const { college_id, college_password } = req.body;

        // Retrieve college details using the provided college ID
        collegeModel.findCollegeById(college_id, async (error, college) => {
            if (error) {
                return res.status(500).json({ status: 'error', error: 'Error finding college by ID' });
            }

            if (!college || college.length === 0) {
                return res.status(404).json({ status: 'error', error: 'College not found' });
            }

            try {
                // Hash the new default password
                const hashedPassword = await hashPasswordgenerator(college_password);
                // Update the college's password in the database
                collegeModel.updateCollegePassword(college_id, hashedPassword, (updateError, updateResult) => {
                    if (updateError) {
                        return res.status(500).json({ error: 'Error updating college password' });
                    }

                    return res.json({ status: 'success' });
                });
            } catch (hashError) {
                console.error('Error hashing password:', hashError);
                return res.status(500).json({ error: 'An error occurred while resetting the password' });
            }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ error: 'An error occurred while resetting the password' });
    }
});

router.post('/collegeStudentDetails', async (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.college_email) {
            const data = req.body
            const college = await collegeModel.findCollegeStudents(data, (error, results) => {
                if (error) {
                    return res.json({ "status": "error" });
                } else {
                    res.json(results)
                }
            });
        }
    });
});
router.post('/collegeEvents', async (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.faculty_email) {
            const event_private_clgid = req.body
            const college = await privateEventModel.viewEventSByCollege(event_private_clgid, (error, results) => {
                if (error) {
                    return res.json({ "status": "error" });
                } else {
                    res.json(results)
                }
            });
        }
    });
});

router.post('/viewEvents', (req, res) => {
    const collegeId = req.body.college_id;
    const collegeToken = req.headers["collegetoken"];
    if (!collegeId || !collegeToken) {
        return res.status(400).send('College ID and college token are required.');
    }
    jwt.verify(collegeToken, "collegelogin", (error, decoded) => {
        if (error) {
            return res.status(401).send('Unauthorized user');
        }
        collegeModel.findEventsByCollegeId(collegeId, (error, results) => {
            if (error) {
                return res.status(500).send('Error fetching event details: ' + error);
            }
            res.status(200).json(results);
        });
    });
});


router.post('/viewStudents', (req, res) => {
    const eventId = req.body.event_id;
    const collegeToken = req.headers["collegetoken"];
    if (!eventId || !collegeToken) {
        return res.status(400).send('Event ID and college token are required.');
    }
    jwt.verify(collegeToken, "collegelogin", (error, decoded) => {
        if (error) {
            return res.status(401).send('Unauthorized user');
        }
        collegeModel.findEventsByEventId(eventId, (error, results) => {
            if (error) {
                return res.status(500).send('Error fetching event details: ' + error);
            }
            res.status(200).json(results);
        });
    });
});

router.post('/viewSession', (req, res) => {
    const collegeToken = req.headers["collegetoken"];
    jwt.verify(collegeToken, "collegelogin", (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { event_private_id } = req.body;
        privateEventModel.getSessions(event_private_id)
            .then(results => {
                // Format the session_date for each result
                const formattedResults = results.map(session => {
                    const sessionDate = new Date(session.session_date);
                    const formattedDate = `${sessionDate.getDate().toString().padStart(2, '0')}-${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}-${sessionDate.getFullYear()}`;
                    session.session_date = formattedDate; // DD-MM-YYYY format
                    return session;
                });

                res.json({ "status": "success", "data": formattedResults });
            })
            .catch(err => {
                return res.status(500).json({ "status": "error", "message": err.message });
            });
    });
});


//college
router.post('/displayPaymentsCollege', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    console.log('Received token:', collegetoken);
    jwt.verify(collegetoken, "collegelogin", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error.message);
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log('Decoded token:', decoded);
        const { college_id } = req.body;
        if (!college_id) {
            return res.status(400).json({ error: 'college_id is required' });
        }
        collegeModel.getPaymentsByCollege(college_id, (error, results) => {
            if (error) {
                console.error('Error fetching payments:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            results.forEach(payment => {
                payment.Date = moment(payment.Date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
            });
            res.status(200).json({ status: 'success', data: results });
        });
    });
});


module.exports = router;
