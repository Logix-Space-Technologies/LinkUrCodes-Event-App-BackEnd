
const express = require("express")
const adminModel = require("../models/adminModel")
const bcrypt = require("bcryptjs")
const { error } = require("console")
const router = express.Router()
const jwt = require("jsonwebtoken")
const validateModel=require("../models/validateModel")

const hashPasswordGenerator = async (pass) => {
    console.log(pass)
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pass, salt)
}

// const PASSWORD_MIN_LENGTH = 8; // Minimum password length
// const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[@$!%*?&]).{8,}$/; // Password complexity regex with special character

router.post('/addadmin', async (req, res) => {
    try {
        let { data } = { "data": req.body };
        let password = data.admin_password;
        if (!validateModel.validatePassword(password)) {
            return res.status(400).json({ message: "Invalid password. Password should be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@,$,!,%,*,?,&)." });
        }
        const hashedPassword = await hashPasswordGenerator(password);
        data.admin_password = hashedPassword;
        adminModel.insertAdmin(data, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            }
            adminModel.logAdminAction(results.insertId, 'Admin account created');  
            res.json({ status: "success", data: results });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/viewadmin', (req, res) => {
    const token=req.headers["token"]
   jwt.verify(token,"eventAdmin",(error,decoded)=>{
    if (decoded && decoded.adminUsername) {
    adminModel.viewAdmin((error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        adminModel.logAdminAction(decoded.admin_id, 'View Admin');
        res.json({ status: "success", data: results });
    });
    }
    else{
        res.json({
            "status":"Unauthorized user"
        })
    }
})
});


router.post('/loginadmin', (req, res) => {
    const { admin_username, admin_password } = req.body;
    adminModel.loginAdmin(admin_username, (error, admin) => {
        if (error) {
            return res.json({ status: "Error" });
        }
        if (!admin) {
            return res.json({ status: "Invalid Username" });
        }
        bcrypt.compare(admin_password, admin.admin_password, (err, isMatch) => {
            if (err) {
                return res.json({ status: "Error is" });
            }
            if (!isMatch) {
                return res.json({ status: "Invalid Password" });
            }
            jwt.sign({ admin_id: admin.admin_id, adminUsername: admin_username }, "eventAdmin", { expiresIn: "1d" }, (error, token) => {
                if (error) {
                    res.json({ status: "error", error: error });
                } else {
                    adminModel.logAdminAction(admin.admin_id, 'Admin logged in');
                    return res.json({ status: "success", adminData: admin, admintoken: token });
                }
            });
        });
    });
});




module.exports = router