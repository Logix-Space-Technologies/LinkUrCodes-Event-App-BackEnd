const express=require("express")
const adminModel=require("../models/adminModel")
const bcrypt=require("bcryptjs")
const { error } = require("console")
const router=express.Router()

const hashPasswordGenerator=async(pass)=>{
    console.log(pass)
    const salt=await bcrypt.genSalt(10);
    return bcrypt.hash(pass,salt)
}

router.post('/addadmin',async(req,res)=>{
    try{
        let{data}={"data":req.body};
        let password=data.admin_password;
        const hashedPassword=await hashPasswordGenerator(password);
        data.admin_password=hashedPassword;
        adminModel.insertAdmin(data,(error,results)=>{
            if(error){
                return res.status(500).json({message:error.message});
            }
            res.json({status:"success",data:results});
        });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/viewadmin',(req,res)=>{
    adminModel.viewAdmin((error,results)=>{
        res.json(results);
    })
});
    


module.exports=router