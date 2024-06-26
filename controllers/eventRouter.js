const express = require("express")

const publicEventModel = require("../models/publicEventModel")
const privateEventModel = require("../models/privateEventModel")
const router = express.Router()
const jwt = require("jsonwebtoken")
const uploadModel = require("../models/uploadModel")


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

router.post("/add_public_events", uploadModel.EventImageUpload.single('image'), async (req, res) => {
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
            const imagePath = req.file.path; // Image path
            const data = req.body;
            const newData = {
                event_public_name: data.event_public_name,
                event_public_amount: data.event_public_amount,
                event_public_description: data.event_public_description,
                event_public_date: data.event_public_date,
                event_public_time: data.event_public_time,
                event_public_image: imagePath,
                event_syllabus: data.event_syllabus,
                event_venue: data.event_venue,
                event_addedby: data.event_addedby,
                event_updatedby: data.event_addedby
            };
            console.log(newData)
            publicEventModel.insertPublicEvents(newData, (error, results) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
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

router.post('/update_private_events', uploadModel.EventImageUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    const token = req.headers["token"];
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (error) {
            return res.status(401).json({ status: 'Unauthorized', message: 'Invalid or expired token' });
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
                event_updatedby: data.event_updatedby
            };
            // Conditionally add image path if an image was uploaded
            if (req.files && req.files['image'] && req.files['image'][0] && req.files['image'][0].path) {
                newData.event_private_image = req.files['image'][0].path;
            }

            // Conditionally add syllabus path if a PDF was uploaded
            if (req.files && req.files['pdf'] && req.files['pdf'][0] && req.files['pdf'][0].path) {
                newData.event_private_syllabus = req.files['pdf'][0].path;
            }

            console.log(newData);
            privateEventModel.updatePrivateEvents(event_id, newData, (error, result) => {
                if (error) {
                    console.error('Error updating event:', error);
                    return res.status(500).json({ status: 'Error', message: 'Failed to update the event' });
                } else {
                    console.log('Event updated successfully');
                    return res.status(200).json({ status: 'Event updated successfully' });
                }
            });
        } else {
            res.status(401).json({
                "status": "Unauthorized",
                "message": "Unauthorized user"
            });
        }
    });
});


router.put('/update_public_events', uploadModel.EventImageUpload.single('image'), (req, res) => {
    const { event_public_id, updatedFields } = req.body;

    if (!event_public_id || !updatedFields) {
        return res.status(400).json({ error: 'Event ID and updated fields are required' });
    }
    const token = req.headers["token"]
    jwt.verify(token, "eventAdmin", (error, decoded) => {
        if (decoded && decoded.adminUsername) {
            publicEventModel.updatePublicEvents(event_public_id, updatedFields, (error, result) => {
                if (error) {
                    console.error('Error updating event:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('Event updated successfully');
                    res.status(200).json({ message: "success" });
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
                privateEventModel.deletePrivateEvent(event_private_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error', error: 'Error deleting event' });
                    }
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
                privateEventModel.setEventComplete(event_private_id, (error, result) => {
                    if (error) {
                        return res.status(500).json({ status: 'error' });
                    }
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





module.exports = router