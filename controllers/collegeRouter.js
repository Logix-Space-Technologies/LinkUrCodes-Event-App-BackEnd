const express = require('express');
const collegeModel = require('../models/CollegeModel');

const router = express.Router();

// Route to add a new College
router.post('/addCollege', (req, res) => {
    console.log(req.body);
    collegeModel.insertCollege(req.body, (error, results) => {
        if (error) {
            res.status(500).send('Error inserting College data: ' + error);
            return;
        }
        res.status(201).send(`College added with ID: ${results.insertId}`);
    });
});

// Route to get a college by college name
router.post('/searchCollege', (req, res) => {
    var college_name = req.body.college_name; // Use req.body.name to retrieve college name

    collegeModel.findCollegeByName(college_name, (error, results) => {
        if (error) {
            res.status(500).send('Error retrieving college data');
            return;
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).send('College not found');
        }
    });
});

router.get('/Viewcollege',(req,res)=>{
    collegeModel.findCollege((error,results)=>{
      if(error){
        res.status(500).send('Error fetching college_details:'+error)
        return
      }
      res.status(200).json(results);
    });
  });

module.exports = router;
