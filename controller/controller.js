require("dotenv").config();
const Client = require("../model/model");
// //create update delete read
const jwt=require("jsonwebtoken");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const bcrypt = require("bcrypt");
const path=require("path")
const nodemailer = require("nodemailer")


const Order = require("../model/orderModel");


const generateOtp=()=>{
    let digits = "0123456789";
    let OTP = "";
    for(let i = 0 ; i < 4 ; i++){
        OTP+=digits[Math.floor(Math.random()*10)]
    }
    return OTP;
}

const Signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        }

        const existingUser = await Client.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();

        const newClient = new Client({
            name,
            email,
            password: hashedPassword,
            otp
        });

        await newClient.save();

        // Send OTP using Resend
        try {
            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "OTP VERIFICATION",
                text: `Your OTP is ${otp}`
            });

            if (error) {
                console.error("RESEND ERROR:", error);

                return res.status(500).json({
                    message: "Signup successful, but OTP email could not be sent.",
                    emailSent: false,
                    error: error.message
                });
            }

            console.log("EMAIL SENT:", data);

        } catch (emailError) {

            console.error("EMAIL ERROR:", emailError);

            return res.status(500).json({
                message: "Signup successful, but OTP email could not be sent.",
                emailSent: false,
                error: emailError.message
            });
        }

        return res.status(200).json({
            message: "Signup successful, OTP sent successfully",
            emailSent: true
        });

    } catch (err) {

        console.error("SIGNUP ERROR:", err);

        return res.status(500).json({
            message: "internal server error",
            error: err.message
        });
    }
};

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
        if (!comparedPassword) {
    return res.status(400).json({
        message: "Password incorrect!"
    });
}
        // const token=jwt.sign({email:user_email.email},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
        // res.status(200).json({message:"login successfull",token});

        const token = jwt.sign(
            {
                email :user_email.email,
                id : user_email._id,
                role : user_email.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn : "1h"
            }
        )
       return res.status(200).json({message:"login successfully",token,role:user_email.role})
    }
    catch(err){
        res.status(500).json({message:"internal server error",error:err.message})
    }
}

//get all users
const getAllUsers = async(req,res)=>{
    try{
        const user = await Client.find();
        res.status(200).json({message:"all user",user})
    }
    catch(err){
        res.status(500).json({message:"Inernal server error",err:error.message})
    }
} 
//get user by id

const getById = async(req,res)=>{
    try{
    const user_id = req.params.id;
    const user = await Client.findById(user_id);
    if(!user){
        return res.status(404).json({message:"user not found"})
    }
    res.status(200).json({message:"user found",user})
}
catch(err){
    res.status(500).json({message:"internal server error",err:error.message})
}
}
//delete user
const deleteUser = async(req,res)=>{
    try{
        const user_id = req.params.id;
        const user = await Client.findByIdAndDelete(user_id) 
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        res.status(200).json({message:"user deleted successfully"})
    }
    catch(err){
         res.status(500).json({message:"internal server error",err:error.message})
    }
}
//searchuser
const searchUser = async(req,res)=>{
    try{
        const {query} = req.query;
        const user = await Client.find({
            $or:[
                {name:{$regex : query , $options : "i"}},
            {email : {$regex : query, $options:"i"}}
            ]
        })
         if(!user){
            res.status(404).json({message:"not foud"})
        }
        res.status(200).json({message:"user data ",user})

    }
    catch{
        res.status(500).json({message:"internal server error"})
    }   
}
//update password
const updatepass=async(req,res)=>{
    try{
        const {email,oldpass,newpass}=req.body;
        const user=await Client.findOne({email})
        if(!user){
            res.status(404).json({message:"email not found"})
        }
        const compare=await bcrypt.compare(oldpass,user.password)
        if(!compare){
            res.status(401).json({message:"password incoreect"})
        }
         const hashedPassword = await bcrypt.hash(newpass, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
     

    }
    catch{
        res.status(500).json({message:"internal server error"})
    }
}
//update user
    const updateUser=async(req,res)=>{
        try{
    const userid=req.params.id
    const user=await Client.findByIdAndUpdate(
        userid,
        req.body,
        {new:true}
    )
    if(!user){
        return res.status(404).json({message:"user not found"})
    }
    res.status(201).json({message:"user updated successfully",user})
        }
        catch{
            res.status(500).json({message:"internal server error"})
        }
    }

const createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    const order = await Order.create({
      user: req.user.id,
      products,
      totalAmount,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate(
      "user",
      "name email"
    );

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Status Updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {Signup,verifyOtp,login,resendOtp,getAllUsers,getById,deleteUser,updateUser, updatepass,searchUser,createOrder,
    getMyOrders,getAllOrders,updateOrderStatus,deleteOrder
};