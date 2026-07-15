const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config()
const route = require("./route/route");
require("dotenv").config();

const cors= require("cors");
const app = express();
app.use(express.json());
const PORT = 3000;
app.use(cors());

app.use("/api",route);

mongoose.connect("mongodb://localhost:27017/main")
.then(()=>{
    console.log('connected to mongodb');
    app.listen(PORT,()=>{
        console.log(`app is listening to PORT ${PORT}`)
    })
})
.catch((err)=>{
    console.log(`not connected ${err}`);
})



