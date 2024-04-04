const express = require('express');
const collegeModel = require('../models/collegeModel');
const studentModel = require("../models/studentModel")
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const axios = require('axios');
const validateModel=require("../models/validateModel")
const router = express.Router();
const bcrypt = require("bcryptjs")
const jwt=require("jsonwebtoken")
const path = require('path');

hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}
// Route to add a new College
router.post('/addCollege', async (req, res) => {
    try {
        let { data } = { "data": req.body };
        const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
        collegeModel.insertCollege(data, (error, results) => {
            if (error) {
                res.status(500).send('Error inserting college data: ' + error);
                return;
            }

            res.status(201).send('College added with ID: ' + results.insertId);
        });
        }
        else{
            res.json({
                "status":"Unauthorized user"
            })
        }
    })
    } catch (error) {
        console.error('Error in addCollege route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/collegeLogin", async(req,res)=>{
    try {
        const { college_email, college_password } = req.body;
        const college = await collegeModel.findCollegeByEmail(college_email, (error, results) => {
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
        console.log(college)
        if (!college) {
            return res.json({ status: "Incorrect mailid" });
        }
        const match = await bcrypt.compare(college_password, college.college_password);
        if (!match) {
            return res.json({ status: "Incorrect password" });
        }
        jwt.sign({ college_email: college_email }, "collegetoken", { expiresIn: "1d" }, (error, collegetoken) => {
            if (error) {
                return res.json({ "status": "error", "error": error });
            } else {
                return res.json({ status: "success", "collegedata": college, "collegetoken": collegetoken });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "status": "error", "message": "Failed to login college" });
    }
});
// Rote to get a college by college name
router.post('/searchCollege', (req, res) => {
    var term = req.body.term; // Use req.body.name to retrieve college name
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    collegeModel.findCollegeByName(term, (error, results) => {
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
    }
    else{
        res.json({
            "status":"Unauthorized user"
        })
    }
});
});

router.post('/Viewcollege', (req, res) => {
    
    collegeModel.findCollege((error, results) => {
        if (error) {
            res.status(500).send('Error fetching college_details:' + error)
            return
        }
        const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
        res.status(200).json(results);
        }
    else {
        res.json({
            "status":"Unauthorized user"
        })
    }
    })
    });
});
// The following /Viewcollegedetail is created to test jwt token
router.post('/Viewcollegedetail', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async(error, decoded) => {
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
                    return res.json({ status: "success", "collegedata": college});
                }
        }catch (error) {
            return res.status(500).json({ "status": "error", "message": "Failed to fetch college details" });
        }
    } else {
        return res.json({ "status": "unauthorised user" });
    }
});
});

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Specify the upload destination here
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname); // Use the original file name as the file name
//     }
// });
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 20 * 1024 * 1024, // 20 MB in bytes
//     }
// });

// router.post('/studentupload', upload.single('file'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }
//         // Check file extension
//         const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
//         if (fileExtension !== 'xlsx') {
//             // Delete the uploaded file if it's not an Excel file
//             fs.unlink(req.file.path, (error) => {
//                 if (error) {
//                     console.error('Error deleting file:', error);
//                 }
//             });
//             return res.status(400).json({ error: 'Invalid file format. Only .xlsx files are allowed.' });
//         }

//         const workbook = xlsx.readFile(req.file.path);
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const data = xlsx.utils.sheet_to_json(worksheet);
//         console.log("data", data)

//         // Construct data for insertion, setting student_admno as password
//         const newStudentData = data.map(student => ({
//             student_name: student.student_name,
//             student_admno: student.student_admno,
//             student_email: student.student_email,
//             student_password: student.student_admno.toString(),// Set student_admno as password
//             event_id: student.event_id,
//             student_college_id: student.student_college_id
//         }));
//         console.log("new data", newStudentData)
//         const response = await axios.post('http://localhost:8085/api/student/addstudent', newStudentData);
//         // Process the response from the other API
//         console.log('Response from other API:', response.data);

//         // Send a response back to the client
//         res.json({ status: 'inserted' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while processing the file.' });
//     }
// });

// Enhanced storage configuration to prevent file name conflicts
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for MIME type checking
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only Excel (.xlsx) files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
    }
});

router.post('/studentupload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const collegetoken = req.headers["collegetoken"];
        jwt.verify(collegetoken,"collegetoken",async(error,decoded)=>{
        if (decoded && decoded.college_email)
        {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Construct data for insertion
        const newStudentData = data.map(student => ({
            student_name: student.student_name,
            student_admno: student.student_admno,
            student_email: student.student_email,
            // Consider using a secure, hashed password instead of student_admno
            student_password: student.student_admno.toString(),
            event_id: student.event_id,
            student_college_id: student.student_college_id
        }));
        // try {
        //     const response = await axios.post('http://localhost:8085/api/student/addstudent', newStudentData, {
        //         headers: {
        //             // Pass the JWT token in the standard Authorization header using the Bearer scheme
        //             Authorization: `Bearer ${collegetoken}`
        //         }
        //     });
        //     // Process the response from the other API
        //     res.json({ status: 'Success', message: 'Students inserted', data: response.data });
        // } catch (apiError) {
        //     // Handle errors from the external API request
        //     console.error('API Request Error:', apiError.response ? apiError.response.data : apiError.message);
        //     res.status(500).json({ error: 'Failed to insert students via the API.' });
        // }
        
        try {
            const response = await axios.post('http://localhost:8085/api/student/addstudent', newStudentData);
            // Process the response from the other API
            res.json({ status: 'Success', message: 'Students inserted', data: response.data });
        } catch (apiError) {
            // Handle errors from the external API request
            console.error('API Request Error:', apiError.response ? apiError.response.data : apiError.message);
            res.status(500).json({ error: 'Failed to insert students via the API.' });
        }
    }
    else
    {
        return res.json({ "status": "unauthorised user" });
    }
    })
    } catch (error) {
        console.error('Processing Error:', error.message);
        res.status(500).json({ error: 'An error occurred while processing the file.' });
    } finally {
        // Clean up: delete the uploaded file after processing
        fs.unlink(req.file.path, (unlinkError) => {
            if (unlinkError) console.error('Error deleting file:', unlinkError);
        });
    }
});

router.post('/deleteCollege', async (req, res) => {
    try {
        const { college_id } = req.body;
        const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
            collegeModel.deleteCollegeById(college_id, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting college' });
                }
                res.json({ status: 'College deleted successfully' });
            });
        }
        else{
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
        const { college_id } = req.body;

        // Retrieve college details using the provided college ID
        collegeModel.findCollegeById(college_id, async (error, college) => {
            if (error) {
                return res.status(500).json({ error: 'Error finding college by ID' });
            }

            if (!college || college.length === 0) {
                return res.status(404).json({ error: 'College not found' });
            }

            try {
                // Generate new default password based on the college's phone number
                const newDefaultPassword = generateNewDefaultPassword(college.college_phone);

                // Hash the new default password
                const hashedPassword = await bcrypt.hash(newDefaultPassword, 10);

                // Update the college's password in the database
                collegeModel.updateCollegePassword(college_id, hashedPassword, (updateError, updateResult) => {
                    if (updateError) {
                        return res.status(500).json({ error: 'Error updating college password' });
                    }

                    return res.json({ status: 'Password reset successfully' });
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

function generateNewDefaultPassword() {
    // Define character sets
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    
    // Generate random characters
    const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    const randomUppercaseChar = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    const randomLowercaseChar = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    
    // Concatenate characters to form the password
    const password = randomSpecialChar + randomUppercaseChar + randomLowercaseChar;

    // Return the password
    return password;
}

module.exports = router;