const User=require('../models/usermodel');
const bcrypt=require('bcrypt');
const Address=require('../models/AddressModal')
const nodemailer=require('nodemailer');

const Product=require('../models/productModel')
 const cartModel=require('../models/cartModal')


const cartload=async(req,res)=>{
    try {
       const  id=req.session.userId
       const cartdata=await cartModel.findOne({user:id}).populate('product.productId')
       console.log(cartdata);
        if(cartdata){
            const subtotal=cartdata.product.reduce((acc,val)=>acc+(val.price)*val.quantity,0)
            res.render('user/cart',{data:subtotal,cartdata,id})
        }else {
        
            res.render('user/cart', { data: 0, cartdata: null });
        }

       

    } catch (error) {
        console.log(error.message);
    }
}

const getcart=async(req,res)=>{
    try {
        if(req.session.userId){
        
          const product_id=req.body.id;
          console.log(product_id);
          const user_id=req.session.userId
          const productdata=await Product.findById(product_id)
          const cartproduct=await cartModel.findOne({user:user_id,'product.productId':product_id})
          console.log(cartproduct);
           let productprice=productdata.price
          if(productdata.quantity>0){
              if(cartproduct){
                res.json({status:'alreadyAdded'})
              }else{
                const data={
                    productId:product_id,
                    price:productprice,
                    totalprice:productprice,
                }
                console.log(data);

       await cartModel.findOneAndUpdate({user:user_id},{$push:{product:data}},{upsert:true,new:true})
       res.json({success:true})
              }
          }else{
            res.json({stock:true})
          }
        }else{
            res.json({failed:true})
        }
    } catch (error) {
        console.log(error.message);
    }
}


const removecart=async(req,res)=>{
    try {
        console.log("hiiiiiiiiiiiiiii");
        const{productId,userId}=req.body
        const updatecart=await cartModel.findOneAndUpdate({user:userId},{$pull:{'product':{'productId':productId}}},{new:true});
       if(updatecart){
        res.json({success:true})
       } else {
        res.status(404).json({ error: 'Product not found in the cart' });
      }
    } catch (error) {
        console.log(error.message);
    }
}

const updatecart=async(req,res)=>{
    try {
        console.log("hiii");
        const id=req.session.userId
        const product_Id=req.body.productId
        
        const count =req.body.count
        const product =await Product.findOne({_id:product_Id})
        const cart= await cartModel.findOne({user:id})
        console.log(cart);

        if(count==-1){
            const productquantity= cart.product.find((p)=>p.productId==product_Id).quantity
            console.log(productquantity,'uytyuytr');
            console.log("hwyyyyy");
            if(productquantity<=1){
                return res.json({ success: false, message: 'Quantity cannot be decreased further.' });
            }
        }
        if(count==1){
            const productquantity= cart.product.find((p)=>p.productId==product_Id).quantity
            if (productquantity + count > product.quantity) {
                return res.json({ success: false, message: 'Stock limit reached' });
            }
        }

        const updatedCart = await cartModel.findOneAndUpdate(
            { user: id, 'product.productId': product_Id },
            {
              $inc: {
                'product.$.quantity': count,
                'product.$.totalPrice': count * cart.product.find(p => p.productId.equals(product_Id)).price,
              },
            },
            { new: true }
          );
          console.log("hwyyy");
          res.json({success:true})
      
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    cartload,
    getcart,
    removecart,
    updatecart
}