const product=require('../models/productModel')
const categoryModel=require('../models/categoryModel');
const sharp=require('sharp');

const addproduct=async(req,res)=>{
   try {

      const category=await categoryModel.find({})
      res.render('productadd',{category})
      
   } catch (error) {
      console.log(error.message );
   }
}


const addproductpost=async(req,res)=>{
  console.log("vanuu111");
try{
  const detials= req.body
  const files=req.files;
  console.log("Request Files:", req.body.name);
  const img = [
   files && files.image1 ? files.image1[0].filename : null,
   files && files.image2 ? files.image2[0].filename : null,
   files && files.image3 ? files.image3[0].filename : null,
   files && files.image4 ? files.image4[0].filename : null,
 ];
  console.log(img);


  
 const proceedimages=await Promise.all(
  img.map(async(imagename)=>{
    await sharp(`public/multerimages/${imagename}`)
      .resize(500,500)
      .toFile(`public/sharpimages/${imagename}`)
      console.log("what ");
      return imagename;

  })
  
  
 )
 console.log(proceedimages);
 console.log("yevideyaa")
 if(detials.Quantity>0 && detials.Price>0){
    const Product = new product({
       name:detials.name,
       quantity:detials.Quantity,
       categoryId:detials.category,
       price:detials.Price,
       description:detials.description,
       images:{
         image1:proceedimages[0],
         image2:proceedimages[1],
         image3:proceedimages[2],
         image4:proceedimages[3]

       }
      
       


    })
    
    const result= await Product.save();
    
    res.redirect('/admin/product')
    
 }
}catch(error){
console.log(error.message);

}
}
 
const productdetials= async(req,res)=>{
   try{
   const productId=req.params.productId
   const products = await product.findById(productId).populate("categoryId")
   res.json({
      name:products.name,
      quantity:products.quantity,
      // category:products.categoryId.name,
      price:products.price,
      description:products.description,
      images:products.images,
   });
}catch(error){
   console.error('Error fetching products detials ',error)
}
}

const deletproduct=async(req,res)=>{
   console.log("heloo");
   const productId=req.params.id
   
   try {
      const Product= await product.findById(productId)
      if(!Product){
         return res.status(404).json({ error: 'Product not found' });
      }else{
         await Product.deleteOne();
         res.json({ok:true})

         
      }
   } catch (error) {
      console.log(error.message);
   }
}
const loadproductedit=async(req,res)=>{
   try {
      const category=await categoryModel.find({})
      const id= req.query.id
      const Product = await product.findById(id).populate('categoryId') 
     
      res.render('productedit',{Product,category})
      
   } catch (error) {
      console.log(error.message);
   }
}

const productedit=async (req,res)=>{
   try {
      const id=req.body.productId
      console.log(id);
       const name=req.body.name
       const quantity=req.body.Quantity
       const category=req.body.category
       const price=req.body.Price
       const description=req.body.description
       const files=req.files
       console.log(files);


       const existingData = await product.findOne({ _id: id });
       const img = [
         

         files?.image1 ? (files.image1[0]?.filename || existingData.images.image1) : existingData.images.image1,
         files?.image2 ? (files.image2[0]?.filename || existingData.images.image2) : existingData.images.image2,
         files?.image3 ? (files.image3[0]?.filename || existingData.images.image3) : existingData.images.image3,
         files?.image4 ? (files.image4[0]?.filename || existingData.images.image4) : existingData.images.image4,
       ];
  
 const proceedimages=await Promise.all(
  img.map(async(imagename)=>{
    await sharp(`public/multerimages/${imagename}`)
      .resize(500,500)
      .toFile(`public/sharpimages/${imagename}`)
      console.log("what ");
      return imagename;
  })
 )
 console.log(id);
 console.log(name);
   await product.updateOne({_id:id},{$set:{name:name,quantity:quantity,categoryId:category,
      images:{
      image1:proceedimages[0],
      image2:proceedimages[1],
      image3:proceedimages[2],
      image4:proceedimages[3]
   },price:price,description:description}})
   console.log("hiii");
   res.redirect('/admin/product')
 
   } catch (error) {
      console.log(error.message);
   }
}

const blockproduct=async(req,res)=>{
    
   try{
   const user = req.params.id; 
   const userValue = await product.findOne({ _id: user });
   if (userValue.is_blocked) {
     await product.updateOne({ _id: user }, { $set: { is_blocked: false } });
   } else {
     await product.updateOne({ _id: user }, { $set: { is_blocked: true } });
   }
   
   res.json({ block: true });
 } catch (error) {
   console.log(error.message);
 }
}


module.exports={
    addproduct,
   productdetials,
   deletproduct,
   productedit,
   loadproductedit,
   addproductpost,
   blockproduct
}