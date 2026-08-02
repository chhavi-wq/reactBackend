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
app.get("/", (req, res) => {
  res.send("Backend is running!");
});
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('connected to mongo atlas');
    app.listen(PORT,()=>{
        console.log(`server running on port ${PORT}`)
    })
})
.catch((err)=>{
    console.log(`not connected ${err}`);
})



