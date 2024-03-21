const express = require("express")

const feedbackModel = require("../models/feedbackModel")
const router = express.Router()

//student feedback
router.post("/addfeedbackstud", async (req, res) => {
    let data = req.body
    console.log(data)
    feedbackModel.insertFeedbackStud(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success" });
    });
})

router.get('/viewallfeedbackstud', (req, res) => {
    feedbackModel.viewFeedbackStud((error, results) => {
        res.json(results);
    })
});

//user feedback
router.post("/addfeedbackuser", async (req, res) => {
    let data = req.body
    console.log(data)
    feedbackModel.insertFeedbackUser(data, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ status: "success" });
    });
})

router.get('/viewallfeedbackuser', (req, res) => {
    feedbackModel.viewFeedbackUser((error, results) => {
        res.json(results);
    })
});



module.exports = router