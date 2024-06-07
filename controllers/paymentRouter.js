const express = require("express")
const paymentModel = require("../models/payment_userModel")
constpaycollegeModel = require("../models/payment_collegeModel")
const { error } = require("console");
const paymentcollegeModel = require("../models/payment_collegeModel");
const jwt = require("jsonwebtoken")
const adminModel = require("../models/adminModel")
const router = express.Router()

router.post('/adduserpayment', (req, res) => {
  console.log(req.body);
  const usertoken = req.headers["usertoken"];
  jwt.verify(usertoken, "user-eventapp", (error, decoded) => {
      if (error) {
          console.error('JWT Verification Error:', error.message);
          return res.status(401).json({ status: "Unauthorized", message: "Invalid or expired token" });
      }

      if (decoded && decoded.email) {
          paymentModel.insertpayment(req.body, (error, results) => {
              if (error) {
                  console.error('Error in payments:', error);
                  return res.status(500).send('Error in payments: ' + error.message);
              }
              res.status(201).json({ message: `Payment added with ID: ${results.insertId}` });
          });
      } else {
          res.status(401).json({ status: "Unauthorized", message: "Unauthorized user" });
      }
  });
});

router.post('/userpaymenthistory', async(req, res) => {
  const admintoken = req.headers["token"];
  jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
    if (error) {
      console.log({ "status": "error", "message": "Failed to verify token" })
      return res.json({ "status": "unauthorised user" });
    }
    if (decoded && decoded.adminUsername) {
      paymentModel.viewPayments((error, results) => {
        if (error) {
          res.status(500).send('Error fetching payments:' + error)
          return
        }
        res.status(200).json(results);
      })
    }
  });
})

router.post('/addcollegepayment', (req, res) => {
  console.log(req.body)
  const collegetoken = req.headers["collegetoken"];
        jwt.verify(collegetoken,"collegelogin",async(error,decoded)=>{
        if (decoded && decoded.college_email)
        {
  paymentcollegeModel.insertpayment(req.body, (error, results) => {
    if (error) {
      res.status(500).send('Error in gaving payments' + error);
      return;
    }
    res.status(201).send(`payment added with ID: ${results.insertId}`);
  });
  }
  else{
    return res.json({ "status": "unauthorised user" });
  }
})
});

router.post('/collegepaymenthistory', (req, res) => {
  const admintoken = req.headers["token"];
  jwt.verify(admintoken, "eventAdmin", async (error, decoded) => {
    if (error) {
      console.log({ "status": "error", "message": "Failed to verify token" })
      return res.json({ "status": "unauthorised user" });
    }
    if (decoded && decoded.adminUsername) {
      paymentcollegeModel.viewPayments((error, results) => {
        if (error) {
          res.status(500).send('Error fetching payments:' + error)
          return
        }
        res.status(200).json(results);
      })
    }
  });
})

router.post('/searchbyevntmonth', (req, res) => {
  // Assuming you're sending the event month as a string in the request body
  const { event_private_date } = req.body; // Assuming event_private_date is the key for the month value in the request body

  // Log to check if the endpoint is accessed
  console.log("Searching events for month:", event_private_date);

  // Check if the event month is provided
  if (!event_private_date) {
      return res.status(400).json({ message: 'Event month is required.' });
  }

  // Convert the event month to an integer
  const eventMonthInt = parseInt(event_private_date);

  // Call the function to search and sort payments by event date
  paymentcollegeModel.sortPaymentByEventdate(eventMonthInt, (error, details) => {
      if (error) {
          return res.status(500).json({ message: error.message });
      }
      
      // Check if the details array is empty
      if (details.length === 0) {
          return res.json({ message: 'No events in this month.' });
      }
      
      // Return the details if found
      res.json({ details });
  });
});
  

//admin
  router.post('/addPaymentCollege', (req, res) => {
    const token = req.headers.token;
    console.log('Received token:', token);
    jwt.verify(token, "eventAdmin", async (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { college_id, private_event_id, amount, invoice_no } = req.body;
        if (!college_id || !private_event_id || !amount || !invoice_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const paymentData = {
            college_id,
            private_event_id,
            amount,
            invoice_no,
        };
        adminModel.insertPayment(paymentData, (error, results) => {
          if (error) {
              console.error('Error inserting payment data:', error);
              return res.status(500).json({ error: 'Internal server error' });
          }
          adminModel.getCollegeNameById(college_id, (error, college_name) => {
              if (error) {
                  console.error('Error fetching college name:', error);
                  return res.status(500).json({ error: 'Internal server error' });
              }
              adminModel.logAdminAction(decoded.admin_id, `Payment done for college: ${college_name}`);
              res.status(200).json({ status: 'success', data: results });
          });
      });
  });
});


//admin
router.post('/viewPaymentsCollege', (req, res) => {
  const token = req.headers.token;
  console.log('Received token:', token);
  jwt.verify(token, "eventAdmin", async (error, decoded) => {
      if (error) {
          console.error('Error verifying token:', error);
          return res.status(401).json({ error: 'Unauthorized' });
      }
      if (decoded && decoded.adminUsername) {
          adminModel.getAllPayments((error, results) => {
              if (error) {
                  console.error('Error fetching payments:', error);
                  return res.status(500).json({ error: 'Internal server error' });
              }
              res.status(200).json({ status: 'success', data: results });
          });
      } else {
          res.status(401).json({ status: 'Unauthorized', message: 'Unauthorized user' });
      }
  });
});



module.exports = router;