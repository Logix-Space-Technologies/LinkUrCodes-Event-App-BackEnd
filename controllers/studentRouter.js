const express=require("express")
const studentModel=require("../models/studentModel")
const bcrypt=require("bcryptjs")
const router=express.Router()

const hashPasswordGenerator=async(pass)=>{
    console.log(pass)
    const salt=await bcrypt.genSalt(10);
    return bcrypt.hash(pass,salt)
}

router.post('/addstudent',async(req,res)=>{
    try{
        let{data}={"data":req.body};
        let password=data.student_password;
        const hashedPassword=await hashPasswordGenerator(password);
        data.student_password=hashedPassword;
        studentModel.insertStudent(data,(error,results)=>{
            if(error){
                return res.status(500).json({message:error.message});
            }
            res.json({status:"success",data:results});
        });
    }catch(err){
        res.status(500).json({message:err.message});
    }
})

router.get('/viewstudent',async(req,res)=>{
    studentModel.viewStudent((error,results)=>{
        res.json(results)
    })
})

// Route to handle student login
// router.post('/login', async (req, res) => {
//     try {
//         const { student_email, student_password } = req.body;

//         // Retrieve the student's data from the database based on the provided email
//         studentModel.loginStudent(student_email, async (error, results) => {
//            // console.log(student_email,student_password)
//             if (error) {
//                 return res.status(500).json({ message: error.message });
//             }

//             if (results.length === 0) {
//                 // No student found with the provided email
//                 return res.status(401).json({ message: 'Invalid credentials' });
//             }

//             const student = results[0];

//             // Compare the provided password with the hashed password stored in the database
//             const passwordMatch = await comparePasswords(student_password, student.student_password);

//             if (!passwordMatch) {
//                 // Passwords do not match
//                 return res.status(401).json({ message: 'Invalid credentials' });
//             }

//             // Passwords match, login successful
//             res.json({ status: "success", data: student });
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });
router.post('/login', async (req, res) => {
    try {
        const { student_email, student_password } = req.body;

        // Check if both email and password are provided
        if (!student_email || !student_password) {
            return res.status(400).json({ message: 'Both email and password are required' });
        }

        // Call the loginStudent function to retrieve student data based on the provided email and password
        studentModel.loginStudent({ student_email, student_password }, async (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            }

            if (results.length === 0) {
                // No student found with the provided email and password
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Passwords match, login successful
            res.json({ status: "success", data: results[0] });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports=router