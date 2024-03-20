const express=require("express")
const cors=require("cors")

const feedbackRouter=require("./controllers/feedbackRouter")


const app=express()
const port =8085;

app.use(express.json())
app.use(cors())


app.use("/api/feedback", feedbackRouter)


app.listen(port, ()=>{
    console.log("Server running on",port)
})