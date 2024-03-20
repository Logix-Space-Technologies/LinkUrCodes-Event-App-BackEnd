const express=require("express")
const cors=require("cors")

const paymentRouter=require("./controllers/paymentRouter")

const adminRouter=require('./controllers/adminRouter')


const app=express()
const port =8085;

app.use(express.json())
app.use("/api/payment",paymentRouter)

app.use("/api/admin",adminRouter)

app.listen(port, ()=>{
    console.log("Server running on",port)
})