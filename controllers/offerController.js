const offerModel=require('../models/offerModel')
const product=require('../models/productModel')
const categoryModel=require('../models/categoryModel')



const loadoffer=async(req,res)=>{
   try {
    const offer=await offerModel.find()
    console.log(offer);
    res.render('offer',{offer})
    
   } catch (error) {
    console.log(error.message);
   }
}


const postoffer=async(req,res)=>{
    try {
        const offer=await offerModel.findOne({name:req.body.name})
        if(offer){
            res.render('offer',{message:'offer already exist'})
        }else{
            const data=new offerModel({
                name:req.body.name,
                discountAmount:req.body.discountAmount,
                activationdate:req.body.activationdate,
                expiryDate:req.body.Expiredate
            })
            data.save()
            res.redirect('/admin/offer')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const removeOffer=async(req,res)=>{
    try {
     const  offerId=req.params.id
       const offer =await offerModel.findOneAndDelete({_id:offerId})   
       res.json({ok:true})     
    } catch (error) {
        console.log(error.message);
    }
}



const applyOffer=async(req,res)=>{
  try {
    console.log("oferrvanuuu")
    const{id,productId}=req.body
    console.log(id)
   console.log(productId)
    const Product=await product.findOneAndUpdate({_id:productId},{$set:{offer:id}},{new:true})
    res.json({success:true})
    
  } catch (error) {
    console.log(error.message);
  }
}




const removeProductOffer=async(req,res)=>{
try {
    const id = req.body.id
    console.log(id);
    const Product = await product.findOneAndUpdate(
        { _id: id },
        { $unset: { offer: 1, discountPrice: 1 } },
        { new: true }
    );
    await categoryModel.updateMany({ _id: Product.categoryId }, { $unset: { offer: 1, } })
    res.json({ success: true })
    
} catch (error) {
    console.log(error.message);
}
}





const applyCategoryoffer=async(req,res)=>{
    try {
        console.log("ategoryyyy");
const{id,categoryId}=req.body


const category=await categoryModel.findOneAndUpdate({_id:categoryId},{$set:{offer:id}},{new:true})
console.log(category);
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}

const removeCategoryoffer=async(req,res)=>{
    try {
        console.log("heloooo");
        const id = req.body.id
    
        const Product = await categoryModel.findOneAndUpdate(
            { _id: id },
            { $unset: { offer: 1 } },
            { new: true }
        );
         await product.updateMany({ categoryId:id }, { $unset: { offer: 1, discountedPrice: 1 } });
         

        res.json({ success: true })
        
    } catch (error) {
        console.log(error.message);
    }
}
module.exports={
    loadoffer,
    postoffer,
    removeOffer,
    applyOffer,
    removeProductOffer,
    applyCategoryoffer,
    removeCategoryoffer
}