const express = require('express');
const collegeModel = require('../models/collegeModel');
const studentModel = require("../models/studentModel")
const multer = require('multer');
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

hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}
// Route to add a new College
router.post('/addCollege', uploadModel.CollegeImageupload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        let { data } = { "data": req.body };
        const imagePath = req.file.path;

        // Validate URL

        const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator


        if (!urlPattern.test(data.college_website)) {
            return res.status(400).json({ error: 'Invalid college website URL' });
        }

        const newData = {
            college_name: data.college_name,
            college_email: data.college_email,
            college_phone: data.college_phone,
            college_website: data.college_website,
            college_password: data.college_password,
            college_image: imagePath,
            college_addedby: data.college_addedby,
            college_updatedby: data.college_addedby
        }

        const token = req.headers["token"];
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                collegeModel.insertCollege(newData, (error, results) => {
                    if (error) {
                        res.json({"status": "error","error": error});
                        return;
                    }

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

router.post("/collegeLogin", async (req, res) => {
    try {
        const { college_email, college_password } = req.body;
        const college = await collegeModel.findCollegeByEmail(college_email, (error, results) => {
            if (error) {
                res.status(500).send({ status: "error", error: 'Error retrieving college data' });
                return;
            }
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).send({ status: "error", error: 'College not found' });
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
        jwt.sign({ college_email: college_email }, "collegelogin", { expiresIn: "1d" }, (error, collegetoken) => {
            if (error) {
                return res.json({ status: "error", "error": error });
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
            if (decoded && decoded.college_email) {
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
            if (decoded && decoded.college_email) {
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
        if (decoded && decoded.college_email) {
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

module.exports = router;
