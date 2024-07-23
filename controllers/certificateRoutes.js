const express = require('express');
const router = express.Router();
const certificateModel = require('../models/certificate');
const jwt = require('jsonwebtoken');
const publicEventModel = require('../models/publicEventModel')


//admin
router.post('/colleges', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        certificateModel.findAllColleges(null, (err, colleges) => {
            if (err) {
                console.error('Error fetching colleges: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(colleges);
        });
    });
});


//admin
router.post('/colleges/search', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const searchKeyword = req.body.q;
        if (!searchKeyword) {
            res.status(400).json({ error: 'Search keyword is required' });
            return;
        }
        certificateModel.findAllColleges(searchKeyword, (err, colleges) => {
            if (err) {
                console.error('Error searching colleges: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(colleges);
        });
    });
});


//admin
router.post('/grant-permission/students', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "collegelogin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { college_id } = req.body;
        certificateModel.updateCollegePermission(college_id, 1, (err, result) => {
            if (err) {
                console.error('Error granting permission for college: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json({ message: 'Permission granted for college successfully' });
        });
    });
});


//college
router.post('/generate-certificate/college', async (req, res) => {
    const token = req.headers.collegetoken;
    console.log('Received token:', token);
    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, "collegelogin", (error, decoded) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(decoded);
                }
            });
        });
        const { certificate_college_id, certificate_name, Issued_By, event_id } = req.body; // Expect single event_id
        const hasPermission = await new Promise((resolve, reject) => {
            certificateModel.checkCollegeCertificateRequestPermission(certificate_college_id, event_id, (err, hasPermission) => {
                if (err) {
                    console.error('Error checking college certificate request permission: ' + err);
                    reject(err);
                    return;
                }
                resolve(hasPermission);
            });
        });
        if (!hasPermission) {
            res.status(403).json({ error: 'Permission denied. College does not have permission to generate certificate requests for this event' });
            return;
        }
        console.log("Request Body:", req.body);
        // Check if certificates for this event and college have already been generated
        const existingCertificates = await new Promise((resolve, reject) => {
            certificateModel.findCertificatesByEventAndCollege(event_id, certificate_college_id, (err, certificates) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(certificates);
            });
        });
        if (existingCertificates.length > 0) {
            console.log('Certificates already generated for this event and college. Returning existing certificates.');
            res.status(200).json({ message: 'Certificates retrieved successfully', certificates: existingCertificates });
            return;
        }
        const students = await new Promise((resolve, reject) => {
            certificateModel.findStudentsByCollegeId(certificate_college_id, event_id, (err, students) => {
                if (err) {
                    console.error('Error fetching students for college: ' + err);
                    reject(err);
                    return;
                }
                console.log("Students:", students);
                resolve(students);
            });
        });
        if (students.length === 0) {
            res.status(400).json({ error: 'No students found for the college' });
            return;
        }
        const insertPromises = students.map(student => {
            console.log("Inserting certificate for student:", student.student_id);
            return new Promise((resolve, reject) => {
                certificateModel.insertCertificateCollege({
                    certificate_private_event_id: event_id,
                    certificate_student_id: student.student_id,
                    certificate_name: certificate_name,
                    Issued_By: Issued_By,
                    status: 'approved'
                }, (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting certificate request: ' + err);
                        reject(err);
                    } else {
                        console.log("Certificate inserted successfully for student:", student.student_id);
                        resolve(insertResult);
                    }
                });
            });
        });
        await Promise.all(insertPromises);
        // Fetch inserted certificates
        const certificates = [];
        for (const student of students) {
            const studentCertificates = await new Promise((resolve, reject) => {
                certificateModel.findCertificatesByStudent(student.student_id, (err, certificates) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(certificates);
                });
            });
            certificates.push(...studentCertificates);
        }
        console.log('All certificate requests inserted successfully');
        res.status(200).json({ message: 'Certificates retrieved successfully', certificates: certificates });
    } catch (error) {
        console.error('Error processing request: ' + error);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ error: 'Unauthorized' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});




