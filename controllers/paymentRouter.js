const express = require("express")
const paymentModel = require("../models/payment_userModel")
constpaycollegeModel = require("../models/payment_collegeModel")
const { error } = require("console");
const paymentcollegeModel = require("../models/payment_collegeModel");
const jwt = require("jsonwebtoken")
const router = express.Router()

router.post('/adduserpayment', (req, res) => {
  console.log(req.body)
  paymentModel.insertpayment(req.body, (error, results) => {
    if (error) {
      res.status(500).send('Error in gaving payments' + error);
      return;
    }
    res.status(201).send(`payment added with ID: ${results.insertId}`);
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



//payment college details

router.post('/addcollegepayment', (req, res) => {
  console.log(req.body)
  paymentcollegeModel.insertpayment(req.body, (error, results) => {
    if (error) {
      res.status(500).send('Error in gaving payments' + error);
      return;
    }
    res.status(201).send(`payment added with ID: ${results.insertId}`);
  });
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


// router.post('/sortviewpayclg', (req, res) => {
//   paymentcollegeModel.sortPaymentByEventdate((error, results) => {
//       res.json(results);
//   })
// });

// router.post('/searchbyevntmonth', (req, res) => {
//   // Assuming you're sending the event month as a string in the request body
//   const { event_private_date } = req.body; // Assuming event_private_date is the key for the month value in the request body

//   // Log to check if the endpoint is accessed
//   console.log("Searching events for month:", event_private_date);

//   // Check if the event month is provided
//   if (!event_private_date) {
//       return res.status(400).json({ message: 'Event month is required.' });
//   }

//   // Convert the event month to an integer
//   const eventMonthInt = parseInt(event_private_date);

//   // Call the function to search and sort payments by event date
//   paymentcollegeModel.sortPaymentByEventdate(eventMonthInt, (error, details) => {
//       if (error) {
//           return res.status(500).json({ message: error.message });
//       }
//       // Return the details if found
//       res.json({ details });
//   });
// });
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

// router.post('/searchbyevntmonth', (req, res) => {
//   // Assuming you're sending the college name as a query parameter
//   const event_private_date = req.body;
//   console.log("hai") // Correctly using console.log here

//   if (!event_private_date) {
//       return res.status(400).json({ message: 'no events' });
//   }

//  paymentcollegeModel.sortPaymentByEventdate(event_private_date, (error, details) => {
//       if (error) {
//           return res.status(500).json({ message: error.message });
//       }
//       res.json({ details });
//   });
// });
module.exports = router;