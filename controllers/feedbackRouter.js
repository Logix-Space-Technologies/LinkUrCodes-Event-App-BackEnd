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
        return res.status(403).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token', error: err.message });
        }
        const data = req.body;

        feedbackModel.insertFeedbackSessionStud(data, (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error', error: err });
            }
            res.status(200).json({ success: true, message: 'Feedback added successfully', data: results });
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
            const sessionId = req.body.session_id; // Assuming session_id is in the request body
            feedbackModel.viewFeedbackSessionStud(sessionId, (error, results) => {
                if (error) {
                    console.error('Error fetching feedback data:', error);
                    return res.status(500).json({ error: 'Error fetching feedback data' });
                } else {
                    if (results.length === 0) {
                        // No feedback found for this session
                        res.json({ message: 'No Feedback For this Session' });
                    } else {
                        console.log('Feedback data retrieved successfully:', results);
                        res.json(results);
                    }
                }
            });
        }
    });
});


module.exports = router