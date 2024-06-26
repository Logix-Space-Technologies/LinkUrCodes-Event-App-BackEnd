const express=require("express")
const cors=require("cors")
const certificateRouter = require("./controllers/certificateRoutes")
const userRouter=require("./controllers/userRouter")
const collegeRouter=require("./controllers/collegeRouter")
const paymentRouter=require("./controllers/paymentRouter")
const adminRouter=require('./controllers/adminRouter')
const eventRouter=require('./controllers/eventRouter')
const studentRouter=require('./controllers/studentRouter')
const feedbackRouter=require("./controllers/feedbackRouter")
const attendencerouter=require("./controllers/attendencerouter")


const app=express()
const port =8085;

app.use(express.json())
app.use(cors())


app.use("/api/college",collegeRouter)

app.use("/api/payment",paymentRouter)

app.use("/api/events", eventRouter)

app.use("/api/admin",adminRouter)


app.use("/api/student",studentRouter)

app.use("/api/users",userRouter)

app.use("/api/feedback", feedbackRouter)


app.use("/api/certificate", certificateRouter)

app.use('/uploads', express.static('uploads'));


app.use("/api/attendence",attendencerouter)

app.listen(port, ()=>{
    console.log("Server running on",port)
})