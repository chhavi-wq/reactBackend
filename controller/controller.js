const Client = require("../model/model");
//create update delete read
const jwt=require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
require("dotenv").config();



const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:process.env.USER_EMAIL,
        pass:process.env.USER_PASS
    }
})
const generateOtp=()=>{
    let digits = "0123456789";
    let OTP = "";
    for(let i = 0 ; i < 4 ; i++){
        OTP+=digits[Math.floor(Math.random()*10)]
    }
    return OTP;
}

const Signup = async(req,res)=>{
    try{
        const { name, email, password} = req.body;
        const Client_email= await Client.findOne({email});
        if(Client_email){
            return res.status(400).json({message:"email already exists"})
        }
        if(!email || !name || !password ){
            return res.status(401).json({message:"All fields are required!"})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const newClient = new Client({
            name, email, password: hashedPassword
        })
        await newClient.save();

        const otp = generateOtp();
        newClient.otp = otp
        await newClient.save();

    const sendmail={
    from:"test@gmail.com",
    to:newClient.email,
    subject:"OTP VERIFICATION",
    text:`your OTP is ${otp}`

}
console.log(otp);
await transporter.sendMail(sendmail)
return res.status(200).json({message:"otp sent successfully"});
    }
    catch(err){
        res.status(500).json({message:"internal server error",error:err.message})
    }
}

const verifyOtp=async(req,res)=>{
    try{
        const {email,otp} = req.body;
        const user_email = await Client.findOne({email});
        if(!user_email){
            return res.status(404).json({message:"email not found!"})
        }
        if(user_email.otp !== otp){
            return res.status(401).json({message:"otp doesn't match"})
        };
        console.log("user email: ",user_email.otp, "otp: ",otp);
        user_email.otp=null;
        await user_email.save();
        res.status(200).json({message:"verification done sucessfully!"})
    
    }
    catch(err){
        return res.status(500).json({message:"internal server error",error:err.message});
    }
}

const resendOtp = async(req,res)=>{
    try{
        const {email} = req.body;
        const user_email = await Client.findOne({email});
        if(!user_email){
            return res.status(404).json({message:"user not found"});
        }
        const otp = generateOtp();
        user_email.otp = otp;
        await user_email.save();
        const sendmail={
            from:"test@gmail.com",
            to:user_email.email,
            subject:"RESEND OTP",
            text:`your new otp is: ${otp}`
        }
        res.status(200).json({message:"otp resent successfuly"})
        await transporter.sendMail(sendmail);
        console.log("new otp",otp);
    }
    catch(err){
        return res.status(500).json({message:"internal server error",error:err.message})
    }
}

const login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user_email = await Client.findOne({email});
        if(!user_email){
            return res.status(404).json({message:"email not found!"})
        }
        const comparedPassword = await bcrypt.compare(password,user_email.password)
        if(!comparedPassword){
            return res.status(400).json({message:"password incorrect!"})
        }

        const token=jwt.sign({email:user_email.email},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
        res.status(200).json({message:"login successfull",token});
    }
    catch(err){
        res.status(500).json({message:"internal server error",error:err.message})
    }
}


module.exports = {Signup,verifyOtp,login,resendOtp};