const mongoose = require("mongoose");

require("dotenv").config();

const uri = process.env.MONGODB_URL;

const dbConnect = ()=>{
mongoose.connect(uri)
.then(()=>{
    console.log("Database connected");
})
.catch((error)=>{
    console.log(`Error to connect DB >>>>> ${error}`)
})
}

module.exports = dbConnect;