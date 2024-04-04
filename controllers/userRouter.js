
const express = require("express")
const userModel = require("../models/userModel")
const validateModel=require("../models/validateModel")
const mailerModel=require("../models/mailerModel")
const bcrypt = require("bcryptjs")
const nodemailer = require('nodemailer');

const { error } = require("console");

const jwt=require("jsonwebtoken")


hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}

const router = express.Router()


// Route for signing up a new user
router.post('/signup', async (req, res) => {
    try {
        let { data } = { "data": req.body };
        let password = data.user_password;
        let email = data.user_email;
        const { isValid, message } = await validateModel.validateAndCheckEmail(email);
        if (!isValid) {
            return res.status(400).json({ message });
        }
        if (!validateModel.validatePassword(password)) {
            return res.status(400).send('Password should be 8 character long with atleast one uppercase,lowercase,special character and a digit');
        }
        const hashedPassword = await hashPasswordgenerator(password);
        data.user_password = hashedPassword;

        // Insert the user into the database
        userModel.insertUser(data, async(error, results) => {
            if (error) {
                res.status(500).send('Error inserting user data: ' + error);
                return;
            }

            try {
                let user_name=data.user_name;
                let textsend = `Dear ${user_name},\n\nYou have successfully registered.`;
                let subjectheading = 'Successfully Registered'
                // Send password reset email
                await mailerModel.sendEmail(email, subjectheading, textsend);
                return res.json({ status: "success", message: "Message has been sent to your email" });
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }


            //Send a welcome email
            // const mailOptions = {
            //     from: process.env.EMAIL_USER, // Sender's email address
            //     to: data.user_email, // Recipient's email address
            //     subject: 'Welcome!', // Email subject
            //     text: `Dear ${data.user_name},\n\nWelcome to our platform! We're excited to have you as a new user.\n\nBest regards,\nThe Team` // Email body
            // };

            // transporter.sendMail(mailOptions, (error, info) => {
            //     if (error) {
            //         console.error('Error sending welcome email:', error);
                    
            //     } else {
            //         console.log('Welcome email sent:', info.response);
            //     }
            // });

            // res.status(201).send('User added with ID: ' + results.insertId+'\nPlease check your mailbox');

        });
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/loginuser', (req, res) => {
    const { user_email, user_password } = req.body;

    userModel.userLogin(user_email, (error, user) => { 
        if (error) {
            return res.json({
                status: "Error"
            });
        }
        if (!user) {
            return res.json({
                status: "Invalid Email ID"
            });
        }
        // Compare the password retrieved from the database with the provided password
        bcrypt.compare(user_password, user.user_password, (err, isMatch) => {
            if (err) {
                return res.json({
                    status: "Error"
                });
            }
            if (!isMatch) {
                return res.json({
                    status: "Invalid Password"
                });
            }
           jwt.sign({email:user_email},"user-eventapp",{expiresIn:"1d"},
           (error,token)=>{
            if (error) {
                res.json({
                    status:"error",
                    "error":error
                })
            } else {
                 // Successful login
            return res.json({
                status: "Success",
                userData: user,"token":token
            });
            }
           })
        });
    });
});



//route to view a user
router.post('/searchusers', (req, res) => {
    const searchTerm = req.body.term;
    const token=req.headers["token"]
    jwt.verify(token, "eventapp", (error, decoded) => {
        if (error) {
            console.error('Error verifying token:', error);
            return res.status(401).json({ status: "Unauthorized" });
        }
        
        userModel.searchUser(searchTerm, (error, results) => {
            if (error) {
                console.error('Error fetching user data:', error);
                return res.status(500).json({ status: "Internal Server Error" });
            }

            if (results.length === 0) {
                // If no users found with the provided search term
                return res.status(404).json({ status: "Users Not Found" });
            }

            // Prepare response data
            const responseData = results.map(userData => ({
                name: userData.user_name,
                email: userData.user_email
            }));

            console.log(responseData);

            return res.json(responseData);
        });
    });
   
});




router.post('/viewusers',(req,res)=>{
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
        userModel.viewUsers((error,results)=>{
            if(error){
              res.status(500).send('Error fetching users:'+error)
              return
            }
            res.status(200).json(results);
      
          })
    } else {
        res.json({
            "status":"Unauthorized user"
        })
    }
   })
})

// router.post('/studviewusers',(req,res)=>{
//     const token=req.headers["token"]
//    jwt.verify(token,"stud-eventapp",(error,decoded)=>{
//     if (decoded && decoded.email) {
//         userModel.viewUsers((error,results)=>{
//             if(error){
//               res.status(500).send('Error fetching users:'+error)
//               return
//             }
//             res.status(200).json(results);
      
//           })
//     } else {
//         res.json({
//             "status":"Unauthorized user"
//         })
//     }
//    })
// })

  router.post('/delete-users', (req, res) => {
    const user_id = req.body.user_id; // Extract user_id from req.body

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required in the request body' });
    }
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    userModel.deleteUsers(user_id, (error, result) => {
        if (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (result.affectedRows > 0) {
                console.log('User deleted successfully');
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                console.log('User not found');
                res.status(404).json({ error: 'User not found' });
            }
        }
    });
    }
    else{
        res.json({
            "status":"Unauthorized user"
        })
    }
})
});

router.post('/sortuserbyeventid', (req, res) => {
    const { payment_event_id } = req.body; // Assuming the event_id is provided in the request body
    console.log("hai"); // Correctly using console.log here

    if (!payment_event_id) {
        return res.status(400).json({ message: 'Event ID is required' });
    }
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    userModel.sortStudentsByevent(payment_event_id, (error, users) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json({ users });
    });
    }
    else{
        res.json({
            "status":"Unauthorized user"
        }) 
    }
    })
});

module.exports = router
