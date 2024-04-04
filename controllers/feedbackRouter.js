const express = require("express")
const feedbackModel = require("../models/feedbackModel")
const router = express.Router()
const jwt = require("jsonwebtoken")

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

router.post('/viewallfeedbackstud', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            feedbackModel.viewFeedbackStud((error, results) => {
                res.json(results);
            })
        }
    });
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

router.post('/viewallfeedbackuser', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            feedbackModel.viewFeedbackUser((error, results) => {
                res.json(results);
            })
        }
    });
});

module.exports = router