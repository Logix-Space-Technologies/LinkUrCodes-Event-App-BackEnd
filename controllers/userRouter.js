
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

router.get('/viewusers',(req,res)=>{
    userModel.viewUsers((error,results)=>{
      if(error){
        res.status(500).send('Error fetching trainers:'+error)
        return
      }
      res.status(200).json(results);
    })
  })

  router.post('/delete-users', (req, res) => {
    const user_id = req.body.user_id; // Extract user_id from req.body

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required in the request body' });
    }

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
});


module.exports=router
