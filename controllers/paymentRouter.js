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

// // Function to generate Razorpay signature
// function generateRazorpaySignature(orderId, paymentId, secret) {
//   const data = orderId + '|' + paymentId;
//   const hmac = crypto.createHmac('sha256', secret);
//   hmac.update(data);
//   return hmac.digest('hex');
// }

// Router for creating a new order
router.post('/create-order', (req, res) => {
  const { user_id, payment_event_id, payment_amount, currency } = req.body;

  // Convert payment_amount to the smallest currency unit
  const amountInSmallestUnit = payment_amount * 100; // Assuming the currency is INR

  razorpay.orders.create({ amount: amountInSmallestUnit, currency }, (err, order) => {
    if (err) {
      console.error('Failed to create Razorpay order:', err);
      return res.status(500).send(err);
    }
    res.json(order);
  });
});


// Function to generate Razorpay signature
function generateRazorpaySignature(orderId, paymentId, secret) {
  const data = orderId + '|' + paymentId;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('hex');
}


// Route to capture payment
router.post('/paymentCapture', (req, res) => {
  const key_secret = process.env.RAZORPAY_SECRET;

  // Extract the payment details from the request body
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Validate the request by computing the expected signature
  const expectedSignature = generateRazorpaySignature(razorpay_order_id, razorpay_payment_id, key_secret);

  // Log the expected and received signatures for debugging
  console.log('Expected Signature:', expectedSignature);
  console.log('Received Signature:', razorpay_signature);

  if (expectedSignature === razorpay_signature) {
      console.log('Request is legit');
      const paymentDetails = {
        order_id,
        payment_id,
        status: 'paid', // Assuming status is 'paid' upon successful verification
        created_at: new Date()
      };
    
      // Insert payment details into database
      paymentModel.insertPaymentUser(paymentDetails, (error, results) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Failed to insert payment details' });
        }
        res.json({ success: true, message: 'Payment verified and details inserted successfully' });
      });
      
      // Respond with success and store information in a database
      res.json({ status: 'ok', msg: 'Payment captured successfully' });
    }
  else {
      // Respond with error for invalid signature
      res.status(400).send('Invalid signature');
  }
});



