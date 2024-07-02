const express = require("express")

const publicEventModel = require("../models/publicEventModel")
const privateEventModel = require("../models/privateEventModel")
const router = express.Router()
const jwt = require("jsonwebtoken")
const uploadModel = require("../models/uploadModel")
const collegeModel = require('../models/collegeModel');
const attendenceModel = require('../models/attendenceModel');
const adminModel = require("../models/adminModel")

// router.post("/add_public_events", uploadModel.EventImageUpload.single('image'), async (req, res) => {
//     let data = req.body
//     console.log(data)
//     const token=req.headers["token"]
//    jwt.verify(token,"eventAdmin",(error,decoded)=>{
//     if (decoded && decoded.adminUsername) {

//         const imagePath = req.file.path; //image path
//          let data = req.body
//          const newData = {
//              event_public_name: data.event_public_name,
//              event_public_amount: data.event_public_amount,
//              event_public_description: data.event_public_description,
//              event_public_date: data.event_public_date,
//              event_public_time: data.event_public_time,
//              event_public_image: imagePath,
//              event_syllabus:data.event_syllabus,
//              event_venue:data.event_venue,
//              event_addedby: data.event_addedby,
//              event_updatedby: data.event_addedby
//          }
//     publicEventModel.insertPublicEvents(newData, (error, results) => {
//         if (error) {
//             return res.status(500).json({ message: error.message });
//         }
//         res.json({ status: "success"});
//     });
//     }
//     else{
//         res.json({
//             "status":"Unauthorized user"
//         })
//     }
// })
// })

router.post("/add_public_events", uploadModel.EventImageUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const token = req.headers["token"];
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, "eventAdmin", (error, decoded) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(decoded);
                }
            });
        });

        if (decoded && decoded.adminUsername) {
            if (!req.files || !req.files['image'] || !req.files['pdf']) {
                return res.status(400).json({ error: 'Image or PDF file not uploaded' });
            }

            const imagePath = req.files['image'][0].path;
            const pdfPath = req.files['pdf'][0].path;
            const data = req.body;
            const newData = {
                event_public_name: data.event_public_name,
                event_public_amount: data.event_public_amount,
                event_public_description: data.event_public_description,
                event_public_date: data.event_public_date,
                event_public_time: data.event_public_time,
                event_public_duration: data.event_public_duration,
                event_public_online: data.event_public_online,
                event_public_offline: data.event_public_offline,
                event_public_recorded: data.event_public_recorded,
                event_public_image: imagePath,
                event_syllabus: pdfPath,
                event_venue: data.event_venue,
                event_addedby: data.event_addedby,
                event_updatedby: data.event_addedby
            };

            publicEventModel.insertPublicEvents(newData, (error, results) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                const admin_id = decoded.admin_id;
                adminModel.logAdminAction(admin_id, `Added public event ${data.event_public_name}`);
                res.json({ status: "success" });
            });
        } else {
            res.status(401).json({ status: "Unauthorized user" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/view_public_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            publicEventModel.viewPublicEvents((error, results) => {
                res.json(results);
            })
        }
    });
})

router.post('/view_user_public_events', (req, res) => {
    const token = req.headers["token"];
    jwt.verify(token, "user-eventapp", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.email) {
            publicEventModel.viewPublicEvents((error, results) => {
                res.json(results);
            })
        }
    });
})



router.post("/add_private_events", uploadModel.EventImageUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
    const token = req.headers["token"];
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            if (!req.files || !req.files['image'] || !req.files['pdf']) {
                return res.status(400).json({ error: 'Image or PDF file not uploaded' });
            }
            const imagePath = req.files['image'][0].path;
            const pdfPath = req.files['pdf'][0].path;
            let data = req.body;
            const admin_id = decoded.admin_id;
            const newData = {
                event_private_name: data.event_private_name,
                event_private_amount: data.event_private_amount,
                event_private_description: data.event_private_description,
                event_private_date: data.event_private_date,
                event_private_time: data.event_private_time,
                event_private_duration: data.event_private_duration,
                event_private_online: data.event_private_online,
                event_private_offline: data.event_private_offline,
                event_private_recorded: data.event_private_recorded,
                event_private_image: imagePath,
                event_private_syllabus: pdfPath,
                event_private_clgid: data.event_private_clgid,
                event_addedby: data.event_addedby,
                event_updatedby: data.event_addedby
            };
            privateEventModel.insertPrivateEvents(newData, (error, results) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                adminModel.logAdminAction(admin_id, `Added private event '${newData.event_private_name}' for college ID: ${newData.event_private_clgid}`);
                res.json({ status: "success" });
            });
        }
        else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    })
})

