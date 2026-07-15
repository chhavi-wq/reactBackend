const express = require("express");
const {Signup,verifyOtp,login, resendOtp} = require("../controller/controller")

const router = express.Router();
router.post("/verify",verifyOtp);
router.post("/sign",Signup);

router.post("/login",login);

router.post("/resend",resendOtp)

module.exports=router;