router.get('/razorpay-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});




// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET
// });



// Function to generate Razorpay signature
// function generateRazorpaySignature(orderId, paymentId, secret) {
//   const data = orderId + '|' + paymentId;
//   const hmac = crypto.createHmac('sha256', secret);
//   hmac.update(data);
//   return hmac.digest('hex');
// }

// router.post('/create-order', (req, res) => {
//   const { user_id, payment_event_id, payment_amount, currency } = req.body;

//   // Convert payment_amount to the smallest currency unit
//   const amountInSmallestUnit = payment_amount * 100; // Assuming the currency is INR

//   razorpay.orders.create({ amount: amountInSmallestUnit, currency }, (err, order) => {
//     if (!err) {
//       const paymentUser = {
//         user_id,
//         payment_event_id,
//         payment_amount,
//         currency:'INR',
//         order_id: order.id,
//         status: 'created',
//         created_at: new Date(),
//         updated_at: new Date(),
//       };

//       paymentModel.insertPaymentUser(paymentUser, (error, results) => {
//         if (error) {
//           res.status(500).send(error);
//         } else {
//           res.json(order);
//         }
//       });
//     } else {
//       res.status(500).send(err);
//     }
//   });
// });

// router.post('/paymentCapture', (req, res) => {
//   const { order_id, payment_id } = req.body;
//   const razorpay_signature = req.headers['x-razorpay-signature'];
//   const key_secret = process.env.RAZORPAY_SECRET;

//   // Verification
//   const hmac = crypto.createHmac('sha256', key_secret);
//   hmac.update(`${order_id}|${payment_id}`);
//   const generated_signature = hmac.digest('hex');

//   // Compare signatures
//   if (razorpay_signature === generated_signature) {
//       // Signature verification passed
//       paymentModel.updatePaymentUserStatus(order_id, payment_id, razorpay_signature, 'verified', (error, results) => {
//           if (error) {
//               res.status(500).send(error);
//           } else {
//               res.json({ success: true, message: "Payment has been verified" });
//           }
//       });
//   } else {
//       // Signature verification failed
//       res.status(400).json({ success: false, message: "Payment verification failed" });
//   }
// });









// // Route to create order
// router.post('/create-order', async (req, res) => {
//   const { event_public_id, payment_amount, currency, user_id } = req.body;

//   try {
//     if (!event_public_id || !payment_amount || !currency || !user_id) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     const options = {
//       amount: parseInt(payment_amount) * 100, // Razorpay amount is in paise
//       currency,
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     // Log the order details in the console
//     console.log('Razorpay Order:', order);

//     // Insert payment details into the database
//     const paymentData = {
//       user_id,
//       payment_event_id: event_public_id,
//       payment_amount,
//       currency,
//       order_id: options.receipt,
//       razorpay_order_id: order.id
//     };

//     paymentModel.insertPayment(paymentData, (err, results) => {
//       if (err) {
//         console.error('Error inserting payment details:', err);
//         return res.status(500).json({ success: false, message: 'Error inserting payment details' });
//       }

//       res.json({
//         success: true,
//         order_id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         event_public_id,
//         user_id
//       });
//     });
//   } catch (error) {
//     console.error('Error creating order:', error); // Log the error
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Route to capture payment
// router.post('/paymentCapture', (req, res) => {
//   const key_secret = process.env.RAZORPAY_SECRET;

//   // Extract the payment details from the request body
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   // Validate the request by computing the expected signature
//   const expectedSignature = generateRazorpaySignature(razorpay_order_id, razorpay_payment_id, key_secret);

//   // Log the expected and received signatures for debugging
//   console.log('Expected Signature:', expectedSignature);
//   console.log('Received Signature:', razorpay_signature);

//   if (expectedSignature === razorpay_signature) {
//     console.log('Request is legit');

//     // Update payment details in the database
//     const updateData = {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     };

//     paymentModel.updatePayment(updateData, (err, results) => {
//       if (err) {
//         console.error('Error updating payment details:', err);
//         return res.status(500).json({ success: false, message: 'Error updating payment details' });
//       }

//       res.json({ status: 'ok', msg: 'Payment captured successfully' });
//     });
//   } else {
//     // Respond with error for invalid signature
//     res.status(400).send('Invalid signature');
//   }
// });



// router.post('/create-order', async (req, res) => {
//   const { event_public_id, payment_amount, currency, user_id } = req.body;

//   try {
//     if (!event_public_id || !payment_amount || !currency || !user_id) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     const options = {
//       amount: parseInt(payment_amount) * 100, // Razorpay amount is in paise
//       currency,
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     // Log the order details in the console
//     console.log('Razorpay Order:', order);

//       res.json({
//         success: true,
//         order_id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         event_public_id,
//         user_id
//       });

//   } catch (error) {
//     console.error('Error creating order:', error); // Log the error
//     res.status(500).json({ success: false, message: error.message });
//   }
// });







// // Route to capture payment
// router.post('/paymentCapture', (req, res) => {
//   const key_secret = process.env.RAZORPAY_SECRET;

//   // Extract the payment details from the request body
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   // Validate the request by computing the expected signature
//   const expectedSignature = generateRazorpaySignature(razorpay_order_id, razorpay_payment_id, key_secret);

//   // Log the expected and received signatures for debugging
//   console.log('Expected Signature:', expectedSignature);
//   console.log('Received Signature:', razorpay_signature);

//   if (expectedSignature === razorpay_signature) {
//       console.log('Request is legit');
      
//       // Respond with success and store information in a database
//       res.json({ status: 'ok', msg: 'Payment captured successfully' });
//     }
//   else {
//       // Respond with error for invalid signature
//       res.status(400).send('Invalid signature');
//   }
// });









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