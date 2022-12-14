const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const memberRoute = require("./routes/members");
const corsOptions ={
    origin:"*", 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(cors(corsOptions));


//setup cors for our project
app.use(cors());

//load static files
app.use("/images", express.static(path.join(__dirname, "/images")));

//load the .env file
dotenv.config();
//parse the json request and put it in the req.body
app.use(express.json());

//connect to our mongodb atlas database
mongoose
  .connect(process.env.MONGODB_URI)

//load our rest api routes
app.use("/api/members", memberRoute);

//start the server
app.listen(process.env.PORT || 5000, () => {
  console.log("RFID backend API server is running.");
});
