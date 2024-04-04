const express = require('express');
const router = express.Router();
const certificateModel = require('../models/certificate');
const jwt = require('jsonwebtoken');


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
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
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
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "collegelogin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
    const { certificate_college_id, certificate_name, Issued_By } = req.body;
    try {
        await new Promise((resolve, reject) => {
            certificateModel.checkCollegeCertificateRequestPermission(certificate_college_id, async (err, hasPermission) => {
                if (err) {
                    console.error('Error checking college certificate request permission: ' + err);
                    reject(err);
                    return;
                }
                if (!hasPermission) {
                    res.status(403).json({ error: 'Permission denied. College does not have permission to generate certificate requests' });
                    return;
                }
                resolve();
            });

        });
        console.log("Request Body:", req.body);
        const students = await new Promise((resolve, reject) => {
            certificateModel.findStudentsByCollegeId(certificate_college_id, (err, students) => {
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
        const promises = [];
        for (const student of students) {
            console.log("Inserting certificates for student:", student.student_id);
            try {
                const events = await new Promise((resolve, reject) => {
                    certificateModel.findEventsByStudentId(student.student_id, (err, events) => {
                        if (err) {
                            console.error('Error fetching events for student: ' + err);
                            reject(err);
                            return;
                        }
                        console.log("Events for student:", events);
                        resolve(events);
                    });
                });

                const eventIds = students.map(student => student.event_id);
                console.log("Event !!!!!! : " +eventIds);

try {
    const eventsPaidForCollege = await certificateModel.checkEventsPaidForCollege(certificate_college_id, eventIds);
    console.log("Event count !!!!!! : " +eventsPaidForCollege);
    if (eventsPaidForCollege !== eventIds.length) {
        res.status(403).json({ error: 'Permission denied. College has not paid for all events' });
        return;
    }
                
                for (const event of events) {
                    try {
                        console.log("Inserting certificate for event:", event.event_id);
                        const insertResult = await new Promise((resolve, reject) => {
                            certificateModel.insertCertificateCollege({
                                certificate_private_event_id: event.event_id,
                                certificate_college_id: certificate_college_id,
                                certificate_name: certificate_name,
                                Issued_By: Issued_By,
                                status: 'approved'
                            }, (err, insertResult) => {
                                if (err) {
                                    console.error('Error inserting certificate request: ' + err);
                                    reject(err);
                                } else {
                                    console.log("Certificate inserted successfully for event:", event.event_id);
                                    resolve(insertResult);
                                }
                            });
                        });
                        promises.push(insertResult);
                    } catch (error) {
                        console.error('Error inserting certificate for event:', error);
                    }
                }
            } catch (error) {
                console.error('Error fetching events for student:', error);
            }
        } catch (error) {
            console.error('Error checking payment for college events:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        }
        await Promise.all(promises);

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
    } 
    catch (error) {
        console.error('Error generating certificate requests: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
});




//student
router.post('/generate-certificate/student', async (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "stud-eventapp", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
    const { certificate_student_id, certificate_name, Issued_By } = req.body;

    try {
        await new Promise((resolve, reject) => {
            certificateModel.checkStudentCertificateRequestPermission(certificate_student_id, async (err, hasPermission) => {
                if (err) {
                    console.error('Error checking student certificate request permission: ' + err);
                    reject(err);
                    return;
                }
                if (!hasPermission) {
                    res.status(403).json({ error: 'Permission denied. Student does not have permission to generate certificate requests' });
                    return;
                }
                resolve();
            });
        });

        const privateEvents = await new Promise((resolve, reject) => {
            certificateModel.findPrivateEventsByStudentId(certificate_student_id, (err, privateEvents) => {
                if (err) {
                    console.error('Error fetching private events for student: ' + err);
                    reject(err);
                    return;
                }
                resolve(privateEvents);
            });
        });

        if (privateEvents.length === 0) {
            res.status(400).json({ error: 'No private events found for the student' });
            return;
        }

        console.log("Event count earlier !!!!!! : " + JSON.stringify(privateEvents));

        try {
            const eventsPaidForCollege = await certificateModel.checkEventsPaidForStudents(certificate_student_id, privateEvents);
            console.log("Event count !!!!!! : " + eventsPaidForCollege);
            if (eventsPaidForCollege !== privateEvents.length) {
                res.status(403).json({ error: 'Permission denied. College has not paid for all events' });
                return;
            }

            const certificates = await Promise.all(privateEvents.map(async privateEvent => {
                return new Promise((resolve, reject) => {
                    const certificateData = {
                        certificate_private_event_id: privateEvent.event_id,
                        certificate_student_id: certificate_student_id,
                        certificate_name: certificate_name,
                        Issued_By: Issued_By,
                        status: 'approved'
                    };

                    certificateModel.insertCertificateStudent(certificateData, async (err, insertResult) => {
                        if (err) {
                            console.error('Error inserting certificate request: ' + err);
                            reject(err);
                        } else {
                            try {
                                const certificateDetails = await certificateModel.findCertificateDetails(certificate_student_id, privateEvent.event_id, certificate_name, Issued_By);
                                resolve(certificateDetails);
                            } catch (error) {
                                console.error('Error fetching certificate details: ' + error);
                                reject(error);
                            }
                        }
                    });
                });
            }));

            console.log('All certificate requests inserted successfully');
            res.status(200).json({ message: 'Certificates retrieved successfully', certificates: certificates });
        } catch (error) {
            console.error('Error generating certificate requests: ' + error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error generating certificate requests: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
});



//user

router.post('/generate-certificate/user', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "user-eventapp", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
    const { certificate_user_id, certificate_name , Issued_By } = req.body;
    certificateModel.findPublicEventsByUserId(certificate_user_id, (err, publicEvents) => {
        if (err) {
            console.error('Error fetching public events for user: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        console.log(publicEvents);
        if (publicEvents.length === 0) {
            res.status(400).json({ error: 'No public events found for the user' });
            return;
        }
        const publicEventIds = publicEvents.map(event => event.payment_event_id);
        console.log(publicEventIds);
        const promises = publicEventIds.map(publicEventId => {
            return new Promise((resolve, reject) => {
        certificateModel.insertCertificateUser({
        certificate_user_id: certificate_user_id,
        certificate_public_event_id: publicEventId,
        certificate_name: certificate_name,
        Issued_By: Issued_By,
        status: 'pending'
    }, (err, insertResult) => {
        if (err) {
            console.error('Error inserting certificate request: ' + err);
            reject(err);
        } else {
            resolve(insertResult);
        }
    });
});
});

Promise.all(promises)
.then(() => {
    console.log('All certificate requests inserted successfully');
    res.status(200).json({ message: 'Certificate requests generated successfully' });
})
.catch(err => {
    console.error('Error inserting certificate requests: ' + err);
    res.status(500).json({ error: 'Internal server error' });
});
});
});
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



//admin
router.post('/requests/public_user', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
    certificateModel.findCertificatesByPublicEvent((err, results) => {
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


//user

router.post('/certificates/user', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "user-eventapp", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    certificateModel.findCertificatesByUsers(user_id, (err, results) => {
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


module.exports = router;


// const express = require('express');
// const router = express.Router();
// const certificateModel = require('../models/certificate');


// router.post('/colleges', (req, res) => {
//     certificateModel.findAllColleges(null, (err, colleges) => {
//         if (err) {
//             console.error('Error fetching colleges: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(colleges);
//     });
// });


// router.post('/colleges/search', (req, res) => {
//     const searchKeyword = req.body.q;
//     if (!searchKeyword) {
//         res.status(400).json({ error: 'Search keyword is required' });
//         return;
//     }
//     certificateModel.findAllColleges(searchKeyword, (err, colleges) => {
//         if (err) {
//             console.error('Error searching colleges: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(colleges);
//     });
// });


// router.post('/grant-permission/students', (req, res) => {
//     const { college_id } = req.body;
//     certificateModel.updateCollegePermission(college_id, 1, (err, result) => {
//         if (err) {
//             console.error('Error granting permission for college: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json({ message: 'Permission granted for college successfully' });
//     });
// });


// router.post('/generate-certificate/college', async (req, res) => {
//     const { certificate_college_id, certificate_name, Issued_By } = req.body;
//     try {
//         await new Promise((resolve, reject) => {
//             certificateModel.checkCollegeCertificateRequestPermission(certificate_college_id, async (err, hasPermission) => {
//                 if (err) {
//                     console.error('Error checking college certificate request permission: ' + err);
//                     reject(err);
//                     return;
//                 }
//                 if (!hasPermission) {
//                     res.status(403).json({ error: 'Permission denied. College does not have permission to generate certificate requests' });
//                     return;
//                 }
//                 resolve();
//             });
//         });
//         console.log("Request Body:", req.body);
//         const students = await new Promise((resolve, reject) => {
//             certificateModel.findStudentsByCollegeId(certificate_college_id, (err, students) => {
//                 if (err) {
//                     console.error('Error fetching students for college: ' + err);
//                     reject(err);
//                     return;
//                 }
//                 console.log("Students:", students);
//                 resolve(students);
//             });
//         });

//         if (students.length === 0) {
//             res.status(400).json({ error: 'No students found for the college' });
//             return;
//         }
//         const promises = [];
//         for (const student of students) {
//             console.log("Inserting certificates for student:", student.student_id);
//             try {
//                 const events = await new Promise((resolve, reject) => {
//                     certificateModel.findEventsByStudentId(student.student_id, (err, events) => {
//                         if (err) {
//                             console.error('Error fetching events for student: ' + err);
//                             reject(err);
//                             return;
//                         }
//                         console.log("Events for student:", events);
//                         resolve(events);
//                     });
//                 });

//                 const eventIds = students.map(student => student.event_id);
//                 console.log("Event !!!!!! : " +eventIds);

// try {
//     const eventsPaidForCollege = await certificateModel.checkEventsPaidForCollege(certificate_college_id, eventIds);
//     console.log("Event count !!!!!! : " +eventsPaidForCollege);
//     if (eventsPaidForCollege !== eventIds.length) {
//         res.status(403).json({ error: 'Permission denied. College has not paid for all events' });
//         return;
//     }
                
//                 for (const event of events) {
//                     try {
//                         console.log("Inserting certificate for event:", event.event_id);
//                         const insertResult = await new Promise((resolve, reject) => {
//                             certificateModel.insertCertificateCollege({
//                                 certificate_private_event_id: event.event_id,
//                                 certificate_college_id: certificate_college_id,
//                                 certificate_name: certificate_name,
//                                 Issued_By: Issued_By,
//                                 status: 'approved'
//                             }, (err, insertResult) => {
//                                 if (err) {
//                                     console.error('Error inserting certificate request: ' + err);
//                                     reject(err);
//                                 } else {
//                                     console.log("Certificate inserted successfully for event:", event.event_id);
//                                     resolve(insertResult);
//                                 }
//                             });
//                         });
//                         promises.push(insertResult);
//                     } catch (error) {
//                         console.error('Error inserting certificate for event:', error);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error fetching events for student:', error);
//             }
//         } catch (error) {
//             console.error('Error checking payment for college events:', error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//         }
//         await Promise.all(promises);

//         const certificates = [];
//     for (const student of students) {
//         const studentCertificates = await new Promise((resolve, reject) => {
//             certificateModel.findCertificatesByStudent(student.student_id, (err, certificates) => {
//                 if (err) {
//                     reject(err);
//                     return;
//                 }
//                 resolve(certificates);
//             });
//         });
//         certificates.push(...studentCertificates);
//     }
//         console.log('All certificate requests inserted successfully');
//         res.status(200).json({ message: 'Certificates retrieved successfully', certificates: certificates });
//     } 
//     catch (error) {
//         console.error('Error generating certificate requests: ' + error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });






// router.post('/generate-certificate/student', async (req, res) => {
//     const { certificate_student_id, certificate_name, Issued_By } = req.body;

//     try {
//         await new Promise((resolve, reject) => {
//             certificateModel.checkStudentCertificateRequestPermission(certificate_student_id, async (err, hasPermission) => {
//                 if (err) {
//                     console.error('Error checking student certificate request permission: ' + err);
//                     reject(err);
//                     return;
//                 }
//                 if (!hasPermission) {
//                     res.status(403).json({ error: 'Permission denied. Student does not have permission to generate certificate requests' });
//                     return;
//                 }
//                 resolve();
//             });
//         });

//         const privateEvents = await new Promise((resolve, reject) => {
//             certificateModel.findPrivateEventsByStudentId(certificate_student_id, (err, privateEvents) => {
//                 if (err) {
//                     console.error('Error fetching private events for student: ' + err);
//                     reject(err);
//                     return;
//                 }
//                 resolve(privateEvents);
//             });
//         });

//         if (privateEvents.length === 0) {
//             res.status(400).json({ error: 'No private events found for the student' });
//             return;
//         }

//         console.log("Event count earlier !!!!!! : " + JSON.stringify(privateEvents));

//         try {
//             const eventsPaidForCollege = await certificateModel.checkEventsPaidForStudents(certificate_student_id, privateEvents);
//             console.log("Event count !!!!!! : " + eventsPaidForCollege);
//             if (eventsPaidForCollege !== privateEvents.length) {
//                 res.status(403).json({ error: 'Permission denied. College has not paid for all events' });
//                 return;
//             }

//             const certificates = await Promise.all(privateEvents.map(async privateEvent => {
//                 return new Promise((resolve, reject) => {
//                     const certificateData = {
//                         certificate_private_event_id: privateEvent.event_id,
//                         certificate_student_id: certificate_student_id,
//                         certificate_name: certificate_name,
//                         Issued_By: Issued_By,
//                         status: 'approved'
//                     };

//                     certificateModel.insertCertificateStudent(certificateData, async (err, insertResult) => {
//                         if (err) {
//                             console.error('Error inserting certificate request: ' + err);
//                             reject(err);
//                         } else {
//                             try {
//                                 const certificateDetails = await certificateModel.findCertificateDetails(certificate_student_id, privateEvent.event_id, certificate_name, Issued_By);
//                                 resolve(certificateDetails);
//                             } catch (error) {
//                                 console.error('Error fetching certificate details: ' + error);
//                                 reject(error);
//                             }
//                         }
//                     });
//                 });
//             }));

//             console.log('All certificate requests inserted successfully');
//             res.status(200).json({ message: 'Certificates retrieved successfully', certificates: certificates });
//         } catch (error) {
//             console.error('Error generating certificate requests: ' + error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     } catch (error) {
//         console.error('Error generating certificate requests: ' + error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



// router.post('/generate-certificate/user', (req, res) => {
//     const { certificate_user_id, certificate_name , Issued_By } = req.body;
//     certificateModel.findPublicEventsByUserId(certificate_user_id, (err, publicEvents) => {
//         if (err) {
//             console.error('Error fetching public events for user: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         console.log(publicEvents);
//         if (publicEvents.length === 0) {
//             res.status(400).json({ error: 'No public events found for the user' });
//             return;
//         }
//         const publicEventIds = publicEvents.map(event => event.payment_event_id);
//         console.log(publicEventIds);
//         const promises = publicEventIds.map(publicEventId => {
//             return new Promise((resolve, reject) => {
//         certificateModel.insertCertificateUser({
//         certificate_user_id: certificate_user_id,
//         certificate_public_event_id: publicEventId,
//         certificate_name: certificate_name,
//         Issued_By: Issued_By,
//         status: 'pending'
//     }, (err, insertResult) => {
//         if (err) {
//             console.error('Error inserting certificate request: ' + err);
//             reject(err);
//         } else {
//             resolve(insertResult);
//         }
//     });
// });
// });

// Promise.all(promises)
// .then(() => {
//     console.log('All certificate requests inserted successfully');
//     res.status(200).json({ message: 'Certificate requests generated successfully' });
// })
// .catch(err => {
//     console.error('Error inserting certificate requests: ' + err);
//     res.status(500).json({ error: 'Internal server error' });
// });
// });
// });


// router.post('/requests/private_college', (req, res) => {
//     certificateModel.findCertificatesByCollegePrivateEvent((err, results) => {
//         if (err) {
//             console.error('Error fetching certificate requests: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(results);
//     });
// });



// router.post('/requests/private_student', (req, res) => {
//     certificateModel.findCertificatesByPrivateEvent((err, results) => {
//         if (err) {
//             console.error('Error fetching certificate requests: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(results);
//     });
// });



// router.post('/requests/public_user', (req, res) => {
//     certificateModel.findCertificatesByPublicEvent((err, results) => {
//         if (err) {
//             console.error('Error fetching certificate requests: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(results);
//     });
// });




// router.post('/certificates/college', (req, res) => {
//     const { college_id } = req.body;
//     if (!college_id) {
//         return res.status(400).json({ error: 'College ID is required' });
//     }
//     certificateModel.findCertificatesByCollege(college_id, (err, results) => {
//         if (err) {
//             console.error('Error fetching certificate requests: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(results);
//     });
// });


// router.post('/certificates/user', (req, res) => {
//     const { user_id } = req.body;
//     if (!user_id) {
//         return res.status(400).json({ error: 'User ID is required' });
//     }
//     certificateModel.findCertificatesByUsers(user_id, (err, results) => {
//         if (err) {
//             console.error('Error fetching certificate requests: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(results);
//     });
// });



// router.post('/certificates/student', (req, res) => {
//     const { student_id } = req.body;
//     if (!student_id) {
//         return res.status(400).json({ error: 'Student ID is required' });
//     }
//     certificateModel.findCertificatesByStudents(student_id, (err, results) => {
//         if (err) {
//             console.error('Error fetching certificate requests: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json(results);
//     });
// });



// router.post('/approve-request/user', (req, res) => {
//     const { certificate_user_id } = req.body;
//     certificateModel.updateCertificateStatusUser(certificate_user_id, 'approved', (err, result) => {
//         if (err) {
//             console.error('Error approving request: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json({ message: 'Certificate request approved successfully' });
//     });
// });


// router.post('/deny-request/user', (req, res) => {
//     const { certificate_user_id } = req.body;
//     certificateModel.updateCertificateStatusUser(certificate_user_id, 'denied', (err, result) => {
//         if (err) {
//             console.error('Error denying request: ' + err);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }
//         res.status(200).json({ message: 'Certificate request denied successfully' });
//     });
// });



// module.exports = router;
