const express=require('express');
const userRoute=express()
const session= require('express-session')
const config= require('../config/config');
// const auth=require('../middleware/auth')
const usercontroler=require('../controllers/usercontrller');
const User = require('../models/usermodel');
const userOTPVerification = require('../models/userOTPVerification');
const { Error } = require('mongoose');
const bcrypt=require("bcrypt");
const nodemailer=require('nodemailer');
const auth = require('../middleware/auth')
const cartcontroller=require('../controllers/cartcontroller')
const ordercontroller=require('../controllers/ordercontroller')



userRoute.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true
}))

userRoute.use(express.json());
userRoute.use(express.urlencoded({extended:true}));


userRoute.set('view engine','ejs');
userRoute.set('views','./views');



userRoute.get('/',usercontroler.Loginhome);
userRoute.get('/contact',usercontroler.contactloading);
userRoute.get('/shop',usercontroler.shoploading);
userRoute.get('/home',usercontroler.Loginhome);
userRoute.get('/cart',auth.isLogin,cartcontroller.cartload)
userRoute.get('/checkout',usercontroler.checkout)
userRoute.get('/login',auth.isLogout,usercontroler.loadlogin);
userRoute.post('/login',usercontroler.verifylogin)
userRoute.get('/signup',auth.isLogout,usercontroler.loadsignup);
userRoute.get('/verifyotp',usercontroler.verifyOTP);
userRoute.get('/profile',auth.isLogin,usercontroler.loadprofile)
userRoute.get('/logout',auth.isLogin,usercontroler.loadlogout)
userRoute.get('/singleproduct',usercontroler.singleproduct)
userRoute.get('/profileorder',usercontroler.getprofileorder)
userRoute.get("/profileaddress",usercontroler.getprofileaddress)
userRoute.get("/profilepassword",usercontroler.getprofilepassword)
userRoute.get('/profilelogout',usercontroler.getprofilelogout)
userRoute.post('/updateuser',usercontroler.updateuser)
userRoute.post('/addAddress',usercontroler.addAddress)
userRoute.get('/addresdetials/:id',usercontroler.addresdeatials)
userRoute.post('/editADDRUpdate',usercontroler.editADDRUpdate)
userRoute.delete('/deletaddress/:id',usercontroler.deletaddress)
userRoute.post('/getcart',cartcontroller.getcart)
userRoute.post('/removecart',cartcontroller.removecart)
userRoute.post('/updatecart',cartcontroller.updatecart)
userRoute.post('/checkoutform',ordercontroller.checkoutform)
userRoute.get('/success',ordercontroller.success)
userRoute.post('/changepassword',ordercontroller.changepassword)



userRoute.post('/signup',auth.isLogout,(req,res)=>{
  let{name,email,mobile,password}=req.body
  name=name.trim();
  email=email.trim();
  mobile=mobile.trim();
  password=password.trim();
   
  if(name ==""||email ==""||mobile ==""||password ==""){
      
    res.render('user/signup',{message:"Empty input field!"})
  }else if(!/^[a-zA-z]*$/.test(name)){
    res.render('user/signup',{message:"Invalid name"})
  }else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
   res.render('user/signup',{message:"Invalid Email"})
  }else if (!/^\d{10}$/.test(mobile)) {
    res.render('user/signup',{message:"Invalid mobile number pleas Enter 10 digit"})
}else if(password.length<8){
    res.render('user/signup',{message:"password is too short"})
}else{
    User.find({email})
      .then((result)=>{
        if(result.length){
        res.render('user/signup',{message:"Email already exist"})
        }else{
            const saltRounds = 10;
            bcrypt
               .hash(password,saltRounds)
               .then((hashedPassword)=>{
                const newUser = new User({
                    name,
                    email,
                    password: hashedPassword,
                    mobile,
                    verified: false,

                });
                newUser.save()
            
                .then((result)=>{
                    console.log("helloo come");
                    req.session.userId=result._id
                   sendOTPVerificationEmail(result,res);
                })
                .catch((err)=>{
                    console.log(err);
                    res.json({
                        status:"Failed",
                        message:"An error occured while saving  user account",
                    });
                });
               })
               .catch((err)=>{
                res.json({
                    status:"Failed",
                    message:"An error occured while hashing password ",
                });
               })
        }
      })
      .catch((err)=>{
        console.log(err);
        res.json({
            status:"Failed",
            message:"an error ocured while cheking for existing user"
        })
    })
}
});

// send otp verification email 
const  sendOTPVerificationEmail=(async({_id,email},res)=>{
    try {
        console.log('helooooooooooooooooo')
        const otp =`${Math.floor(1000 + Math.random() * 9000)}`;
        //mail options
       const mailOptions={
        from: process.env.user_email,
        to:email,
        subject:"Verify your email ",
        html:`<p>Enter <b> ${otp}</b> in the app to verify your email address and complete the size </p>`,
        
       };
       const saltRounds = 10;
        const hashedOTP= await bcrypt.hash(otp,saltRounds); 
    
         const newOTPVefication = await new userOTPVerification({
            userId:_id,
            otp:hashedOTP,
            createdAt:Date.now(),
            expiresAt:Date.now()+3600000,
        });
        //save otp record
        await newOTPVefication.save();
        
        await transporter.sendMail(mailOptions);
        
        res.redirect('/verifyotp')

    } catch (error) {
        res.json({
            status:"Failed",
            message:error.message
        })
    }
})
//nodemailer

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        user:process.env.user_email,
        pass:process.env.app_password
    }
  });
  
   
    
   

userRoute.post("/verifyotp",async (req,res)=>{
 try {
    console.log("vannuuu");
    let otp=req.body.otp;
    const userId=req.session.userId
    if(!userId||!otp){
        throw Error("empty otp detials are not allowed")
    }else{
     const userOTPVerificationRecord =await userOTPVerification.find({
            userId,
        });
        if(userOTPVerificationRecord.length<=0){
            //no find record 
            throw new Error(
                "Account record doesn't exist or has been verified already  . plaeas sighnup or log in"
            )
        }else{
            const {expiresAt}=userOTPVerificationRecord[0];
            const hashedOTP = userOTPVerificationRecord[0].otp;

            if(expiresAt<Date.now()){
                //user otp record has expired
                userOTPVerification.deleteMany({userId});
                throw new Error("code has expired. pleas request again ")
            }else{
                const validOTP=await bcrypt.compare(otp,hashedOTP);
                if(!validOTP){
                  res.render('user/otp',{message:"invalid code "})
                    
                }else{
                  //success
                  await User.updateOne({_id:userId},{verfied:true});
                  await userOTPVerification.deleteMany({userId})
                  res.redirect('/home')

                }
            }
        }
    }
 } catch (error) {
    res.json({
        status:"Failed",
        message:error. message 
    })
 }
});

userRoute.post("/resendOTPVerifivationcode",async(req,res)=>{
  try {
    let {userId, email}=req.body;

    if(!userId||!email){
        throw Error("empty users details are not allowed ");
    }else{
        await userOTPVerification.deleteMany({userId});
        sendOTPVerificationEmail({_id:userId,email},res);


    }
  } catch (error) {
    res.json({
       status:"Failed",
       message:error.message,
    });
  }
    
})





module.exports=userRoute