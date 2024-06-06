require("dotenv").config();

const { db } = require("./db/connect");

const express = require("express");

const cors = require("cors");

const app = express();
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");

//Connect to DB
db();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://peaceful-belekoy-8a3733.netlify.app/"); 
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(authRoutes);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("App is running on PORT :", PORT);
});
