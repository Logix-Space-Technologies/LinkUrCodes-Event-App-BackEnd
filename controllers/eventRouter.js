const express = require("express")

const publicEventModel = require("../models/publicEventModel")
const privateEventModel = require("../models/privateEventModel")
const router = express.Router()
const jwt = require("jsonwebtoken")
const uploadModel=require("../models/uploadModel")
const multer = require('multer');
const path = require('path');
const UploadModel = require("../models/uploadModel")

router.post("/add_public_events", async (req, res) => {
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

// Multer configuration for file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/events/');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb(new Error('Only JPEG and PNG images are allowed'), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 20 * 1024 * 1024, // 20 MB
//     }
// });
router.post("/add_private_events", UploadModel.EventImageUpload.single('image'), async (req, res) => {
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

router.put('/update_private_events', (req, res) => {
    const { event_private_id, updatedFields } = req.body;

    if (!event_private_id || !updatedFields) {
        return res.status(400).json({ error: 'Event ID and updated fields are required' });
    }
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    privateEventModel.updatePrivateEvents(event_private_id, updatedFields, (error, result) => {
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

router.put('/update_public_events', (req, res) => {
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

module.exports = router