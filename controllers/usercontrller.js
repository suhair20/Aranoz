const User=require('../models/usermodel');
const bcrypt=require('bcrypt');
const Address=require('../models/AddressModal')
const nodemailer=require('nodemailer');
const cartModel=require('../models/cartModal')
const Product=require('../models/productModel')
const orderModel=require('../models/orderModals')
const wihslistModel=require('../models/whishlistModel')

//MONGO DB USER OTP VERIFIATION MODEL/////
const userOTPVerification= require("./../models/userOTPVerification");



//Fuction to securly hash a password //
const securePassword = async (password)=>{
    try {
        const passwordHash= await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


// function to load home page ///
const Loginhome= async (req,res)=>{
    try {
        res.render('user/home')
    } catch (error) {
        console.log(error.message);
    }
}

const contactloading=async(req,res)=>{
    try {
        res.render('user/contact')
    } catch (error) {
       console.log(error.message); 
    }
}

const shoploading=async(req,res)=>{
    try {
        const product=await Product.find({})
        res.render('user/shop',{product})
    } catch (error) {
        console.log(error.message);
    }
}
 



const loadlogin=async(req,res)=>{
    try {
      
          
    
        res.render('user/login')
    
    } catch (error) {
        console.log(error.message);
    }
}

const verifylogin=async(req,res)=>{

    email=req.body.email
    password=req.body.password
    
    const validuser=await User.findOne({email:email})
    if(validuser){
        const passwordmatch=await bcrypt.compare(password,validuser.password)
        if(passwordmatch){
            req.session.userId=validuser._id
            
         res.redirect('/home')
            
        }else{
            res.render('user/login',{message:"password is incorrect"})
        }
    }else{
        res.render('user/login',{message:"invalid email or password"})
    }

}

    



const loadsignup =async(req,res)=>{
    try {
        res.render('user/signup')
    } catch (error) {
        console.log(error.message);
        
    }
}

const verifyOTP=async(req,res)=>{
    try {
        res.render('user/otp')
    } catch (error) {
       console.log(error.message); 
    }
}

const loadprofile=async(req,res)=>{
    try {
        if(req.session.userId){
       const user=req.session.userId
       console.log(user);
       const detials=await User.findOne({_id:user})
      const name=detials.name
      const email=detials.email
      const mobile=detials.mobile
      const userId=detials._id

       
        res.render('user/profile',{name,email,mobile,userId})
        }else{
            res.redirect('/login')
        }
    } catch (error) {
       console.log(error.message); 
    }
}
const loadlogout=async(req,res)=>{
    try{
    req.session.destroy((err)=>{
    
        if(err){
            console.log("error destroying session :",err.message);
        }else{
            console.log("session destroyed");
            res.redirect('/home')
        }
    })
}catch(error){
console.log(error.message);
}
}
const singleproduct=async(req,res)=>{
    
         const id=req.query.id
         try {
        const images=await Product.findById(id)
        
        if(!images){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.render('user/singleproduct',{images})
         } catch (error) {
            console.log(error.message);
         }
}

const getprofileorder= async(req,res)=>{
    try {

       const userid=req.session.userId
       console.log(userid);
      const order=await orderModel.find({user:userid})  
      console.log(order,"hrloo");

        res.render('user/profileorder',{order})
        
    } catch (error) {
        console.log(error.message);
    }
}


const getprofileaddress= async (req,res)=>{
    try {
     const  id=req.session.userId
    const  detials=await Address.findOne({user:id})
    

        res.render('user/profileaddress',{detials})
    } catch (error) {
        console.log(error.message);
    }
}
const getprofilepassword=async(req,res)=>{
    try {
        res.render('user/profilepassword')
    } catch (error) {
        console.log(error.message );
    }
}


const getprofilelogout=async(req,res)=>{
    try {
        res.render('user/profilelogout')
    } catch (error) {
        console.log(error.message);
    }
}
const updateuser=async(req,res)=>{
    try {
        const id=req.body.id
      const  name=req.body.name
      const  mobile1=req.body.phone
      
    await User.updateOne({_id:id},{$set:{name:name,mobile:mobile1}})
   res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}
const addAddress=async(req,res)=>{
    try {
        const user=req.session.userId
        console.log("user:",user);
        let{name,address,landmark,state,city,pincode,phone,email}=req.body

        const newaddress={

            name,
            address,
            landmark,
            state,
            city,
            pincode,
            phone,
            email

        }

 const findAddress=await Address.findOneAndUpdate({user:user},{$push:{address:newaddress}},{upsert:true,new:true})
   
 res.redirect('/profileaddress')
 

    } catch (error) {
        console.log(error.message );
    }
}

const addresdeatials=async( req,res)=>{
    try {
        const id=req.params.id
       const  userId=req.session.userId;
         const user=await Address.findOne({user:userId}) 


         user.address.forEach((address)=>{
            if(address._id==id){
                res.json({address})
            }
         })
         
    } catch (error) {
        console.log(error.message);
    }
}

const  editADDRUpdate=async(req,res)=>{
     try {
        console.log("hiii");
        const id=req.body.id
        console.log(id);
        const  userId=req.session.userId;
        const user=await Address.findOne({user:userId})

        user.address.forEach((address)=>{
            if(address._id==id){
                address.name=req.body.namee
                address.address=req.body.addresse
                address.landmark=req.body.Landmarke
                address.state=req.body.statee
                address.city=req.body.citye
                address.pincode=req.body.pincode
                address.mobile=req.body.phonee
                address.email=req.body.emaile


            }
         })
         console.log("vanuuuuu");

         await user.save()
         
         res.redirect('/profileaddress')

     } catch (error) {
        console.log(error.message);
     }
}

const deletaddress=async(req,res)=>{
    try {
        
        const id=req.params.id
        const  userId=req.session.userId;
        const user=await Address.findOne({user:userId})

        user.address = user.address.filter(address => address._id != id);

        await user.save()
             res.json({ok:true})
        

    } catch (error) {
        console.log(error.message);
    }
}

const checkout=async(req,res)=>{
    try {
      const Wallet= await User.findById(req.session.userId)
        const userid=req.session.userId
        const address=await Address.findOne({user:userid})
    
        const cartdata=await cartModel.findOne({user:userid}).populate('product.productId')
        console.log(cartdata);
         if(cartdata){
             const subtotal=cartdata.product.reduce((acc,val)=>acc+(val.price)*val.quantity,0)
             res.render('user/checkout',{address,subtotal,Wallet})
         }
       
    } catch (error) {
        console.log(error.messge);
    }
}


const ordercancel=async(req,res)=>{
    try {
       const orderid=req.query.id
       console.log(orderid);
       const order=await orderModel.findById(orderid).populate('products.productId')
       
       
            
       var deliverydate=new Date(order.orderDate)
       var currentDate=new Date()
       var timedifference= currentDate.getTime()-deliverydate.getTime()
       var daysDifference = timedifference / (1000 * 3600 * 24);
       var daysDifferenceRounded = Math.round(daysDifference);
       
        res.render('user/ordercancel',{order,daysDifferenceRounded})
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
       console.log(error.message);
    }
 }
 const loadWallet=async(req,res)=>{
    try {
       const userId=req.session.userId
        const user= await User.findById(userId)
        console.log(user);
        res.render('user/Wallet',{user})
        
    } catch (error) {
        console.log(error.message);
    }
 }

 const loadwishlist=async(req,res)=>{
    try {
        console.log("helloo");
       const  userId= req.session.userId
       console.log(userId);
      const data=await wihslistModel.findOne({user:userId}).populate('product.productId')
      console.log(data);
        res.render('user/wishlist',{data,userId})
    } catch (error) {
        console.log(error.mesage);
    }
 }


 
module.exports ={
    Loginhome,
    contactloading,
    shoploading,
    loadlogin,
    loadsignup,
    verifyOTP,
    loadprofile,
    loadlogout, 
    verifylogin,
    singleproduct,
    getprofileorder,
    getprofileaddress,
    getprofilepassword,
    getprofilelogout,
    updateuser,
    addAddress,
    addresdeatials,
    editADDRUpdate,
    deletaddress,
    checkout,
    ordercancel,
    changepassword,
    loadWallet,
    loadwishlist
    
    
}
