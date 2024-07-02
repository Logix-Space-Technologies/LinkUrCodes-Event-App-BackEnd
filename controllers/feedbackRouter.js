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
            let event_id=req.body.feedback_event_id
            feedbackModel.viewFeedbackStud(event_id,(error, results) => {
                if (error) {
                    console.error('Error fetching feedback data:', error);
                    return res.json({status:"error", error: 'Error fetching feedback data' });
                } else {
                    if (results.length === 0) {
                        // No feedback found for this session
                        res.json({status:"no feedback", message: 'No Feedback For this event' });
                    } else {
                        console.log('Feedback data retrieved successfully:');
                        res.json(results);
                    }
                }
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
            let event_id=req.body.feedback_event_id
            feedbackModel.viewFeedbackUser(event_id,(error, results) => {
                if (error) {
                    console.error('Error fetching feedback data:', error);
                    return res.json({status:"error", error: 'Error fetching feedback data' });
                } else {
                    if (results.length === 0) {
                        // No feedback found for this session
                        res.json({status:"no feedback", message: 'No Feedback For this event' });
                    } else {
                        console.log('Feedback data retrieved successfully');
                        res.json(results);
                    }
                }
            })
        }
    });
});

router.post('/addSessionStudFeedback', (req, res) => {
    const token = req.headers["token"];

    // Verify the token
    jwt.verify(token, "user-eventapp", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.status(401).json({ status: "Unauthorized" });
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