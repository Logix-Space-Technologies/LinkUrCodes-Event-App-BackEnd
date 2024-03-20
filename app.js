const express=require("express")
const cors=require("cors")
const collegeRouter=require("./controllers/collegeRouter")

const app=express()
const port =8085;

app.use(express.json())
app.use(cors())


app.use("/api/college",collegeRouter)

app.listen(port, ()=>{
    console.log("Server running on",port)
})