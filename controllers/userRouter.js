
const express = require("express")
const userModel = require("../models/userModel")
const bcrypt = require("bcryptjs")

hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}

const router = express.Router()

//route to add a user
router.post('/signup', async (req, res) => {
    let { data } = { "data": req.body }
    let password = data.user_password
    const hashedPassword = await hashPasswordgenerator(password)
    data.user_password = hashedPassword
    userModel.insertUser(req.body, (error, results) => {
        if (error) {
            res.status(500).send('Error inserting user data' + error)
            return
        }
        res.status(201).send('User added with ID')
    })


});


router.post('/loginuser', (req, res) => {
    const { user_email, user_password } = req.body;

    userModel.userLogin(user_email, (error, user) => { // Remove user_password parameter
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
            // Successful login
            return res.json({
                status: "Success",
                userData: user
            });
        });
    });
});



//route to view a user
router.post('/searchusers', (req, res) => {
    var useremail = req.body.user_email;

    userModel.searchUser(useremail, (error, results) => {
        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).json({
                status: "Internal Server Error"
            });
        }

        if (results.length === 0) {
            // If no user found with the provided ID
            return res.status(404).json({
                status: "User Not Found"
            });
        }

        // Assuming there is only one matching row, extract user data
        const userData = results[0];

        // Prepare response data
        const responseData = {
            name: userData.user_name,
            email: userData.user_email
        };

        console.log(responseData);

        return res.json(responseData);
    });
});

router.get('/viewusers', (req, res) => {
    userModel.viewUsers((error, results) => {
        if (error) {
            res.status(500).send('Error fetching users:' + error)
            return
        }
        res.status(200).json(results);
    })
})





module.exports = router
