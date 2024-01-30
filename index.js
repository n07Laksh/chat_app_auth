const express = require("express");

const app = express();

app.get("/", (req, res)=> {
    res.status(200).json({msg:"app is running successfully"})
})
const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log(`app is running in http://localhost:${port}`)
})