router.post('/view_private_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            privateEventModel.viewPrivateEvents((error, results) => {
                res.json(results);
            })
        }
    });
})

router.post('/view-student-private-events', (req, res) => {
    const token = req.headers["token"];

    // Verify the token
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.status(401).json({ status: "Unauthorized" });
        }

        // Extract student_email from the decoded token
        const student_email = decoded.email;

        // Fetch private events registered by the student
        privateEventModel.viewStudentPrivateEvents(student_email, (error, events) => {
            if (error) {
                console.error('Error fetching events:', error);
                return res.status(500).json({ status: "Internal Server Error" });
            }

            if (events.length === 0) {
                return res.status(404).json({ status: "No Events Found" });
            }

            return res.json({ status: "Success", events });
        });
    });
});


router.post('/update_private_events', uploadModel.EventImageUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    const token = req.headers["token"];
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (error) {
            return res.json({ status: 'Unauthorized', message: 'Invalid or expired token' });
        }
        if (decoded && decoded.adminUsername) {
            let data = req.body;
            let event_id = data.event_private_id;
            const newData = {
                event_private_name: data.event_private_name,
                event_private_amount: data.event_private_amount,
                event_private_description: data.event_private_description,
                event_private_date: data.event_private_date,
                event_private_time: data.event_private_time,
                event_private_duration: data.event_private_duration,
                event_private_online: data.event_private_online,
                event_private_offline: data.event_private_offline,
                event_private_recorded: data.event_private_recorded,
                event_updatedby: data.event_updatedby,
                event_updated_date: new Date()
            };
            // Conditionally add image path if an image was uploaded
            if (req.files && req.files['image'] && req.files['image'][0] && req.files['image'][0].path) {
                newData.event_private_image = req.files['image'][0].path;
            }

            // Conditionally add syllabus path if a PDF was uploaded
            if (req.files && req.files['pdf'] && req.files['pdf'][0] && req.files['pdf'][0].path) {
                newData.event_private_syllabus = req.files['pdf'][0].path;
            }
            privateEventModel.updatePrivateEvents(event_id, newData, (error, result) => {
                if (error) {
                    console.error('Error updating event:', error);
                    return res.json({ status: 'Error', message: 'Failed to update the event' });
                } else {
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Private event updated for ${data.event_private_name}`);
                    console.log('Event updated successfully');
                    return res.json({ status: 'success' });
                }
            });
        } else {
            res.json({
                "status": "Unauthorized",
                "message": "Unauthorized user"
            });
        }
    });
});


router.post('/update_public_events', uploadModel.EventImageUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), (req, res) => {
    let event_public_id = req.body.event_public_id

    if (!event_public_id) {
        return res.json({ status: "error", error: 'Event ID and updated fields are required' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            let data = req.body;
            const newData = {
                event_public_name: data.event_public_name,
                event_public_amount: data.event_public_amount,
                event_public_description: data.event_public_description,
                event_public_date: data.event_public_date,
                event_public_time: data.event_public_time,
                event_venue: data.event_venue,
                event_public_duration: data.event_public_duration,
                event_public_online: data.event_public_online,
                event_public_offline: data.event_public_offline,
                event_public_recorded: data.event_public_recorded,
                event_updatedby: data.event_updatedby,
                event_updated_date: new Date()
            };
            // Conditionally add image path if an image was uploaded
            if (req.files && req.files['image'] && req.files['image'][0] && req.files['image'][0].path) {
                newData.event_public_image = req.files['image'][0].path;
            }
            // Conditionally add syllabus path if a PDF was uploaded
            if (req.files && req.files['pdf'] && req.files['pdf'][0] && req.files['pdf'][0].path) {
                newData.event_syllabus = req.files['pdf'][0].path;
            }
            publicEventModel.updatePublicEvents(event_public_id, newData, (error, result) => {
                if (error) {
                    console.error('Error updating event:', error);
                    res.json({ status: "error", error: 'Internal Server Error' });
                } else {
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Public event updated for ${data.event_public_name}`);
                    console.log('Event updated successfully');
                    res.json({ status: "success", message: "success" });
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

router.post('/search-public-events', (req, res) => {
    const eventName = req.body.event_public_name; // Assuming the event name is sent in the request body
    if (!eventName) {
        return res.status(400).json({ error: 'Event name is required' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            publicEventModel.searchPublicEvents(eventName, (err, results) => {
                if (err) {
                    console.error('Error searching for events:', err);
                    return res.status(500).json({ status: "error", error: 'Internal server error' });
                }
                const admin_id = decoded.admin_id;
                adminModel.logAdminAction(admin_id, `Public event searched for name like ${eventName}`);
                res.json(results);
            });
        }
        else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    })
});

router.post('/search-user_public-events', (req, res) => {
    const eventName = req.body.event_public_name; // Assuming the event name is sent in the request body
    if (!eventName) {
        return res.status(400).json({ error: 'Event name is required' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (decoded && decoded.email) {
            publicEventModel.searchPublicEvents(eventName, (err, results) => {
                if (err) {
                    console.error('Error searching for events:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json(results);
            });
        }
        else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    })
});

router.post('/search-private-events', (req, res) => {
    const eventName = req.body.event_private_name; // Assuming the event name is sent in the request body
    if (!eventName) {
        return res.status(400).json({ error: 'Event name is required' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            privateEventModel.searchPrivateEvents(eventName, (err, results) => {
                if (err) {
                    console.error('Error searching for events:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                const admin_id = decoded.admin_id;
                adminModel.logAdminAction(admin_id, `Private events searched for name like ${eventName}`);
                res.json(results);
            });
        }
        else {
            res.json({
                "status": "Unauthorized user"
            })
        }
    })
});

router.post('/delete_private_event', async (req, res) => {
    try {
        const { event_private_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                const admin_id = decoded.admin_id;
                privateEventModel.deletePrivateEvent(event_private_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error', error: 'Error deleting event' });
                    }
                    adminModel.logAdminAction(admin_id, `Deleted private event ID: ${event_private_id}`);
                    res.json({ status: 'success' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'An error occurred while deleting the college' });
    }
});

router.post('/retrive_private_event', async (req, res) => {
    try {
        const { event_private_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                privateEventModel.retrivePrivateEvent(event_private_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error', error: 'Error deleting event' });
                    }
                    const admin_id = decoded.admin_id; 
                    adminModel.logAdminAction(admin_id, `Retrieved private event`);
                    res.json({ status: 'success' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'An error occurred while deleting the college' });
    }
});

router.post('/view_active_private_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            privateEventModel.viewActiveEvents((error, results) => {
                const admin_id = decoded.admin_id;
                adminModel.logAdminAction(admin_id, `Viewed private events`);
                res.json(results);
            })
        }
    });
})

router.post('/view_deleted_private_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            privateEventModel.viewDeletedEvents((error, results) => {
                if (results.length > 0) {
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Viewed deleted private events`);
                    res.json(results);
                }
                else {
                    res.json({ status: 'No events found' });
                }
            })
        }
    });
})

router.post('/delete_public_event', async (req, res) => {
    try {
        const { event_public_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                publicEventModel.deletePublicEvent(event_public_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error', error: 'Error deleting event' });
                    }
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Public event deleted`);
                    res.json({ status: 'success' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'An error occurred while deleting the college' });
    }
});

router.post('/retrive_public_event', async (req, res) => {
    try {
        const { event_public_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                publicEventModel.retrivePublicEvent(event_public_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error', error: 'Error deleting event' });
                    }
                    const admin_id = decoded.admin_id; 
                    adminModel.logAdminAction(admin_id, `Retrieved private event`);
                    res.json({ status: 'success' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'An error occurred while deleting the college' });
    }
});


router.post('/view_active_public_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            publicEventModel.viewActivePublicEvents((error, results) => {
                const admin_id = decoded.admin_id;
                adminModel.logAdminAction(admin_id, `Public events viewed`);
                res.json(results);
            })
        }
    });
})

