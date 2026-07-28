const express = require("express");
const {Signup,verifyOtp,login,resendOtp,getAllUsers,getById,deleteUser,updateUser,getMyOrders,getAllOrders,updateOrderStatus,deleteOrder, updatepass,searchUser} = require("../controller/controller")
const middleware = require("../middleware")

const adminMiddleware = require("../adminMiddleware")
const { createOrder } = require("../controller/controller");
const router = express.Router();
router.post("/verify",verifyOtp);
router.post("/sign",Signup);

router.post("/login",login);
router.get("/orders", middleware, getMyOrders);
router.get(
  "/admin/orders",
  middleware,
  adminMiddleware,
  getAllOrders
);
router.put(
  "/admin/orders/:id",
  middleware,
  adminMiddleware,
  updateOrderStatus
);
router.delete(
  "/admin/orders/:id",
  middleware,
  adminMiddleware,
  deleteOrder
);
router.get("/admin/userId/:id",middleware,adminMiddleware,getById); // working  dont change the order of middleware and adminmiddelware

router.delete("/admin/delete/:id",middleware,adminMiddleware,deleteUser) //working
 router.post("/orders", middleware, createOrder);
router.put("/admin/updateUser/:id",middleware,adminMiddleware,updateUser) //working

router.get("/admin/updatePass",middleware,adminMiddleware,updatepass) //working
router.post("/resend",resendOtp)

router.get("/admin/search",middleware,adminMiddleware,searchUser) //working

router.get("/admin/users", middleware, adminMiddleware, getAllUsers); //working 

module.exports=router;
