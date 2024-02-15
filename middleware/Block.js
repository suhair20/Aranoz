const User=require('../models/usermodel');

const blockeduser=async(req,res,next)=>{
    try {
        const id=req.session.userId
        const detials=await User.findOne({_id:id})
        if(detials.is_blocked){
            console.log("endhaan");
            res.redirect('/login');
        }else{
            next()
        }
    } catch (error) {
        console.log(error);
    }
}






module.exports={
blockeduser
}