const express = require("express")

const feedbackModel = require("../models/feedbackModel")
const router = express.Router()

router.post("/addfeedback", async (req, res) => {
    let data = req.body
    console.log(data)
    feedbackModel.insertFeedback(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success" });
    });
})

router.get('/viewallfeedback', (req, res) => {
    feedbackModel.viewFeedback((error, results) => {
        res.json(results);
    })
});



module.exports = router

