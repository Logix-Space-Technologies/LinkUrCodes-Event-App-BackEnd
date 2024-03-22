const express = require("express")
const studentModel = require("../models/studentModel")
const bcrypt = require("bcryptjs")
const nodemailer=require("nodemailer")
const router = express.Router()

const hashPasswordGenerator = async (pass) => {
    console.log(pass)
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pass, salt)
}

router.post('/addstudent', async (req, res) => {
    try {
        let data = req.body;
        if (!Array.isArray(data)) {
            // If data is not an array, convert it to an array with a single element
            data = [data];
        }
        // Hash passwords for each student
        for (let student of data) {
            let password = student.student_password;
            const hashedPassword = await hashPasswordGenerator(password);
            student.student_password = hashedPassword;
        }

        studentModel.insertStudent(data, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            }
            res.json({ status: "success", data: results });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/viewstudent', async (req, res) => {
    studentModel.viewStudent((error, results) => {
        res.json(results)
    })
})

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
            return res.json({
                status: "Success",
                studentData: student
            });
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

        // Check if the email exists in the database
        studentModel.loginStudent(student_email, async (error, student) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            }

            if (!student) {
                // Email not found in the table
                return res.status(404).json({ message: 'Invalid email' });
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



module.exports = router