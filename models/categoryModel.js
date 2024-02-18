const mongoose=require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
const categorySchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    offer: {
        type: ObjectId,
        ref: 'offerModel',
    },
    discountedPrice: Number,
    description:{
        type:String,
        required:true
    },
    is_list:{
        type:Boolean,
        default:false
    }

})
const categoryModel=mongoose.model('categoryModel',categorySchema);
module.exports=categoryModel