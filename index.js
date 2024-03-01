const express = require("express");
const dbConnect = require("./db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "https://next-chat-7.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "My chat app is running successfully" });
});

const port = process.env.PORT || 8000;

app.use("/chatapp/user/auth", require("./Routes/auth"));
app.use("/chatapp/user/update", require("./Routes/authUpdate"));

dbConnect();

app.listen(port, () => {
  console.log(`app is running in http://localhost:${port}`);
});