//student
router.post('/generate-certificate/student', async (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);

    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, "user-eventapp", (error, decoded) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(decoded);
                }
            });
        });

        const { certificate_student_id, certificate_name, event_id, Issued_By } = req.body;

        const hasPermission = await new Promise((resolve, reject) => {
            certificateModel.checkStudentCertificateRequestPermission(certificate_student_id, event_id, (err, hasPermission) => {
                if (err) {
                    console.error('Error checking student certificate request permission: ' + err);
                    reject(err);
                    return;
                }
                resolve(hasPermission);
            });
        });

        if (!hasPermission) {
            res.status(403).json({ error: 'Permission denied. Student does not have permission to generate certificate requests' });
            return;
        }

        const certificateData = {
            certificate_private_event_id: event_id,
            certificate_student_id: certificate_student_id,
            certificate_name: certificate_name,
            Issued_By: Issued_By,
            status: 'approved'
        };

        certificateModel.insertCertificateStudent(certificateData, async (err, insertResult) => {
            if (err) {
                console.error('Error inserting certificate request: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            try {
                const certificateDetails = await certificateModel.findCertificateDetails(certificate_student_id, event_id, certificate_name, Issued_By);
                console.log('Certificate request inserted successfully');
                res.status(200).json({ message: 'Certificate retrieved successfully', certificate: certificateDetails });
            } catch (error) {
                console.error('Error fetching certificate details: ' + error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error processing request: ' + error);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ error: 'Unauthorized' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});


//admin
router.post('/requests/private_college', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        certificateModel.findCertificatesByCollegePrivateEvent((err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(results);
        });
    });
});


//admin
router.post('/requests/private_student', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        certificateModel.findCertificatesByPrivateEvent((err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(results);
        });
    });
});




//college

router.post('/certificates/college', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "collegelogin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { college_id } = req.body;
        if (!college_id) {
            return res.status(400).json({ error: 'College ID is required' });
        }
        certificateModel.findCertificatesByCollege(college_id, (err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(results);
        });
    });
});

//student

router.post('/certificates/student', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventapp", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { student_id } = req.body;
        if (!student_id) {
            return res.status(400).json({ error: 'Student ID is required' });
        }
        certificateModel.findCertificatesByStudents(student_id, (err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(results);
        });
    });
});


//admin

router.post('/approve-request/user', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { certificate_user_id } = req.body;
        certificateModel.updateCertificateStatusUser(certificate_user_id, 'approved', (err, result) => {
            if (err) {
                console.error('Error approving request: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json({ message: 'Certificate request approved successfully' });
        });
    });
});


//admin

router.post('/deny-request/user', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { certificate_user_id } = req.body;
        certificateModel.updateCertificateStatusUser(certificate_user_id, 'denied', (err, result) => {
            if (err) {
                console.error('Error denying request: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json({ message: 'Certificate request denied successfully' });
        });
    });
});



