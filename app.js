const express=require("express")
const cors=require("cors")
const collegeRouter=require("./controllers/collegeRouter")

const paymentRouter=require("./controllers/paymentRouter")

const adminRouter=require('./controllers/adminRouter')


const app=express()
const port =8085;
const eventRouter = require("./controllers/eventRouter")
app.use(express.json())
app.use(cors())


app.use("/api/college",collegeRouter)

app.use("/api/payment",paymentRouter)


app.use("/api/events", eventRouter)


app.use("/api/admin",adminRouter)


app.listen(port, ()=>{
    console.log("Server running on",port)
})