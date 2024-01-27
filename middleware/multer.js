const multer= require('multer')
const path= require('path')


 const localStorage=multer.diskStorage({
   
    destination:path.join(__dirname,'../public/multerimages'),
    
    filename:(req,file,callback)=>{
      
        const filename=file.originalname;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = `${filename}-${uniqueSuffix}`;
        callback(null,newFilename)
        
    }
   
 })
 const products= multer({storage:localStorage})
 const uploadproduct=products.fields([
   {name:"image1",maxCount:1},
   {name:"image2",maxCount:1},
   {name:"image3",maxCount:1},
   {name:"image4",maxCount:1}
   
 ])
 

 module.exports={
    uploadproduct,
 }

