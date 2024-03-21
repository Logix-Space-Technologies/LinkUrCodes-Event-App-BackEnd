const express = require("express")

const publicEventModel = require("../models/publicEventModel")
const privateEventModel = require("../models/privateEventModel")
const router = express.Router()

router.post("/add_public_events", async (req, res) => {
    let data = req.body
    console.log(data)
    publicEventModel.insertPublicEvents(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success"});
    });
})

router.get('/view_public_events', (req, res) => {
    publicEventModel.viewPublicEvents((error, results) => {
        res.json(results);
    })
});

router.post("/add_private_events", async (req, res) => {
    let data = req.body
    console.log(data)
    privateEventModel.insertPrivateEvents(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success"});
    });
})

router.get('/view_private_events', (req, res) => {
    privateEventModel.viewPrivateEvents((error, results) => {
        res.json(results);
    })
});

router.put('/update_private_events', (req, res) => {
    const { event_private_id, updatedFields } = req.body;

    if (!event_private_id || !updatedFields) {
        return res.status(400).json({ error: 'Event ID and updated fields are required' });
    }

    privateEventModel.updatePrivateEvents(event_private_id, updatedFields, (error, result) => {
        if (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Event updated successfully');
            res.status(200).json({ message: 'Event updated successfully' });
        }
    });
});


router.put('/update_public_events', (req, res) => {
    const { event_public_id, updatedFields } = req.body;

    if (!event_public_id || !updatedFields) {
        return res.status(400).json({ error: 'Event ID and updated fields are required' });
    }

    publicEventModel.updatePublicEvents(event_public_id, updatedFields, (error, result) => {
        if (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Event updated successfully');
            res.status(200).json({ message: 'Event updated successfully' });
        }
    });
});


module.exports = router
