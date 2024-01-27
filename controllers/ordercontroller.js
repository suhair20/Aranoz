const User=require('../models/usermodel');
const bcrypt=require('bcrypt');
const Address=require('../models/AddressModal')
const nodemailer=require('nodemailer');

const Product=require('../models/productModel')
 const cartModel=require('../models/cartModal');
const { model } = require('mongoose');
const addressModel = require('../models/AddressModal');
const orderModel=require('../models/orderModals')


 const checkoutform=async(req,res)=>{
    try {
     const userId=req.session.userId
     const selectaddress=req.body.selsectAddress
     const paymentmethod=req.body.selector
     const user=await User.findOne({_id:userId})
     console.log(paymentmethod);


     let status=paymentmethod=="cash-on-delivery" ? "placed":"pending"

     if(selectaddress==undefined||selectaddress==null){
        const{name,phone,state,email,pincode,address,landmark,city}=req.body
        const newaddress={name,phone,state,email,pincode,address,landmark,city}

        const data=await addressModel.findOneAndUpdate({user:userId},{$push:{address:newaddress}},{upsert:true,new:true});
       addressObject=data.address[0]
      
     }else{
      const userAddress = await addressModel.findOne(
         { 'address._id': selectaddress },
         { 'address.$': 1 })
       addressObject=userAddress.address[0]
        

     }
     const cartdata=await cartModel.findOne({user:userId})
     const subtotal=cartdata.product.reduce((acc,val)=>acc+(val.price)*val.quantity,0)
     console.log(subtotal);
      const cartitem=cartdata.product
      
     const order=new  orderModel({
      user:userId,
      delivery_address:addressObject,
      payment:paymentmethod,
      products:cartitem,
      subtotal:subtotal,
      orderStatus:status,
      orderDate:new Date()

     })

     await order.save()

     if(status=="placed"){
      for(const product of cartitem){
         await Product.updateOne({_id:product.productId},{$inc:{quantity:-product.quantity}})
      }
      await cartdata.deleteOne({user:userId})
      res.json({success:true})

     }


     
      
     

    } catch (error) {
       console.log(error.message); 
    }
 }

 const success=async(req,res)=>{
   try {
      res.render('user/success')
   } catch (error) {
      console.log(error.message);
   }
 }

const changepassword=async(req,res)=>{
   try {
      const { current , newPass } = req.body;
      console.log(req.body,'ddddddddddd');
      const id = req.session.userId
      const user = await User.findById(id)
      console.log(user,'ffffffffffffffff');
      if (!user) {
          return res.json({ success: false, message: 'User not found.' });
      }

      const isPasswordMatch = await bcrypt.compare(current, user.password);

      if (!isPasswordMatch) {
          return res.json({ success: false, message: 'current password is not matching' });
      }

      const hashedPassword = await bcrypt.hash(newPass, 10);
      user.password = hashedPassword;
      await user.save();

      return res.json({ success: true, message: 'Password changed successfully.' });
   } catch (error) {
      console.log(error,message);
   }
}

 module.exports={
    checkoutform,
    success,
    changepassword
 }