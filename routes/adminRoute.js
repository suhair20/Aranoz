const express=require('express')
const adminRoute=express()
const config=require('../config/config')
const User=require('../models/usermodel')
const bcrypt=require('bcrypt')
const admincontroller=require("../controllers/admincontoller")
const productcontroller=require("../controllers/productcontroller")
const multer= require("../middleware/multer")



adminRoute.use(express.json());
adminRoute.use(express.urlencoded({extended:true}));




adminRoute.set("view engine","ejs")
adminRoute.set("views","./views/admin")

adminRoute.get('/',admincontroller.loadlogin)
adminRoute.post('/',admincontroller.loadsign)
adminRoute.get('/dashbord',admincontroller.loadhome)
adminRoute.get('/users',admincontroller.loadusers)
adminRoute.patch('/blockusers/:id',admincontroller.blockUser)
adminRoute.get('/product',admincontroller.loadproduct)
adminRoute.get('/productdetials/:productId',productcontroller.productdetials)
adminRoute.delete('/deletproduct/:id',productcontroller.deletproduct)
adminRoute.get('/category',admincontroller.loadcategory)
adminRoute.get('/createcategory',admincontroller.loadcreatecategory)
adminRoute.post('/createcategory',admincontroller.loadcreating)
adminRoute.get('/editcategory',admincontroller.loadeitcategory)
adminRoute.post('/editcategory',admincontroller.updatingcategory)
adminRoute.delete('/deletcategory/:id',admincontroller.deletcategory)
adminRoute.patch('/blockcategory/:id',admincontroller.blockcategory)
adminRoute.patch('/blockproduct/:id',productcontroller.blockproduct)

adminRoute.get('/productedit',productcontroller.loadproductedit)
adminRoute.post('/productedit',multer.uploadproduct,productcontroller.productedit)
adminRoute.get('/addproduct',productcontroller.addproduct)
adminRoute.post('/addproduct',multer.uploadproduct,productcontroller.addproductpost)
adminRoute.get('/order',admincontroller.order)
adminRoute.get('/orderview',admincontroller.orderview)
adminRoute.post('/updatestatus',admincontroller.updatestatus)






module.exports=adminRoute;