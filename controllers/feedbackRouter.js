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

router.post('/addSessionStudFeedback', (req, res) => {
    const token = req.headers['token'];
    const secretKey = "stud-eventapp"; // Your secret key for token verification

    if (!token) {
        return res.json({ status: "error", message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.json({ status: "error", message: 'Invalid token', error: err.message });
        }
        const data = req.body;
        feedbackModel.insertFeedbackSessionStud(data, (err, results) => {
            if (err) {
                return res.json({ status: "error", message: 'Database error', error: err });
            }
            res.json({ status: "success", message: 'Feedback added successfully', data: results });
        });
    });
});

router.post('/viewSessionStudFeedback', (req, res) => {
    const admintoken = req.headers["token"];
    jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.log({ "status": "error", "message": "Failed to verify token" })
            return res.json({ "status": "unauthorised user" });
        }
        if (decoded && decoded.adminUsername) {
            feedbackModel.viewFeedbackSessionStud((error, results) => {
                res.json(results);
            })
        }
    });
});

module.exports = router