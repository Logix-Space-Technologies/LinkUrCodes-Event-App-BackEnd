const express = require('express');
const collegeModel = require('../models/collegeModel');
const studentModel = require("../models/studentModel")
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const axios = require('axios');
const router = express.Router();
const bcrypt = require("bcryptjs")

hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}

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

// Route to add a new College
router.post('/addCollege', async (req, res) => {
    try {
        let { data } = { "data": req.body };
        let password = data.college_password;

        if (!validatePassword(password)) {
            return res.status(400).send('Invalid password.Password should be 8 character long with atleast one uppercase,lowercase,special character and a digit');
        }
        

        const hashedPassword = await hashPasswordgenerator(password);
        data.college_password = hashedPassword;

        // Insert the college into the database
        collegeModel.insertCollege(data, (error, results) => {
            if (error) {
                res.status(500).send('Error inserting college data: ' + error);
                return;
            }

            res.status(201).send('College added with ID: ' + results.insertId);
        });
    } catch (error) {
        console.error('Error in addCollege route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route to get a college by college name
router.post('/searchCollege', (req, res) => {
    var college_name = req.body.college_name; // Use req.body.name to retrieve college name

    collegeModel.findCollegeByName(college_name, (error, results) => {
        if (error) {
            res.status(500).send('Error retrieving college data');
            return;
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).send('College not found');
        }
    });
});

router.get('/Viewcollege', (req, res) => {
    collegeModel.findCollege((error, results) => {
        if (error) {
            res.status(500).send('Error fetching college_details:' + error)
            return
        }
        res.status(200).json(results);
    });
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the upload destination here
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name as the file name
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB in bytes
    }
});

router.post('/studentupload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Check file extension
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        if (fileExtension !== 'xlsx') {
            // Delete the uploaded file if it's not an Excel file
            fs.unlink(req.file.path, (error) => {
                if (error) {
                    console.error('Error deleting file:', error);
                }
            });
            return res.status(400).json({ error: 'Invalid file format. Only .xlsx files are allowed.' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        console.log("data", data)

        // Construct data for insertion, setting student_admno as password
        const newStudentData = data.map(student => ({
            student_name: student.student_name,
            student_admno: student.student_admno,
            student_email: student.student_email,
            student_password: student.student_admno.toString(),// Set student_admno as password
            event_id: student.event_id,
            student_college_id: student.student_college_id
        }));
        console.log("new data", newStudentData)
        const response = await axios.post('http://localhost:8085/api/student/addstudent', newStudentData);
        // Process the response from the other API
        console.log('Response from other API:', response.data);

        // Send a response back to the client
        res.json({ status: 'inserted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the file.' });
    }
});

router.post('/deleteCollege', async (req, res) => {
    try {
        const { college_id } = req.body;
        // Retrieve college details using the provided college ID
        collegeModel.findCollegeById(college_id, async (error, college) => {
            if (error) {
                return res.status(500).json({ error: 'Error finding college by ID' });
            }

            if (!college || college.length === 0) {
                return res.status(404).json({ error: 'College not found' });
            }
            // Delete the college from the database
            collegeModel.deleteCollegeById(college_id, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting college' });
                }
                res.json({ status: 'College deleted successfully' });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the college' });
    }
});

router.post('/logincollege', (req, res) => {
    const { admin_username, admin_password } = req.body;

    adminModel.loginAdmin(admin_username, (error, admin) => {
        if (error) {
            return res.json({
                status: "Error"
            });
        }
        if (!admin) {
            return res.json({
                status: "Invalid Username"
            });
        }
        // Now admin is found, let's compare the password
        bcrypt.compare(admin_password, admin.admin_password, (err, isMatch) => {
            if (err) {
                return res.json({
                    status: "Error is"
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
                adminData: admin
            });
        });
    });
});


module.exports = router;
