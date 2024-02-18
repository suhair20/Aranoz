const express=require('express')
const adminRoute=express()
const config=require('../config/config')
const User=require('../models/usermodel')
const bcrypt=require('bcrypt')
const admincontroller=require("../controllers/admincontoller")
const productcontroller=require("../controllers/productcontroller")
const multer= require("../middleware/multer")
const auth = require('../middleware/auth')
const offerController=require('../controllers/offerController')


adminRoute.use(express.json());
adminRoute.use(express.urlencoded({extended:true}));




adminRoute.set("view engine","ejs")
adminRoute.set("views","./views/admin")

adminRoute.get('/',auth.isAdminLogout,admincontroller.loadlogin)
adminRoute.post('/',auth.isAdminLogout,admincontroller.loadsign)
adminRoute.get('/dashbord',auth.isAdminLogin,admincontroller.loadhome)
adminRoute.get('/users',auth.isAdminLogin,admincontroller.loadusers)
adminRoute.patch('/blockusers/:id',admincontroller.blockUser)
adminRoute.get('/product',auth.isAdminLogin,admincontroller.loadproduct)
adminRoute.get('/productdetials/:productId',auth.isAdminLogin,productcontroller.productdetials)
adminRoute.delete('/deletproduct/:id',productcontroller.deletproduct)
adminRoute.get('/category',auth.isAdminLogin,admincontroller.loadcategory)
adminRoute.get('/createcategory',auth.isAdminLogin,admincontroller.loadcreatecategory)
adminRoute.post('/createcategory',auth.isAdminLogin,admincontroller.loadcreating)
adminRoute.get('/editcategory',auth.isAdminLogin,admincontroller.loadeitcategory)
adminRoute.post('/editcategory',auth.isAdminLogin,admincontroller.updatingcategory)
adminRoute.delete('/deletcategory/:id',auth.isAdminLogin,admincontroller.deletcategory)
adminRoute.patch('/blockcategory/:id',auth.isAdminLogin,admincontroller.blockcategory)
adminRoute.patch('/blockproduct/:id',auth.isAdminLogin,productcontroller.blockproduct)

adminRoute.get('/productedit',auth.isAdminLogin,productcontroller.loadproductedit)
adminRoute.post('/productedit',auth.isAdminLogin,multer.uploadproduct,productcontroller.productedit)
adminRoute.get('/addproduct',auth.isAdminLogin,productcontroller.addproduct)
adminRoute.post('/addproduct',multer.uploadproduct,productcontroller.addproductpost)
adminRoute.get('/order',auth.isAdminLogin,admincontroller.order)
adminRoute.get('/orderview',auth.isAdminLogin,admincontroller.orderview)
adminRoute.post('/updatestatus',auth.isAdminLogin,admincontroller.updatestatus)
adminRoute.get('/salesreport',auth.isAdminLogin,admincontroller.salesreports)
adminRoute.get('/DownloadPdf',auth.isAdminLogin,admincontroller.downloadpdf)
adminRoute.get('/logout',admincontroller.loadlogout)
adminRoute.get('/Coupon',admincontroller.loadCoupon)
adminRoute.post('/Addcoupon',admincontroller.addcoupon)
adminRoute.delete('/removeCoupon/:id',admincontroller.removeCoupon)
adminRoute.get('/offer',offerController.loadoffer)
adminRoute.post('/AddOffer',offerController.postoffer)
adminRoute.delete('/removeOffer/:id',offerController.removeOffer)
adminRoute.patch('/applyOffer',offerController.applyOffer)
adminRoute.patch('/removeoffer',offerController.removeProductOffer)









module.exports=adminRoute;