//generate certificate for user by admin
router.post('/generate-certificate-user', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: 'Unauthorized' });
            return;
        }
        const eventID = req.body.event_id;
        //check event completed or not
        certificateModel.checkEventCompleteOrNot(eventID,(error,done)=>{
            if (error) {
                return res.json({ status: 'error', message: error });
            }
            if(done[0]['is_completed']==0){
                return res.json({ status: 'event not completed'});
            }
        })
       // Check if certificates for this event and college have already been generated
        const existingCertificates = await new Promise((resolve, reject) => {
            certificateModel.findExistingUserCertificate(eventID, (error, certificates) => {
                if (error) {
                    return res.json({ status: 'error', message: error });
                }
                resolve(certificates);
            });
        });
        if (existingCertificates.length > 0) {
            console.log('Certificates already generated for this event and college.');
            res.json({ status: "Certificates already generated" });
            return;
        }
        publicEventModel.findUsersByEvent(eventID, (error, users) => {
            if (error) {
                return res.json({ status: 'error', message: error });
            } else {
                let completed = 0;
                const totalUsers = users.length;
                if (totalUsers === 0) {
                    return res.json({ status: "no users", "message": "Certificate not generated" });
                }
                certificateModel.getCounter((error, result) => {
                    let counter = result[0].value
                    const date = new Date();
                    const year = date.getFullYear();
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const yyyymm = year.toString() + month;
                    users.forEach(user => {
                        const newCounter = "LST" + yyyymm + counter; //certificate number
                        counter++;
                        let userID = user.user_id;
                        const newData = {
                            certificate_public_event_id: eventID,
                            certificate_user_id: userID,
                            certificate_no: newCounter,
                            Issued_By: decoded.admin_id
                        };
                        certificateModel.insertCertificateUser(newData, (err, insertResult) => {
                            if (err) {
                                return res.json({ "status": "error", "message": err });
                            } else {
                                completed++;
                                if (completed === totalUsers) {
                                    // Respond with success after processing all students
                                    function updateCounterWithRetry(counter, retryCount = 5) {
                                        certificateModel.updateCounter(counter, (error, res) => {
                                            if (error) {
                                                console.error(`Failed to update counter: ${error.message}`);
                                                if (retryCount > 0) {
                                                    console.log(`Retrying... (${retryCount} attempts left)`);
                                                    updateCounterWithRetry(counter, retryCount - 1);
                                                } else {
                                                    console.error('Exceeded maximum retry attempts.');
                                                }
                                            } else {
                                                console.log('Counter updated successfully:');
                                            }
                                        });
                                    }
                                    updateCounterWithRetry(counter);
                                    function markCertificateGenrated(event, retryCount = 5) {
                                        certificateModel.markGenerated(event, (error, res) => {
                                            if (error) {
                                                console.error(`Failed to update event: ${error.message}`);
                                                if (retryCount > 0) {
                                                    console.log(`Retrying... (${retryCount} attempts left)`);
                                                    markCertificateGenrated(event, retryCount - 1);
                                                } else {
                                                    console.error('Exceeded maximum retry attempts.');
                                                }
                                            } else {
                                                console.log('Marked Certificate generated successfully:');
                                            }
                                        });
                                    }
                                    markCertificateGenrated(eventID)
                                    return res.json({ "status": "success", "message": "Certificate successfully generated" });
                                }
                            }
                        });
                    })
                });
            };
        })
    });
})

//view user certificate by admin
router.post('/view-certificates-user-ByEvent', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: 'Unauthorized' });
            return;
        }
        const { event_id } = req.body;
        if (!event_id) {
            return res.json({ status: "event id is required", error: 'user ID is required' });
        }
        certificateModel.ViewCertificateUserByEvent(event_id, (err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                return res.json({ status: "error", error: 'Internal server error' });
            }
            if (results.length > 0) {
                const formattedResults = results.map(certificate => {
                    const issued_date = new Date(certificate.issued_date);
                    const issuedDate = `${issued_date.getDate().toString().padStart(2, '0')}-${(issued_date.getMonth() + 1).toString().padStart(2, '0')}-${issued_date.getFullYear()}`;
                    certificate.issued_date = issuedDate; // DD-MM-YYYY format
                    return certificate;
                });
                res.json(formattedResults);
            }
            else {
                res.json({ status: "no certificates found", message: "no certificates for event found" })
            }

        });
    });
});

