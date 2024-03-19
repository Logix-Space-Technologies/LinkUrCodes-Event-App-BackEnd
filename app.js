const express=require("express")
const cors=require("cors")

const app=express()
const port =8085;

app.use(express.json())



app.listen(port, ()=>{
    console.log("Server running on",port)
})