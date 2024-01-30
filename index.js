const express = require("express");
const dbConnect = require("./db");
const cors = require("cors");


require("dotenv").config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ msg: "app is running successfully" });
});
const port = process.env.PORT || 8000;

app.use("/chatapp/user/auth", require("./Routes/auth"));

dbConnect();

app.listen(port, () => {
  console.log(`app is running in http://localhost:${port}`);
});
