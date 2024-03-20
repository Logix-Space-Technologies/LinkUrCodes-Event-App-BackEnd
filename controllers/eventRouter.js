const express = require("express")

const eventModel = require("../models/publicEventModel")
const router = express.Router()

router.post("/add_public_events", async (req, res) => {
    let data = req.body
    console.log(data)
    eventModel.insertEvents(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success"});
    });
})

router.get('/view_public_events', (req, res) => {
    eventModel.viewEvents((error, results) => {
        res.json(results);
    })
});



module.exports = router
