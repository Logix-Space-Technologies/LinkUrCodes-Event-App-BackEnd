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

module.exports = router;