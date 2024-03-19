const express=require("express")
const cors=require("cors")

const app=express()
const port =8085;
const eventRouter = require("./controllers/eventRouter")
app.use(express.json())


app.use("/api/events", eventRouter)


app.listen(port, ()=>{
    console.log("Server running on",port)
})