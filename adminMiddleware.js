const adminMiddleware = (req,res,next)=>{
    if( req.user.role!=="admin" ){
        return res.status(403).json({message:"Access Denied"});
    };
    next();
}
module.exports=adminMiddleware;