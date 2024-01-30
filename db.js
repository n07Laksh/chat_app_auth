const mongoose = require("mongoose");

const uri = "mongodb+srv://dlaksh74:V8AuUrk8IHQvE8ah@cluster0.vpvkunm.mongodb.net/?retryWrites=true&w=majority";

const dbConnect = () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Database Connected");
    })
    .catch((error) => {
      console.log("DB Connection Error >>>>>" + error);
    });
};

module.exports = dbConnect;