//view user certificate by user
router.post('/view-certificate-user', (req, res) => {
    const token = req.headers["token"];
    // Verify the token
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.json({ status: "Unauthorized" });
        }
        const { user_id, event_id } = req.body;
        if (!event_id || !user_id) {
            return res.json({ status: "event & user id is required", error: 'event & user ID is required' });
        }
        certificateModel.ViewCertificateUser(event_id, user_id, (err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                return res.json({ status: "error", error: 'Internal server error' });
            }
            if (results.length > 0) {
                const formattedResults = results.map(certificate => {
                    const issued_date = new Date(certificate.issued_date);
                    const issuedDate = `${issued_date.getDate().toString().padStart(2, '0')}-${(issued_date.getMonth() + 1).toString().padStart(2, '0')}-${issued_date.getFullYear()}`;
                    certificate.issued_date = issuedDate; // DD-MM-YYYY format
                    return certificate;
                });
                res.json(formattedResults);
            }
            else {
                res.json({ status: "no certificates found", message: "no certificates for event found" })
            }

        });
    });
});


//college / faculty certificate request
router.post('/request-certificate', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ status: "Unauthorized " });
        }
        if (decoded && decoded.faculty_email) {
            let eventId = req.body.event_id
            let collegeId = req.body.college_id
            let data = {
                event_id: eventId,
                college_id: collegeId,
                faculty_id: req.body.faculty_id,
            }
            certificateModel.checkCertificateReq(eventId, collegeId, (error, result) => {
                if (error) {
                    return res.json({ status: "error" });
                }
                else if (result[0]['COUNT(*)'] >= 1) {//already requested
                    res.json({ status: "already requested" });
                }
                else {
                    certificateModel.requestCertificate(data, (error, results) => {
                        if (error) {
                            res.json({ status: "error" });
                            return;
                        }
                        res.json({ status: "requested" });
                    });
                }

            })

        }
    })
});

//approve certificate request by admin
router.post('/approve-certificate-request', (req, res) => {
    const token = req.headers.token;
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ error: 'Unauthorized' });
            return;
        }
        const { permission_id, event_id } = req.body;
        certificateModel.approveRequest(permission_id, event_id, (err, result) => {
            if (err) {
                res.json({ status: "error" });
                return;
            }
            res.json({ status: "success" });
        });
    });
});

//reject certificate request by admin 
router.post('/reject-certificate-request', (req, res) => {
    const token = req.headers.token;
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ error: 'Unauthorized' });
            return;
        }
        const { permission_id, event_id } = req.body;
        certificateModel.rejectRequest(permission_id, event_id, (err, result) => {
            if (err) {
                res.json({ status: "error" });
                return;
            }
            res.json({ status: "success" });
        });
    });
});

//college / faculty - grant certificate permission for students
router.post('/grant-certificate-permission', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ status: "Unauthorized " });
        }
        if (decoded && decoded.faculty_email) {
            const { permission_id, event_id } = req.body;
            certificateModel.checkPermission(permission_id, event_id, (error, permission) => {
                if (error) {
                    return res.json({ status: "error" });
                }
                else if (permission[0]['certificate_request'] == "Approved") {
                    certificateModel.grantPermission(permission_id, event_id, (error, result) => {
                        if (error) {
                            return res.json({ status: "error" });
                        }
                        res.json({ status: "permission granted" });
                    })
                } else {
                    res.json({ status: "no permission" })
                }
            })
        }
    })
});

//college / faculty - revoke certificate permission for students
router.post('/revoke-certificate-permission', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ status: "Unauthorized " });
        }
        if (decoded && decoded.faculty_email) {
            const { permission_id, event_id } = req.body;
            certificateModel.checkPermission(permission_id, event_id, (error, permission) => {
                if (error) {
                    return res.json({ status: "error" });
                }
                else if (permission[0]['certificate_request'] == "Approved") {
                    certificateModel.revokePermission(permission_id, event_id, (error, result) => {
                        if (error) {
                            return res.json({ status: "error" });
                        }
                        res.json({ status: "permission revoked" });
                    })
                } else {
                    res.json({ status: "no permission" })
                }
            })
        }
    })
});

