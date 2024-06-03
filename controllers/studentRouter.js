const express = require("express")
const studentModel = require("../models/studentModel")
const mailerModel=require("../models/mailerModel")
const bcrypt = require("bcryptjs")
const router = express.Router()
const jwt=require("jsonwebtoken")
const privateEventModel = require("../models/privateEventModel")

const hashPasswordGenerator = async (pass) => {
    console.log(pass)
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pass, salt)
}

router.post('/addstudent', async (req, res) => {
    try {
        let data = req.body;
        const dataArray = [data]; // Convert JSON object to an array with a single element
        const newdata = dataArray.map(item => ({
            student_name: item.student_name,
            student_rollno: item.student_rollno,
            student_admno: item.student_admno,
            student_email: item.student_email,
            student_phone_no: item.student_phone_no,
            student_password: item.student_admno.toString(),
            event_id: item.event_id,
            student_college_id: item.student_college_id
        }));
        let password = newdata[0].student_password;
        const hashedPassword = await hashPasswordgenerator(password);
        newdata[0].student_password = hashedPassword;
        const collegetoken = req.headers["collegetoken"];
        jwt.verify(collegetoken,"collegelogin",async(error,decoded)=>{
        if (decoded && decoded.college_email)
        {
        studentModel.insertStudent(newdata, async (error, results) => {
            if (error) {
                console.error('Database Error:', error);
                return res.status(500).json({ status: "error", message: 'Error inserting student data' });
            }
            else {
                try {
                    let user_name = newdata[0].student_name;
                    let email = newdata[0].student_email
                    let textsend = `
                                \n Dear ${user_name},\n
                                \n You have successfully registered. \n
                                \n Username : ${email} \n
                                \n Password is your admission number \n
                                \n Note: You can reset your password at any time. \n
                                `;
                    let subjectheading = 'Successfully Registered'
                    // Send password reset email
                    await mailerModel.sendEmail(email, subjectheading, textsend);
                    return res.json({ status: "success", message: "Student added,Message has been sent to your email" });
                } catch (error) {
                    return res.status(500).json({ status: "error senting mail", error: error.message });
                }
            }
        });
        }
        else{
            return res.json({ "status": "unauthorised user" });
        }
    })
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

router.post('/addstudentuploaded', async (req, res) => {
    try {
        let data = req.body;
        // Hash passwords for each student
        const promises = data.map(async (student) => {
            student.student_password = await hashPasswordGenerator(student.student_password);
            return student; // Return the modified student object
        });

        // Wait for all the passwords to be hashed
        const studentsWithHashedPasswords = await Promise.all(promises);

        // Insert students into the database
        studentModel.insertStudent(studentsWithHashedPasswords, (error, results) => {
            if (error) {
                console.error('Database Error:', error);
                return res.status(500).json({ message: 'Error inserting student data' });
            }
            // Send back a success response
            //res.status(201).json({ status: "success", message: 'Students added successfully', results });

            try {
                // Iterate through each element in the newdata array
                for (let i = 0; i < studentsWithHashedPasswords.length; i++) {
                    let user_name = studentsWithHashedPasswords[i].student_name;
                    let email = studentsWithHashedPasswords[i].student_email;
                    let textsend = `
                                    \n Dear ${user_name},\n
                                    \n You have successfully registered. \n
                                    \n Username : ${email} \n
                                    \n Password is your admission number \n
                                    \n Note: You can reset your password at any time. \n
                                    `;
                    let subjectheading = 'Successfully Registered';

                    // Send password reset email for each element
                    mailerModel.sendEmail(email, subjectheading, textsend);
                }

                // Send a success response after sending emails for all elements
                return res.json({ status: "success", message: "Students added, Messages have been sent to your email" });
            } catch (error) {
                // If any error occurs during email sending, return an error response
                return res.status(500).json({ status: "error sending mail", error: error.message });
            }

        });
    } catch (err) {
        console.error('Error in /addstudent route:', err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

router.post('/viewstudent', async (req, res) => {
   const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
        studentModel.viewStudent((error, results) => {
        res.json(results)
    })
    }
    else{
        res.json({
            "status":"Unauthorized user"
        })
    }
    })
})

router.post('/viewstud1', async (req, res) => {
    try {
        const { student_id } = req.body;
        const token = req.headers["token"];

        // Verify the token
        jwt.verify(token, "stud-eventapp", (error, decoded) => {
            if (error) {
                return res.status(401).json({ "error": "Unauthorized" });
            }

            studentModel.viewstud1(student_id, (error, results) => {
                if (error) {
                    return res.status(500).json({ "error": "Internal Server Error" });
                }
                res.json(results);
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

router.post('/viewstudevent', async (req, res) => {
    try {
        const { student_id } = req.body;
        const token = req.headers["token"];

        // Verify the token
        jwt.verify(token, "stud-eventapp", (error, decoded) => {
            if (error) {
                return res.status(401).json({ "error": "Unauthorized" });
            }

            studentModel.viewstudevent(student_id, (error, results) => {
                if (error) {
                    return res.status(500).json({ "error": "Internal Server Error" });
                }
                res.json(results);
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});
// router.post('/viewstud1', async (req, res) => {
//     try {
//         const { student_id } = req.body;
//          // Extracting student_id from req.body using object destructuring
        
//         // Assuming studentModel is properly defined and has viewstud1 method
//         const token=req.headers["token"]
//    jwt.verify(token,"stud-eventapp",(error,decoded)=>{
//     if (decoded && decoded.student_email) {
//         studentModel.viewstud1(student_id, (error, results) => {
//             if (error) {
//                 return res.status(500).json({ "error": "Internal Server Error" });
//             }
//             res.json(results);
//         });
//     }
//     else{
//         res.json({
//             "status":"Unauthorized user"
//         })
//     }
//     })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ "error": "Internal Server Error" });
//     }
// });


router.post('/loginstudent', (req, res) => {
    const { student_email, student_password } = req.body;

    studentModel.loginStudent(student_email, (error, student) => {
        if (error) {
            return res.json({status: "Error"});
        }
        if (!student) {
            return res.json({status: "Invalid Email ID"});
        }
        // Now student is found, let's compare the password
        bcrypt.compare(student_password, student.student_password, (err, isMatch) => {
            if (err) {
                return res.json({status: "Error is"});
            }
            if (!isMatch) {
                return res.json({status: "Invalid Password"});
            }
            // Successful login
            jwt.sign({email:student_email},"stud-eventapp",{expiresIn:"1d"},
            (error,token)=>{
                if (error) {
                    res.json({
                        "status":"error",
                        "error":error
                    })
                } else {
                    return res.json({
                        status: "Success",
                        studentData: student,
                        "token":token
                    }); 
                }
            })
        });
    });
});

router.put('/updatepassword', async (req, res) => {
    try {
        const { student_email, student_password } = req.body;

        // Check if all required fields are provided
        if (!student_email || !student_password) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        // Hash the new password
        const hashedNewPassword = await hashPasswordGenerator(student_password);

        // Check if the email exists in the database studtoken
        studentModel.loginStudent(student_email, async (error, student) => {
            if (error) {
                return res.status(500).json({status: 'error', message: error.message });
            }

            if (!student) {
                // Email not found in the table
                return res.status(404).json({status: 'error', message: 'Invalid email' });
            }

            // Update the password in the database
            studentModel.updatePassword(student_email, hashedNewPassword, (error, updateResult) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                // Password updated successfully
                res.json({ status: 'success', message: 'Password updated successfully' });
            });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Endpoint to get students by college
router.post('/sortstudbycollege', (req, res) => {
    // Assuming you're sending the college name as a query parameter
    const student_college_id = req.body;

    if (!student_college_id) {
        return res.status(400).json({ message: 'College ID is required' });
    }
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    studentModel.sortStudentsByCollege(student_college_id, (error, students) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ students });
    });
    }
    else{
        return res.json({ "status": "unauthorised user" });
    }
})
});

router.post('/sortstudbyevent', (req, res) => {
    // Assuming you're sending the event name as a query parameter
    const event_id = req.body;

    if (!event_id) {
        return res.status(400).json({ message: 'Event ID is required' });
    }

    studentModel.sortStudentsByEvent(event_id, (error, students) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ students });
    });
});

router.post("/forgotpassword", async (req, res) => {
    try {
        const { student_email } = req.body;
        const subjectheading = 'Password Reset'; 
        studentModel.loginStudent(student_email, async (error, student) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (!student) {
                return res.status(400).json({ error: "Invalid student email" });
            }
            try {
                let student_name=student.student_name;
                let sending_email=student_email;
                let textsend = `Dear ${student_name},\n\nYou have requested to reset your password. Please contact the administrator for assistance.`;

                // Send password reset email
                await mailerModel.sendEmail(sending_email, subjectheading, textsend);
                return res.json({ status: "success", message: "Password reset message has been sent to your email" });
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/viewSession', (req, res) => {
    const token = req.headers["token"];
        // Verify the token
        jwt.verify(token, "stud-eventapp", (error, decoded) => {
            if (error) {
                return res.status(401).json({ "error": "Unauthorized" });
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

module.exports = router;