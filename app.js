const express=require("express")
const cors=require("cors")
const userRouter=require("./controllers/userRoute")

const app=express()
const port =8085;

app.use(express.json())

app.use("/api/users",userRouter)

app.listen(port, ()=>{
    console.log("Server running on",port)
})