router.post('/view_deleted_public_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            publicEventModel.viewDeletedPublicEvents((error, results) => {
                if (results.length > 0) {
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Viewed deleted public events`);
                    res.json(results);
                }
                else {
                    res.json({ status: 'No events found' });
                }

            })
        }
    });
})

router.post('/complete_private_event', async (req, res) => {
    try {
        const { event_private_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                const admin_id = decoded.admin_id;
                privateEventModel.setEventComplete(event_private_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error' });
                    }
                    adminModel.logAdminAction(admin_id, `Marked event ID: ${event_private_id} as complete`);
                    res.json({ status: 'success' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'An error occurred while deleting the college' });
    }
});

router.post('/view_completed_private_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            privateEventModel.viewCompletedEvents((error, results) => {
                if (results.length > 0) {
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Viewed completed private events`);
                    res.json(results);
                }
                else {
                    res.json({ status: 'No events found' });
                }
            })
        }
    });
})

router.post('/view_notcompleted_private_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            privateEventModel.viewNotCompletedEvents((error, results) => {
                if (results.length > 0) {
                    res.json(results);
                }
                else {
                    res.json({ status: 'No events found' });
                }
            })
        }
    });
})

router.post('/addSession', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const data = req.body;
        const admin_id = decoded.admin_id;
        privateEventModel.addSession(data, (err, results) => {
            if (err) {
                return res.json({ "status": "error", "message": err.message });
            }
            else {
                const sessionId = results.insertId;
                const eventID = req.body.event_private_id
                const date = req.body.session_date


                adminModel.logAdminAction(admin_id, `Added session ID: ${sessionId} for event ID: ${eventID} on date: ${date}`);
                // Fetching students
                collegeModel.findEventsByEventId(eventID, (error, students) => {
                    if (error) {
                        return res.json({ status: 'error', message: error });
                    } else {
                        let completed = 0;
                        const totalStudents = students.length;
                        if (totalStudents === 0) {
                            return res.json({ status: "success", "message": "Session added successfully" });
                        }

                        students.forEach(student => {
                            let studentId = student.student_id;
                            const newAttendance = {
                                session_id: sessionId,
                                student_id: studentId,
                                added_date: date
                            };

                            attendenceModel.addAttendance(newAttendance, (err) => {
                                if (err) {
                                    console.error('Error adding attendance: ' + err);
                                    return res.json({ status: 'error', message: error });
                                }
                                completed++;
                                if (completed === totalStudents) {
                                    // Respond with success after processing all students
                                    return res.json({ "status": "success", "message": "Session and attendance added successfully" });
                                }
                            });
                        });
                    }
                });
                // res.json({ "status": "success", "message": "Session added successfully" });
            }
        });
    });
})


