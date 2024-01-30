const express = require("express");
const dbConnect = require("./db");

const app = express();

app.get("/", (req, res)=> {
    res.status(200).json({msg:"app is running successfully"})
})
const port = process.env.PORT || 8000

dbConnect();

app.listen(port, ()=>{
    console.log(`app is running in http://localhost:${port}`)
})