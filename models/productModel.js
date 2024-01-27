const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


const productSchema=new  mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    categoryId:{
        type:ObjectId,
        ref:'categoryModel',
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    offer:{
        type:String,
        required:false
    },
    description:{
        type:String,
        required:false
    },
    images:{
        image1:{
           type:String,
           required:true 
        },
        image2:{
            type:String,
            required:true
        },
        image3:{
          type:String,
          required:true
        },
        image4:{
            type:String,
            required:true
        }
        
    },
    is_blocked:{
       type:Boolean,
       default: false,
       required:true 
    }


});
const product =mongoose.model('product',productSchema)
module.exports=product;