//generate certificate for students by admin
router.post('/generate-certificate-students', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: 'Unauthorized' });
            return;
        }
        const eventID = req.body.event_id;
        const collegeId=req.body.college_id;
        //check event completed or not
        certificateModel.checkPrivateEventCompleteOrNot(eventID,(error,done)=>{
            if (error) {
                return res.json({ status: 'error', message: error });
            }
            if(done[0]['is_completed']===0){
                return res.json({ status: 'event not completed'});
            }
        })
        certificateModel.collegePayementStatus(collegeId,eventID,(error,paymentStatus)=>{
            if (error) {
                return res.json({ status: 'error', message: error });
            }
            if(paymentStatus[0]['COUNT(*)']===0){
                return res.json({ status: 'payment details not found'});
            }
        })
       // Check if certificates for this event and college have already been generated
        const existingStudentCertificates = await new Promise((resolve, reject) => {
            certificateModel.findExistingStudentCertificate(eventID, (error, certificates) => {
                if (error) {
                    return res.json({ status: 'error', message: error });
                }
                resolve(certificates);
            });
        });
        if (existingStudentCertificates.length > 0) {
            console.log('Certificates already generated for this event and college.');
            res.json({ status: "Certificates already generated" });
            return;
        }
        certificateModel.findStudentsByEvent(eventID, (error, students) => {
            if (error) {
                return res.json({ status: 'error', message: error });
            } else {
                let completed = 0;
                const totalstudents = students.length;
                if (totalstudents === 0) {
                    return res.json({ status: "no students", "message": "Certificate not generated" });
                }
                certificateModel.getCounter((error, result) => {
                    let counter = result[0].value
                    const date = new Date();
                    const year = date.getFullYear();
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const yyyymm = year.toString() + month;
                    students.forEach(student => {
                        const newCounter = "LST" + yyyymm + counter; //certificate number
                        counter++;
                        let studentID = student.student_id;
                        const newData = {
                            certificate_private_event_id: eventID,
                            certificate_student_id: studentID,
                            certificate_no: newCounter,
                            Issued_By: decoded.admin_id
                        };
                        certificateModel.insertCertificateStudent(newData, (err, insertResult) => {
                            if (err) {
                                return res.json({ "status": "error", "message": err });
                            } else {
                                completed++;
                                if (completed === totalstudents) {
                                    // Respond with success after processing all students
                                    function updateCounterWithRetry(counter, retryCount = 5) {
                                        certificateModel.updateCounter(counter, (error, res) => {
                                            if (error) {
                                                console.error(`Failed to update counter: ${error.message}`);
                                                if (retryCount > 0) {
                                                    console.log(`Retrying... (${retryCount} attempts left)`);
                                                    updateCounterWithRetry(counter, retryCount - 1);
                                                } else {
                                                    console.error('Exceeded maximum retry attempts.');
                                                }
                                            } else {
                                                console.log('Counter updated successfully:');
                                            }
                                        });
                                    }
                                    updateCounterWithRetry(counter);
                                    function markCertificateGenrated(event, retryCount = 5) {
                                        certificateModel.markPrivateGenerated(event, (error, res) => {
                                            if (error) {
                                                console.error(`Failed to update event: ${error.message}`);
                                                if (retryCount > 0) {
                                                    console.log(`Retrying... (${retryCount} attempts left)`);
                                                    markCertificateGenrated(event, retryCount - 1);
                                                } else {
                                                    console.error('Exceeded maximum retry attempts.');
                                                }
                                            } else {
                                                console.log('Marked Certificate generated successfully:');
                                            }
                                        });
                                    }
                                    markCertificateGenrated(eventID)
                                    return res.json({ "status": "success", "message": "Certificate successfully generated" });
                                }
                            }
                        });
                    })
                });
            };
        })
    });
})

//view certificate requests done by faculty(college) by admin
router.post('/view-certificate-requests', (req, res) => {
    const token = req.headers.token;
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ error: 'Unauthorized' });
            return;
        }
        certificateModel.viewCertificateRequests((err, result) => {
            if (err) {
                res.json({ status: "error" });
                return;
            }
            if(result.length > 0){
                res.json( result );
            }
            else{
                res.json({ status:"no requests" });
            }
        });
    });
});

