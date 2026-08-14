const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());  
const userRouter = require("./routes/user.routes.js");
// routes declaration
app.use("/api/v1/users", userRouter);
module.exports = app;