const cartModel = require('../models/cartModal')
const couponModel = require('../models/CouponModel')



const applycoupon=async(req,res)=>{
    try {
        const couponId = req.body.id;
        const user_id = req.session.userId;
        const currentDate = new Date();
        const couponData = await couponModel.findOne({ _id: couponId, expiryDate: { $gte: currentDate }, is_blocked: false });
        const exists = couponData.usedUsers.includes(user_id);
    
        if (!exists) {
          const existingCart = await cartModel.findOne({ user: user_id });
          if (existingCart && existingCart.couponDiscount == null) {
            await couponModel.findOneAndUpdate({ _id: couponId }, { $push: { usedUsers: user_id } });
            await cartModel.findOneAndUpdate({ user: user_id }, { $set: { couponDiscount: couponData._id } });
            res.json({ coupon: true });
          } else {
            res.json({ coupon: 'alreadyApplied' });
          }
        } else {
          res.json({ coupon: 'alreadyUsed' });
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).render('500');
      }
    }

    const removecoupon=async(req,res)=>{
      try {
 
     const couponId=req.body.id
     const userId=req.session.userId
    
   
    const couponData = await couponModel.findOneAndUpdate({ _id: couponId }, { $pull: { usedUsers: userId} })
    const updateCart = await cartModel.findOneAndUpdate({ user: userId }, { $set: { couponDiscount: null } })
    res.json({ success: true })
     

        
        
      } catch (error) {
        console.log(error.message);
      }
    }


module.exports={
    applycoupon,
    removecoupon
}