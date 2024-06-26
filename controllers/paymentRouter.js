const express = require("express")
require("dotenv").config();
const paymentModel = require("../models/payment_userModel")
constpaycollegeModel = require("../models/payment_collegeModel")
const { error } = require("console");
const paymentcollegeModel = require("../models/payment_collegeModel");
const jwt = require("jsonwebtoken")
const adminModel = require("../models/adminModel")
const router = express.Router()


const Razorpay = require('razorpay');
const crypto = require('crypto');


// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Function to generate Razorpay signature
function generateRazorpaySignature(orderId, paymentId, secret) {
  const data = orderId + '|' + paymentId;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('hex');
}

router.post('/create-order', (req, res) => {
  const { user_id, payment_event_id, payment_amount, currency } = req.body;

  // Convert payment_amount to the smallest currency unit
  const amountInSmallestUnit = Math.round(payment_amount * 100); // Ensure correct conversion

  razorpay.orders.create({ amount: amountInSmallestUnit, currency }, (err, order) => {
    if (err) {
      console.error('Failed to create Razorpay order:', err);
      return res.status(500).send(err);
    }
    res.json(order); // Respond with the entire order object
  });
});

// Adjusted route to capture payment and insert details into the database
router.post('/paymentCapture', (req, res) => {
  const key_secret = process.env.RAZORPAY_SECRET;

  // Extract the payment details from the request body
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, payment_event_id, payment_amount } = req.body;

  // Validate the request by computing the expected signature
  const expectedSignature = generateRazorpaySignature(razorpay_order_id, razorpay_payment_id, key_secret);

  // Log the expected and received signatures for debugging
  console.log('Expected Signature:', expectedSignature);
  console.log('Received Signature:', razorpay_signature);

  if (expectedSignature === razorpay_signature) {
    console.log('Request is legit');
    const paymentDetails = {
      order_id: razorpay_order_id,
      payment_user_id: razorpay_payment_id,
      user_id: user_id,
      payment_event_id: payment_event_id,
      payment_amount: payment_amount,
      currency: 'INR', // Assuming INR as the currency
      status: 'paid', // Assuming status is 'paid' upon successful verification
      created_at: new Date(),
      razorpay_signature: razorpay_signature,
      notes: `Payment for event ${payment_event_id}`
    };

    // Insert payment details into the database
    paymentModel.insertPaymentUser(paymentDetails, (error, results) => {
      if (error) {
        console.error('Failed to insert payment details:', error);
        return res.status(500).json({ success: false, message: 'Failed to insert payment details' });
      }
      console.log('Inserted payment details successfully:', results);
      res.json({ success: true, message: 'Payment verified and details inserted successfully' });
    });
  } else {
    // Log the mismatch
    console.error('Invalid signature. Payment verification failed.');
    res.status(400).send('Invalid signature');
  }
});

router.get('/razorpay-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});










router.post('/userpaymenthistory', async (req, res) => {
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
  jwt.verify(collegetoken, "collegelogin", async (error, decoded) => {
    if (decoded && decoded.college_email) {
      paymentcollegeModel.insertpayment(req.body, (error, results) => {
        if (error) {
          res.status(500).send('Error in gaving payments' + error);
          return;
        }
        res.status(201).send(`payment added with ID: ${results.insertId}`);
      });
    }
    else {
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