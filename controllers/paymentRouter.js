const express=require("express")
const paymentModel=require("../models/payment_userModel")
constpaycollegeModel=require("../models/payment_collegeModel")
const { error } = require("console");
const paymentcollegeModel = require("../models/payment_collegeModel");

const router=express.Router()

router.post('/adduserpayment', (req, res) => {
    console.log(req.body)
  paymentModel.insertpayment(req.body, (error, results) => {
    if (error) {
      res.status(500).send('Error in gaving payments'+error);
      return;
    }
    res.status(201).send(`payment added with ID: ${results.insertId}`);
  });
});

router.get('/userpaymenthistory',(req,res)=>{
    paymentModel.viewPayments((error,results)=>{
      if(error){
        res.status(500).send('Error fetching payments:'+error)
        return
      }
      res.status(200).json(results);
    })
  })



  //payment college details

  router.post('/addcollegepayment', (req, res) => {
    console.log(req.body)
  paymentcollegeModel.insertpayment(req.body, (error, results) => {
    if (error) {
      res.status(500).send('Error in gaving payments'+error);
      return;
    }
    res.status(201).send(`payment added with ID: ${results.insertId}`);
  });
});

router.get('/collegepaymenthistory',(req,res)=>{
  paymentcollegeModel.viewPayments((error,results)=>{
    if(error){
      res.status(500).send('Error fetching payments:'+error)
      return
    }
    res.status(200).json(results);
  })
})

  module.exports=router;