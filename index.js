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
app.use(authRoutes);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("App is running on PORT :", PORT);
});
