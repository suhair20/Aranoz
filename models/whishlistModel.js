const mongoose= require("mongoose")
const ObjectId=mongoose.Schema.Types.ObjectId
  

const whishlistSchema =new mongoose.Schema({
    user:{
        type:ObjectId,
        required:true,
        ref:"User"
    },
    product:[{
        productId:{
            type:String,
            required:true,
            ref:"product"
        }
    }]
})

module.exports =mongoose.model("Whishlist",whishlistSchema)