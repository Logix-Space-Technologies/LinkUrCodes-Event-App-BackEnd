const express=require("express")
const cors=require("cors")
const certificateRouter = require("./controllers/certificateRoutes")

const app=express()
const port =8085;

app.use(express.json())


app.use("/api/certificate", certificateRouter)

app.listen(port, ()=>{
    console.log("Server running on",port)
})