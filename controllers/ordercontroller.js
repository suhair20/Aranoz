const User=require('../models/usermodel');
const bcrypt=require('bcrypt');
const Address=require('../models/AddressModal')
const nodemailer=require('nodemailer');
const Razorpay=require('razorpay')
const dotenv=require('dotenv')
dotenv.config()
const crypto=require('crypto')
const Product=require('../models/productModel')
 const cartModel=require('../models/cartModal');
const { model } = require('mongoose');
const addressModel = require('../models/AddressModal');
const orderModel=require('../models/orderModals')

const razorpay= new Razorpay({
   key_id: 'lrzp_test_AuoFiF2uxjiri1',
   
   key_secret:'lwImEROmJdThKilx8INK3dZZ' ,
   
})


 const checkoutform=async(req,res)=>{
    try {
     
     const userId=req.session.userId
     const selectaddress=req.body.selsectAddress
     const paymentmethod=req.body.selector
     const user=await User.findOne({_id:userId})
     console.log(paymentmethod);


     let status=paymentmethod=="cash-on-delivery"||paymentmethod=="wallet" ? "placed":"pending"

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
     const orderId=order._id

     if(paymentmethod=="cash-on-delivery"){
      for(const product of cartitem){
         await Product.updateOne({_id:product.productId},{$inc:{quantity:-product.quantity}})
      }
      await cartdata.deleteOne({user:userId})

      res.json({success:true})
   }else if(paymentmethod=="wallet"){
      const data={
         amount:-subtotal,
         date:new Date()
      }

      await User.findOneAndUpdate({_id:userId},{$inc:{wallet:-subtotal},$push:{walletHistory:data}})

      for(const product of cartitem){
         await Product.updateOne({_id:product.productId},{$inc:{quantity:-product.quantity}})
      }
      await cartdata.deleteOne({user:userId})

      res.json({success:true})

     }else{
     let options={
      amount:subtotal*100,
      currency:"INR",
      receipt:""+orderId
     }
    razorpay.orders.create(options,function(err,order){
      if(err){
         console.log(err);
      }else{
         res.json({success:false,order})
      }
    })
     }


     
      
     

    } catch (error) {
       console.log(error.message); 
       res.status(500).render('user/500');
    }
 }

const verifypayment=async(req,res)=>{
   try {
      
      const id=req.session.userId
      const data=req.body
      const cartData=await cartModel.findOne({user:id})

      const hmac = crypto.createHmac("sha256", process.env.key_seceret);
      hmac.update(data.razorpay_order_id + "|" + data.razorpay_payment_id);
      const hmacValue = hmac.digest("hex");
     
      
    if (hmacValue == data.razorpay_signature) {
      for (const Data of cartData.product) {
        const { productId, quantity } = Data;
        await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
      }
    }
    const newOrder = await orderModel.findByIdAndUpdate(
      { _id: data.order.receipt },
      { $set: { orderStatus: "placed" } }
    );
    newOrder.products.forEach((product) => {
      product.productStatus = "placed";
    });
    const orderItems = await orderModel.findByIdAndUpdate(
      { _id: newOrder._id },
      { $set: { products: newOrder.products } },
      { new: true }
    );

    
    await cartData.deleteOne({ user: id });



    res.json({success:true})




   } catch (error) {
      console.log(error.message);
      res.status(500).render('user/500');
   }
}



 const success=async(req,res)=>{
   try {
      res.render('user/success')
   } catch (error) {
      console.log(error.message);
      res.status(500).render('user/500');
   }
 }


 const cancelproduct=async(req,res)=>{
   try {
       
     const  productId=req.body.productId
     const reason=req.body.cancelreason
     
       const order= await orderModel.findOneAndUpdate({'products._id':productId},{$set:{'products.$.productStatus':"cancelled",'products.$.cancelReason':reason}}, { new: true } )
       res.json({cancel:true})
       
       
   } catch (error) {
       console.log(error.message);
       res.status(500).render('user/500');
   }
}
const retunproduct=async(req,res)=>{
   try {
      console.log("dfghjk"); 
     const  productId=req.body.productId
     const userId=req.session.userId
     console.log(userId);
     const reason=req.body.cancelreason
     const orderId=req.body.orderId
     const updateOrder=await orderModel.findById(orderId)
      

   
     const product =updateOrder.products.find((product)=>product._id.toString()===productId)
     
     const Walletamount=product.totalPrice

     const data={
      amount:Walletamount,
      date:Date.now(),
     }
     await Product.updateOne({ _id: productId }, { $inc: { quantity: 1 } });
     await User.findOneAndUpdate({ _id: userId }, { $inc: { wallet: Walletamount }, $push: { walletHistory: data } })
     
     
     
       const order= await orderModel.findOneAndUpdate({'products._id':productId},{$set:{'products.$.productStatus':"returned",'products.$.cancelReason':reason}}, { new: true } )
       res.json({cancel:true})
       
       
   } catch (error) {
       console.log(error.message);
       res.status(500).render('user/500');
   }
}


 module.exports={
    checkoutform,
    success,
    cancelproduct,
    retunproduct,
    verifypayment
    
 }