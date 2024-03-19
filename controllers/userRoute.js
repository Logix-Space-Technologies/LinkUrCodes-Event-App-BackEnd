const express=require("express")
const userModel=require("../models/userModel")
const bcrypt=require("bcryptjs")

hashPasswordgenerator=async(pass)=>{
    const salt=await bcrypt.genSalt(10)
    return bcrypt.hash(pass,salt)
}

const router=express.Router()

//route to add a user
router.post('/adduser',async(req,res)=>{
    let{data}={"data":req.body}
    let password=data.user_password
    const hashedPassword=await hashPasswordgenerator(password)
    data.user_password=hashedPassword
    userModel.insertUser(req.body,(error,results)=>{
        if (error) {
            res.status(500).send('Error inserting member data'+error)
            return
        }
        res.status(201).send(`Member added with ID`)
    })

    
});

//route to view a user
router.post('/viewusers', (req, res) => {
    var userId = req.body.id;

    userModel.viewUser(userId, (error, results) => {
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





module.exports=router
