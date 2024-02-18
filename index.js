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
<<<<<<< HEAD
<<<<<<< HEAD
  res.status(200).json({ message: "My chat app is running successfully" });
=======
  res.status(200).json({ msg: "app is running successfully" });
>>>>>>> parent of 3e224f5 (Merge pull request #4 from n07Laksh/prifile_utility)
=======
  res.status(200).json({ msg: "app is running successfully" });
>>>>>>> parent of 3e224f5 (Merge pull request #4 from n07Laksh/prifile_utility)
});
const port = process.env.PORT || 8000;

app.use("/chatapp/user/auth", require("./Routes/auth"));

dbConnect();

app.listen(port, () => {
  console.log(`app is running in http://localhost:${port}`);
});
