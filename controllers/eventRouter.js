const express = require("express")

const publicEventModel = require("../models/publicEventModel")
const privateEventModel = require("../models/privateEventModel")
const router = express.Router()
const jwt = require("jsonwebtoken")
const uploadModel=require("../models/uploadModel")


router.post("/add_public_events", uploadModel.EventImageUpload.single('image'), async (req, res) => {
    let data = req.body
    console.log(data)
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    publicEventModel.insertPublicEvents(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success"});
    });
    }
    else{
        res.json({
            "status":"Unauthorized user"
        })
    }
})
})

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


router.post("/add_private_events", uploadModel.EventImageUpload.single('image'), async (req, res) => {
    const token = req.headers["token"]
    jwt.verify(token,"eventAdmin",(error,decoded)=>{
        
     if (decoded && decoded.adminUsername) {
         if (!req.file) {
             return res.status(400).json({ error: 'No file uploaded' });
         }
         const imagePath = req.file.path; //image path
         let data = req.body
         const newData = {
             event_private_name: data.event_private_name,
             event_private_amount: data.event_private_amount,
             event_private_description: data.event_private_description,
             event_private_date: data.event_private_date,
             event_private_time: data.event_private_time,
             event_private_image: imagePath,
             event_private_clgid: data.event_private_clgid,
             event_addedby: data.event_addedby,
             event_updatedby: data.event_addedby 
         }
     privateEventModel.insertPrivateEvents(newData, (error, results) => {
         if (error) {
             return res.status(500).json({ message: error.message });
         }
         res.json({ status: "success"});
     });
     }
     else{
         res.json({
             "status":"Unauthorized user"
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

router.post('/update_private_events', uploadModel.EventImageUpload.single('image'), async (req, res) => {
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
                event_updatedby: data.event_updatedby
            };

            // Conditionally add image path if an image was uploaded
            if (req.file && req.file.path) {
                newData.event_private_image = req.file.path; // Add only if image is uploaded
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


router.put('/update_public_events',uploadModel.EventImageUpload.single('image'), (req, res) => {
    const { event_public_id, updatedFields } = req.body;

    if (!event_public_id || !updatedFields) {
        return res.status(400).json({ error: 'Event ID and updated fields are required' });
    }
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    publicEventModel.updatePublicEvents(event_public_id, updatedFields, (error, result) => {
        if (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Event updated successfully');
            res.status(200).json({ message: 'Event updated successfully' });
        }
    });
    }
    else{
        res.json({
            "status":"Unauthorized user"
        })
    }
})
});

router.post('/search-public-events', (req, res) => {
    const eventName = req.body.event_public_name; // Assuming the event name is sent in the request body
    if (!eventName) {
        return res.status(400).json({ error: 'Event name is required' });
    }
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    publicEventModel.searchPublicEvents(eventName, (err, results) => {
        if (err) {
            console.error('Error searching for events:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
    }
    else{
        res.json({
            "status":"Unauthorized user"
        })
    }
})
});

router.post('/search-private-events', (req, res) => {
    const eventName = req.body.event_private_name; // Assuming the event name is sent in the request body
    if (!eventName) {
        return res.status(400).json({ error: 'Event name is required' });
    }
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    privateEventModel.searchPrivateEvents(eventName, (err, results) => {
        if (err) {
            console.error('Error searching for events:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
    }
    else{
        res.json({
            "status":"Unauthorized user"
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
                res.json(results);
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





module.exports = router