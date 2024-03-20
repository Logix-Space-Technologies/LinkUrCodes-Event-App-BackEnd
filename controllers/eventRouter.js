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



module.exports = router
