const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    otp : {
        type : String,
    }
})

const client = mongoose.model("Client",Schema);

module.exports = client;
