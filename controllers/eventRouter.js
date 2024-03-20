const express = require("express")

const eventModel = require("../models/eventModel")
const router = express.Router()

router.post("/addevents", async (req, res) => {
    let data = req.body
    console.log(data)
    eventModel.insertEvents(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success"});
    });
})

router.get('/viewallevents', (req, res) => {
    eventModel.viewEvents((error, results) => {
        res.json(results);
    })
});



module.exports = router
