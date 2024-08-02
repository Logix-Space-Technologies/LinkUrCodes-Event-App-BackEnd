const express = require('express');
const router = express.Router();
const certificateModel = require('../models/certificate');
const jwt = require('jsonwebtoken');
const publicEventModel = require('../models/publicEventModel')



//generate certificate for user by admin
router.post('/generate-certificate-user', (req, res) => {
    const token = req.headers.token;
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            res.json({ status: 'Unauthorized' });
            return;
        }
        const eventID = req.body.event_id;
        //check event completed or not
        certificateModel.checkEventCompleteOrNot(eventID, (error, done) => {
            if (error) {
                return res.json({ status: 'error', message: error });
            }
            if (done[0]['is_completed'] == 0) {
                return res.json({ status: 'event not completed' });
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
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            res.json({ status: 'Unauthorized' });
            return;
        }
        const { event_id } = req.body;
        if (!event_id) {
            return res.json({ status: "event id is required", error: 'user ID is required' });
        }
        certificateModel.ViewCertificateUserByEvent(event_id, (err, results) => {
            if (err) {
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
            return res.json({ status: "Unauthorized" });
        }
        const { user_id, event_id } = req.body;
        if (!event_id || !user_id) {
            return res.json({ status: "event & user id is required", error: 'event & user ID is required' });
        }
        certificateModel.ViewCertificateUser(event_id, user_id, (err, results) => {
            if (err) {
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
router.post('/generate-certificate-students', async (req, res) => {
    const token = req.headers.token;

    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            return res.json({ status: 'Unauthorized' });
        }

        const eventID = req.body.event_id;
        const collegeId = req.body.college_id;

        try {
            // Check if the event is completed
            const eventCompletion = await new Promise((resolve, reject) => {
                certificateModel.checkPrivateEventCompleteOrNot(eventID, (err, done) => {
                    if (err) reject(err);
                    resolve(done);
                });
            });
            if (eventCompletion[0]['is_completed'] === 0) {
                return res.json({ status: 'event not completed' });
            }

            // Check college payment status
            const paymentStatus = await new Promise((resolve, reject) => {
                certificateModel.collegePayementStatus(collegeId, eventID, (err, status) => {
                    if (err) reject(err);
                    resolve(status);
                });
            });
            if (paymentStatus[0]['COUNT(*)'] === 0) {
                return res.json({ status: 'payment details not found' });
            }

            // Check if certificates have already been generated
            const existingCertificates = await new Promise((resolve, reject) => {
                certificateModel.findExistingStudentCertificate(eventID, (err, certificates) => {
                    if (err) reject(err);
                    resolve(certificates);
                });
            });
            if (existingCertificates.length > 0) {
                return res.json({ status: "Certificates already generated" });
            }

            // Process and generate certificates
            const students = await new Promise((resolve, reject) => {
                certificateModel.findStudentsByEvent(eventID, (err, studentsList) => {
                    if (err) reject(err);
                    resolve(studentsList);
                });
            });

            if (students.length === 0) {
                return res.json({ status: "no students", "message": "Certificate not generated" });
            }

            const counterResult = await new Promise((resolve, reject) => {
                certificateModel.getCounter((err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });

            let counter = counterResult[0].value;
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const yyyymm = year.toString() + month;
            let completed = 0;

            for (const student of students) {
                const newCounter = "LST" + yyyymm + counter;
                counter++;
                const studentID = student.student_id;
                const newData = {
                    certificate_private_event_id: eventID,
                    certificate_student_id: studentID,
                    certificate_no: newCounter,
                    Issued_By: decoded.admin_id
                };

                try {
                    await new Promise((resolve, reject) => {
                        certificateModel.insertCertificateStudent(newData, (err, result) => {
                            if (err) reject(err);
                            resolve(result);
                        });
                    });
                    completed++;
                } catch (err) {
                    return res.json({ status: "error", message: err.message });
                }
            }

            if (completed === students.length) {
                // Update counter and mark certificates as generated
                await new Promise((resolve, reject) => {
                    certificateModel.updateCounter(counter, (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    certificateModel.markPrivateGenerated(eventID, (err, result) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                return res.json({ status: "success", message: "Certificate successfully generated" });
            }

        } catch (err) {
            console.error('Error during certificate generation: ', err);
            if (!res.headersSent) {
                res.json({ status: 'error', message: err.message });
            }
        }
    });
});


//view certificate requests done by faculty(college) by admin
router.post('/view-certificate-requests', (req, res) => {
    const token = req.headers.token;
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            res.json({ error: 'Unauthorized' });
            return;
        }
        certificateModel.viewCertificateRequests((err, result) => {
            if (err) {
                res.json({ status: "error" });
                return;
            }
            if (result.length > 0) {
                res.json(result);
            }
            else {
                res.json({ status: "no requests" });
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
        const college_id = req.body.college_id
        certificateModel.viewCertificateRequestsCollege(college_id, (err, result) => {
            if (err) {
                res.json({ status: "error" });
                return;
            }
            if (result.length > 0) {
                res.json(result);
            }
            else {
                res.json({ status: "no requests" });
            }
        });
    });
});

//view student certificate by admin
router.post('/view-certificates-student-ByEvent', (req, res) => {
    const token = req.headers.token;
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            res.json({ status: 'Unauthorized' });
            return;
        }
        const { event_id } = req.body;
        if (!event_id) {
            return res.json({ status: "event id is required", error: 'user ID is required' });
        }
        certificateModel.ViewCertificateStudentByEvent(event_id, (err, results) => {
            if (err) {
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
        certificateModel.checkCollegePermissions(event_id, (error, permission) => {
            if (error) {
                return res.json({ status: "error" });
            }
            if (permission == "") {//no request fount
                return res.json({ status: "no request found" });
            }
            else if (permission[0]['certificate_request'] == "Approved") {
                certificateModel.ViewCertificateStudentByEvent(event_id, (err, results) => {
                    if (err) {
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
            } else {
                res.json({ status: "no permission" })
            }
        })

    });
});

//view student certificate by student
router.post('/view-certificate-student', (req, res) => {
    const token = req.headers["token"];
    // Verify the token
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (error) {
            return res.json({ status: "Unauthorized" });
        }
        const { email_id, event_id } = req.body;
        if (!event_id || !email_id) {
            return res.json({ status: "event & email id is required", error: 'event & user ID is required' });
        }
        certificateModel.checkStudentPermissions(event_id, (error, permission) => {
            if (error) {
                return res.json({ status: "error" });
            }

            if (permission == "") {//no request found
                return res.json({ status: "no request found" });
            } else if (permission[0]['student_access'] == 1) {
                certificateModel.ViewCertificateStudent(event_id, email_id, (err, results) => {
                    if (err) {
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
            }
            else {
                res.json({ status: "no permission" })
            }
        })

    });
});



module.exports = router;
