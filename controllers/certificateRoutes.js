const express = require('express');
const router = express.Router();
const certificateModel = require('../models/certificate');





router.post('/generate-certificate/private', (req, res) => {
    const { certificate_student_id, certificate_name, Issued_By } = req.body;
    certificateModel.findPrivateEventsByStudentId(certificate_student_id, (err, privateEvents) => {
        if (err) {
            console.error('Error fetching private events for student: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (privateEvents.length === 0) {
            res.status(400).json({ error: 'No private events found for the student' });
            return;
        }
        const privateEventIds = privateEvents.map(event => event.event_id);
        console.log(privateEventIds);
        const promises = privateEventIds.map(privateEventId => {
            return new Promise((resolve, reject) => {
                certificateModel.insertCertificateStudent({
                    certificate_private_event_id: privateEventId,
                    certificate_student_id: certificate_student_id,
                    certificate_name: certificate_name,
                    Issued_By: Issued_By,
                    status: 'pending'
                }, (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting certificate request: ' + err);
                        reject(err);
                    } else {
                        resolve(insertResult);
                    }
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                console.log('All certificate requests inserted successfully');
                res.status(200).json({ message: 'Certificate requests generated successfully' });
            })
            .catch(err => {
                console.error('Error inserting certificate requests: ' + err);
                res.status(500).json({ error: 'Internal server error' });
            });
    });
});






router.post('/generate-certificate/public', (req, res) => {
    const { certificate_user_id, certificate_name , Issued_By } = req.body;
    certificateModel.findPublicEventsByUserId(certificate_user_id, (err, publicEvents) => {
        if (err) {
            console.error('Error fetching public events for user: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        console.log(publicEvents);
        if (publicEvents.length === 0) {
            res.status(400).json({ error: 'No public events found for the user' });
            return;
        }
        const publicEventIds = publicEvents.map(event => event.payment_event_id);
        console.log(publicEventIds);
        const promises = publicEventIds.map(publicEventId => {
            return new Promise((resolve, reject) => {
        certificateModel.insertCertificateUser({
        certificate_user_id: certificate_user_id,
        certificate_public_event_id: publicEventId,
        certificate_name: certificate_name,
        Issued_By: Issued_By,
        status: 'pending'
    }, (err, insertResult) => {
        if (err) {
            console.error('Error inserting certificate request: ' + err);
            reject(err);
        } else {
            resolve(insertResult);
        }
    });
});
});

Promise.all(promises)
.then(() => {
    console.log('All certificate requests inserted successfully');
    res.status(200).json({ message: 'Certificate requests generated successfully' });
})
.catch(err => {
    console.error('Error inserting certificate requests: ' + err);
    res.status(500).json({ error: 'Internal server error' });
});
});
});





router.get('/requests/private', (req, res) => {
    certificateModel.findCertificatesByPrivateEvent((err, results) => {
        if (err) {
            console.error('Error fetching certificate requests: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});





router.get('/requests/public', (req, res) => {
    certificateModel.findCertificatesByPublicEvent((err, results) => {
        if (err) {
            console.error('Error fetching certificate requests: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});





router.post('/approve-request/user', (req, res) => {
    const { certificate_user_id } = req.body;
    certificateModel.updateCertificateStatusUser(certificate_user_id, 'approved', (err, result) => {
        if (err) {
            console.error('Error approving request: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json({ message: 'Certificate request approved successfully' });
    });
});





router.post('/approve-request/student', (req, res) => {
    const { certificate_student_id } = req.body;
    certificateModel.updateCertificateStatusStudent(certificate_student_id, 'approved', (err, result) => {
        if (err) {
            console.error('Error approving request: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json({ message: 'Certificate request approved successfully' });
    });
});





router.post('/deny-request/user', (req, res) => {
    const { certificate_user_id } = req.body;
    certificateModel.updateCertificateStatusUser(certificate_user_id, 'denied', (err, result) => {
        if (err) {
            console.error('Error denying request: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json({ message: 'Certificate request denied successfully' });
    });
});





router.post('/deny-request/student', (req, res) => {
    const { certificate_student_id } = req.body;
    certificateModel.updateCertificateStatusStudent(certificate_student_id, 'denied', (err, result) => {
        if (err) {
            console.error('Error denying request: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json({ message: 'Certificate request denied successfully' });
    });
});






router.get('/certificates/user', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    certificateModel.findCertificatesByUsers(user_id, (err, results) => {
        if (err) {
            console.error('Error fetching certificate requests: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});





router.get('/certificates/student', (req, res) => {
    const { student_id } = req.body;
    if (!student_id) {
        return res.status(400).json({ error: 'Student ID is required' });
    }
    certificateModel.findCertificatesByStudents(student_id, (err, results) => {
        if (err) {
            console.error('Error fetching certificate requests: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});






module.exports = router;