//view certificate requests by faculty(college) 
router.post('/view-certificate-requests-by-college', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ status: "Unauthorized " });
        }
        const college_id=req.body.college_id
        certificateModel.viewCertificateRequestsCollege(college_id,(err, result) => {
            if (err) {
                res.json({ status: "error" });
                return;
            }
            if(result.length > 0){
                res.json( result );
            }
            else{
                res.json({ status:"no requests" });
            }
        });
    });
});

//view student certificate by admin
router.post('/view-certificates-student-ByEvent', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: 'Unauthorized' });
            return;
        }
        const { event_id } = req.body;
        if (!event_id) {
            return res.json({ status: "event id is required", error: 'user ID is required' });
        }
        certificateModel.ViewCertificateStudentByEvent(event_id, (err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                return res.json({ status: "error", error: 'Internal server error' });
            }
            if (results.length > 0) {
                const formattedResults = results.map(certificate => {
                    const issued_date = new Date(certificate.issued_date);
                    const issuedDate = `${issued_date.getDate().toString().padStart(2, '0')}-${(issued_date.getMonth() + 1).toString().padStart(2, '0')}-${issued_date.getFullYear()}`;
                    certificate.issued_date = issuedDate; // DD-MM-YYYY format
                    return certificate;
                });
                res.json(formattedResults);
            }
            else {
                res.json({ status: "no certificates found", message: "no certificates for event found" })
            }

        });
    });
});

//view student certificate by faculty / college
router.post('/view-students-certificates-ByEvent', (req, res) => {
    const collegetoken = req.headers["collegetoken"];
    jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
        if (error) {
            return res.json({ status: "Unauthorized " });
        }
        const { event_id } = req.body;
        if (!event_id) {
            return res.json({ status: "event id is required", error: 'user ID is required' });
        }
        certificateModel.ViewCertificateStudentByEvent(event_id, (err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                return res.json({ status: "error", error: 'Internal server error' });
            }
            if (results.length > 0) {
                const formattedResults = results.map(certificate => {
                    const issued_date = new Date(certificate.issued_date);
                    const issuedDate = `${issued_date.getDate().toString().padStart(2, '0')}-${(issued_date.getMonth() + 1).toString().padStart(2, '0')}-${issued_date.getFullYear()}`;
                    certificate.issued_date = issuedDate; // DD-MM-YYYY format
                    return certificate;
                });
                res.json(formattedResults);
            }
            else {
                res.json({ status: "no certificates found", message: "no certificates for event found" })
            }

        });
    });
});

//view student certificate by student
router.post('/view-certificate-student', (req, res) => {
    const token = req.headers["token"];
    // Verify the token
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.json({ status: "Unauthorized" });
        }
        const { email_id, event_id } = req.body;
        if (!event_id || !email_id) {
            return res.json({ status: "event & user id is required", error: 'event & user ID is required' });
        }
        certificateModel.ViewCertificateStudent(event_id, email_id, (err, results) => {
            if (err) {
                console.error('Error fetching certificate requests: ' + err);
                return res.json({ status: "error", error: 'Internal server error' });
            }
            if (results.length > 0) {
                const formattedResults = results.map(certificate => {
                    const issued_date = new Date(certificate.issued_date);
                    const issuedDate = `${issued_date.getDate().toString().padStart(2, '0')}-${(issued_date.getMonth() + 1).toString().padStart(2, '0')}-${issued_date.getFullYear()}`;
                    certificate.issued_date = issuedDate; // DD-MM-YYYY format
                    return certificate;
                });
                res.json(formattedResults);
            }
            else {
                res.json({ status: "no certificates found", message: "no certificates for event found" })
            }

        });
    });
});



module.exports = router;
