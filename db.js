const mongoose = require("mongoose");

const uri = "mongodb+srv://dlaksh74:V8AuUrk8IHQvE8ah@cluster0.vpvkunm.mongodb.net/?retryWrites=true&w=majority";

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