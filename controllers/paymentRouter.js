const express=require("express")
const paymentModel=require("../models/paymentModel")
const { error } = require("console");

const router=express.Router()

router.post('/addpayment', (req, res) => {
    console.log(req.body)
  paymentModel.insertpayment(req.body, (error, results) => {
    if (error) {
      res.status(500).send('Error in gaving payments'+error);
      return;
    }
    res.status(201).send(`payment added with ID: ${results.insertId}`);
  });
});

router.get('/paymenthistory',(req,res)=>{
    paymentModel.viewPayments((error,results)=>{
      if(error){
        res.status(500).send('Error fetching payments:'+error)
        return
      }
      res.status(200).json(results);
    })
  })

  module.exports=router;