router.post('/viewSession', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: "Unauthorized", error: 'Unauthorized' });
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
                const admin_id = decoded.admin_id;
                adminModel.logAdminAction(admin_id, `Viewed private event session`);
                res.json({ "status": "success", "data": formattedResults });
            })
            .catch(err => {
                return res.json({ "status": "error", "message": err.message });
            });
    });
});

router.post('/updateSession', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: "Unauthorized", error: 'Unauthorized' });
            return;
        }
        const { event_private_id, session_private_id } = req.body;
        const admin_id = decoded.admin_id;
        privateEventModel.updateSessionStatus(event_private_id, session_private_id, (err, results) => {
            if (err) {
                return res.json({ "status": "error", "message": err.message });
            }
            adminModel.logAdminAction(admin_id, `Updated session status for session ID: ${session_private_id} in event ID: ${event_private_id}`);
            res.json({ "status": "success", "message": "Session status updated successfully" });
        });
    });
});

router.post('/complete_private_session', async (req, res) => {
    try {
        const { session_private_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                privateEventModel.setSessionComplete(session_private_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error' });
                    }
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Marked private event session as completed`);
                    res.json({ status: 'success' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'An error occurred while deleting the college' });
    }
});

router.post('/complete_public_event', async (req, res) => {
    try {
        const { event_public_id } = req.body;
        const token = req.headers["token"]
        jwt.verify(token, "eventAdmin", (error, decoded) => {
            if (decoded && decoded.adminUsername) {
                const admin_id = decoded.admin_id;
                publicEventModel.setEventComplete(event_public_id, (error, result) => {
                    if (error) {
                        return res.json({ status: 'error' });
                    }
                    adminModel.logAdminAction(admin_id, `Marked event ID: ${event_public_id} as complete`);
                    res.json({ status: 'success' });
                });
            }
            else {
                return res.json({ "status": "unauthorised user" });
            }
        })
    } catch (error) {
        console.error(error);
        res.json({ status: 'error', error: 'An error occurred while deleting the college' });
    }
});

router.post('/view_completed_public_events', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            publicEventModel.viewCompletedEvents((error, results) => {
                if (results.length > 0) {
                    const admin_id = decoded.admin_id;
                    adminModel.logAdminAction(admin_id, `Viewd complete public events`);
                    res.json(results);
                }
                else {
                    res.json({ status: 'No events found' });
                }
            })
        }
    });
})

router.post('/addPublicSession', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const data = req.body;
        const admin_id = decoded.admin_id;
        publicEventModel.addSession(data, (err, results) => {
            if (err) {
                return res.json({ "status": "error", "message": err.message });
            }
            else {
                const sessionId = results.insertId;
                const eventID = req.body.event_public_id
                const date = req.body.session_date


                adminModel.logAdminAction(admin_id, `Added session for public event ID: ${sessionId} for event ID: ${eventID} on date: ${date}`);
                // Fetching users
                publicEventModel.findUsersByEvent(eventID, (error, users) => {
                    if (error) {
                        return res.json({ status: 'error', message: error });
                    } else {
                        let completed = 0;
                        const totalUsers = users.length;
                        if (totalUsers === 0) {
                            return res.json({ status: "success", "message": "Session added successfully" });
                        }

                        users.forEach(student => {
                            let userID = student.user_id;
                            const newAttendance = {
                                session_id: sessionId,
                                user_id: userID,
                                added_date: date
                            };

                            attendenceModel.addPublicAttendance(newAttendance, (err) => {
                                if (err) {
                                    console.error('Error adding attendance: ' + err);
                                    return res.json({ status: 'error', message: error });
                                }
                                completed++;
                                if (completed === totalUsers) {
                                    // Respond with success after processing all students
                                    return res.json({ "status": "success", "message": "Session and attendance added successfully" });
                                }
                            });
                        });
                    }
                });
            }
        });
    });
})

router.post('/setPublicSessionComplete', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: "Unauthorized", error: 'Unauthorized' });
            return;
        }
        const session_public_id = req.body.session_public_id
        console.log(session_public_id)
        const admin_id = decoded.admin_id;
        publicEventModel.setSessionComplete(session_public_id, (err, results) => {
            if (err) {
                return res.json({ "status": "error", "message": err.message });
            }
            adminModel.logAdminAction(admin_id, `Updated session status for public session`);
            res.json({ "status": "success", "message": "Session status updated successfully" });
        });
    });
});

router.post('/viewPublicSession', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (error) {
            console.error('Error verifying token: ' + error);
            res.json({ status: "Unauthorized", error: 'Unauthorized' });
            return;
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
            const admin_id = decoded.admin_id;
            adminModel.logAdminAction(admin_id, `Viewed public event session`);
            res.json({ "data": formattedResults });
        });
    });
});

router.post('/view_private_events_byId', (req, res) => {
    const admintoken = req.headers["token"];
    const { event_private_id } = req.body;
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            privateEventModel.viewPrivateEventsById(event_private_id, (error, results) => {
                res.json(results);
            })
        }
    });
})

router.post('/view_public_events_byId', (req, res) => {
    const admintoken = req.headers["token"];
    const { event_public_id } = req.body;
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            publicEventModel.viewPublicEventsById(event_public_id, (error, results) => {
                res.json(results);
            })
        }
    });
})


module.exports = router