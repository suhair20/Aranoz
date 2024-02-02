const User=require('../models/usermodel');
const categoryModel=require('../models/categoryModel');
const bcrypt=require('bcrypt');
const Product=require('../models/productModel')
const orderModel=require('../models/orderModals')






const loadlogin=async(req,res)=>{
    try {
        
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadsign=async(req,res)=>{
    try {
        email=req.body.email
        password=req.body.password
        const adminvalid= await User.findOne({email:email})
        if(adminvalid && adminvalid.isAdmin==1){
            const passwordmatch=await bcrypt.compare(password,adminvalid.password)
            console.log(passwordmatch);
            if(passwordmatch){
                res.redirect('/admin/dashbord')
            }else{
                res.render('login',{message:"inncorrect password"})
            }
        }else{
            res.render("login",{message:"incorrect email"})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
 
const loadhome=async(req,res)=>{
    try {
        res.render('dashbord')
    } catch (error) {
        console.log(error.message); 
    }
}
const loadusers=async(req,res)=>{
    try {
        const users= await User.find({})
        res.render('users',{users})
    } catch (error) {
        console.log(error.mesage);
    }
}
const blockUser= async(req,res)=>{
    try {
    console.log("vanoooo");
        const user= req.params.id
        console.log(user);
        const value= await User.findOne({_id:user})
        console.log("iyaoo");
        if(value.is_blocked){
            console.log("vannilefgh");
            await User.updateOne({_id:user},{$set:{is_blocked:false}})
            console.log("vannile");

        }else if(value.is_blocked==false){
            
            console.log("veruuu");
            await User.updateOne({_id:user},{$set:{is_blocked:true}})
        }
        res.json({block:true});
    } catch (error) {
        console.log(error.message);
    }
}
const loadproduct=async(req,res)=>{
    try {
        
        const category= await categoryModel.find({is_list:false})
        const product= await Product.find({}).populate("categoryId")
        res.render('product',{category,product})
        
    } catch (error) {
        console.log(error.message);
        
    }
}
const loadcategory= async(req,res)=>{
    try {
        const category=await categoryModel.find({})
        res.render('category',{category})
    } catch (error) {
        console.log(error.message);
    }
}
const loadcreatecategory =async(req,res)=>{
    try {
        res.render('createcategorie')
    } catch (error) {
        console.log(error.message);
    }
}
const loadcreating=async(req,res)=>{
    try {
        
       const name=req.body.name
       const description=req.body.Description
       
       const validate=await categoryModel.findOne({name:name})
       if(validate){
        res.render('createcategorie',{message:"you can't add same category"})
       }else{
        const newcategory= new categoryModel({
            name:name,
            description:description
        });
        await newcategory.save()
        
        res.redirect('/admin/category')

       }
        
    } catch (error) {
      console.log(error.message);  
    }
}
const 
loadeitcategory=async(req,res)=>{
try {
   const id=req.query.id

   const userdata= await categoryModel.findById({_id:id})

    res.render('editcategory',{userdata})
} catch (error) {
    console.log(error.message);
}
}
const updatingcategory=async(req,res)=>{
    try {
     const name=req.body.name
       const description=req.body.Description 
       const category=await categoryModel.findOne({name:name})
        console.log(category);
        if(category&& category.name==name){
            res.render('editcategory',{message:"already exist",userdata:category})
        }else{
         await categoryModel.updateOne({_id:req.body.id},{$set:{name:name,description:description}})
         res.redirect('/admin/category')   
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const blockcategory=async(req,res)=>{
    
    try{
    const user = req.params.id; 
    const userValue = await categoryModel.findOne({ _id: user });
    if (userValue.is_list) {
      await categoryModel.updateOne({ _id: user }, { $set: { is_list: false } });
    } else {
      await categoryModel.updateOne({ _id: user }, { $set: { is_list: true } });
    }
    
    res.json({ block: true });
  } catch (error) {
    console.log(error.message);
  }
}

const deletcategory=async (req,res)=>{
    const category=req.params.id
    
  try {
   const categoryId=await categoryModel.findById(category)
     if(!categoryId){
        return res.status(404).json({ error: 'Product not found' });
     }
    await categoryId.deleteOne()
    res.json({ok:true})
  } catch (error) {
    console.log(error.mesage);
  }
}

const order=async(req,res)=>{
try {
    
    const order=await orderModel.find()
    res.render('order',{order})
} catch (error) {
    console.log(error.message);
}
}

const orderview=async(req,res)=>{
    try {
        
      const  userId=req.query.id
        detials=await orderModel.findById({_id:userId}).populate('products.productId')
        res.render('orderview',{detials})
    } catch (error) {
        console.log(error.message);
    }
}

const updatestatus=async(req,res)=>{
    try {
        console.log("machiii");
       const  productId=req.body.productId
                
     const status=req.body.status
       console.log(status);
       console.log(productId)
       const updateorder=await orderModel.findOneAndUpdate({'products._id':productId},{$set:{'products.$.productStatus':status}},{new:true})
       console.log(updateorder);
       return res.json({success:true})
       console.log("dooon");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    loadlogin,
    loadhome,
    loadsign,
    loadusers,
    loadproduct,
    loadcategory,
    blockUser,
    loadcreatecategory,
    loadcreating,
    loadeitcategory,
    updatingcategory,
    blockcategory,
    deletcategory,
    order,
    orderview,
    updatestatus
    

}