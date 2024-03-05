const User = require('../models/usermodel');
const categoryModel = require('../models/categoryModel');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel')
const orderModel = require('../models/orderModals')
const puppeteer = require('puppeteer')
const path = require('path')
const ejs = require('ejs')
const CouponModel=require('../models/CouponModel')
const offerModel=require('../models/offerModel')
const ExcelJS = require('exceljs');






const loadlogin = async (req, res) => {
    try {

        res.render('login')

    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}

const loadsign = async (req, res) => {
    try {
        email = req.body.email
        password = req.body.password
        const adminvalid = await User.findOne({ email: email })
        if (adminvalid && adminvalid.isAdmin == 1) {
            const passwordmatch = await bcrypt.compare(password, adminvalid.password)
            console.log(passwordmatch);
            if (passwordmatch) {
                req.session.admin_id = adminvalid._id;
                res.redirect('/admin/dashbord')
            } else {
                res.render('login', { message: "inncorrect password" })
            }
        } else {
            res.render("login", { message: "incorrect email" })
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}

const loadhome = async (req, res) => {
    try {
        const totalorders = await orderModel.countDocuments()
        const totalproducts = await Product.countDocuments()
        const revenue = await orderModel.aggregate([{
            $group: {
                _id: null,
                revenue: { $sum: "$subtotal" }
            }

        }])
        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        console.log("", startOfMonth);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);
        const currentMonthName = (new Date()).toLocaleString('default', { month: 'long' });

        const monthlyrevenue = await orderModel.aggregate([

            {
                $match: {
                    orderDate: {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    },
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    monthlyrevenue: { $sum: "$subtotal" }

                }
            }
        ])
        console.log("gjf", monthlyrevenue);
        const monthlyOrder = await orderModel.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },

                    monthlyOrder: { $sum: 1 }
                }
            }
        ]);

        console.log(" order", monthlyOrder);
        /////////////////////////////////////////
        const allMonthsData = Array.from({ length: 12 }, (_, index) => {
            return {
                month: index + 1,
                monthlyrevenue: 0,
                monthlyOrder: 0
            };
        });


        if (monthlyrevenue.length > 0) {
            allMonthsData[currentMonth.getMonth()] = {
                month: currentMonth.getMonth() + 1,
                monthlyrevenue: monthlyrevenue[0].monthlyrevenue,
                monthlyOrder: monthlyOrder.length > 0 ? monthlyOrder[0].monthlyOrder : 0
            };
        }

        console.log("All Months Data:", allMonthsData);




        ///////////////////////////
        const monthlyRevenueArray = allMonthsData.map(entry => entry.monthlyrevenue);
        const monthlyOrderArray = allMonthsData.map(entry => entry.monthlyOrder);

        
        console.log("Monthly Revenue Array:", monthlyRevenueArray);
        console.log("Monthly Order Array:", monthlyOrderArray);






        const cashondelivery = await orderModel.countDocuments({ payment: "cash-on-delivery" })
        const Razorpay = await orderModel.countDocuments({ payment: "Razorpay" })

        const Wallet = await orderModel.countDocuments({ payment: "'Wallet" })




        res.render('dashbord', { totalorders, totalproducts, revenue, monthlyrevenue, currentMonthName, monthlyRevenueArray, cashondelivery, Razorpay, Wallet, monthlyOrderArray })
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}
const loadusers = async (req, res) => {
    try {
        const users = await User.find({})
        res.render('users', { users })
    } catch (error) {
        console.log(error.mesage);
        res.status(500).render('user/500');
    }
}
const blockUser = async (req, res) => {
    try {
        console.log("vanoooo");
        const user = req.params.id
        console.log(user);
        const value = await User.findOne({ _id: user })
        console.log("iyaoo");
        if (value.is_blocked) {
            console.log("vannilefgh");
            await User.updateOne({ _id: user }, { $set: { is_blocked: false } })
            console.log("vannile");

        } else if (value.is_blocked == false) {

            console.log("veruuu");
            await User.updateOne({ _id: user }, { $set: { is_blocked: true } })
        }
        res.json({ block: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}
const loadproduct = async (req, res) => {
    try {
        const currentDate=new Date()
        const offers=await offerModel.find({expiryDate:{$gte:currentDate},is_blocked:false})
        const category = await categoryModel.find({ is_list: false })
        const product = await Product.find({}).populate("categoryId.offer").populate('offer')

        product.forEach(async(product)=>{
        console.log(product.categoryId.name);    
            if(product.categoryId.offer){
                console.log("catgory ofeer is herer ");
                const offerPrice = product.price * (1 - product.categoryId.offer.discountAmount / 100);
                product.discountPrice = parseInt(offerPrice);
                product.offer=product.categoryId.offer
               await  product.save()
               console.log(product);
            }else if(product.offer){
                console.log("product offer herer");
                const offerPrice = product.price * (1 - product.offer.discountAmount / 100);
                product.discountPrice = parseInt(offerPrice);
                await product.save()
            }
        })
        res.render('product', { category, product,offers })

    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');

    }
}
const loadcategory = async (req, res) => {
    try {
        const category = await categoryModel.find({}).populate('offer')
        const offer= await offerModel.find({})
        res.render('category', { category ,offer})
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}
const loadcreatecategory = async (req, res) => {
    try {
     const existingcategory=await categoryModel.find()
        res.render('createcategorie',{existingcategory})
        console.log(existingcategory);
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
        
    }
}
const loadcreating = async (req, res) => {
    try {
        const name = req.body.name;
        const description = req.body.Description;
    
        
        const existingCategories = await categoryModel.find({}, 'name');
    
        
        const duplicateName = existingCategories.some(category => category.name.toLowerCase() === name.toLowerCase());
    
        if (duplicateName) {
           
            return res.render('createcategorie', { message: "You can't add a category with the same name" });
        } else {
           
            const newCategory = new categoryModel({
                name: name,
                description: description
            });
    
            await newCategory.save();
            return res.redirect('/admin/category');
        }
    } catch (error) {
       
        console.log(error.message);
        return res.status(500).render('user/500');
    }
}
const
    loadeitcategory = async (req, res) => {
        try {
            const id = req.query.id

            const userdata = await categoryModel.findById({ _id: id })

            res.render('editcategory', { userdata })
        } catch (error) {
            console.log(error.message);
            res.status(500).render('user/500');
        }
    }
const updatingcategory = async (req, res) => {
    try {
        const name = req.body.name
        const description = req.body.Description
        const category = await categoryModel.findOne({ name: name })
        console.log("heloo");
        if (category && category.name == name) {
            console.log("yiii");
            res.render('editcategory', { message: "already exist", userdata: category })
        } else {
            console.log("hoii")
            await categoryModel.updateOne({ _id: req.body.id }, { $set: { name: name, description: description } })
            res.redirect('/admin/category')
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}
const blockcategory = async (req, res) => {

    try {
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
        res.status(500).render('user/500');
    }
}

const deletcategory = async (req, res) => {
    const category = req.params.id

    try {
        const categoryId = await categoryModel.findById(category)
        if (!categoryId) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await categoryId.deleteOne()
        res.json({ ok: true })
    } catch (error) {
        console.log(error.mesage);
        res.status(500).render('user/500');
    }
}

const order = async (req, res) => {
    try {

        const order = await orderModel.find()
        res.render('order', { order })
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}

const orderview = async (req, res) => {
    try {

        const userId = req.query.id
        detials = await orderModel.findById({ _id: userId }).populate('products.productId')
        res.render('orderview', { detials })
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}

const updatestatus = async (req, res) => {
    try {
        console.log("machiii");
        const productId = req.body.productId

        const status = req.body.status
        console.log(status);
        console.log(productId)
        const updateorder = await orderModel.findOneAndUpdate({ 'products._id': productId }, { $set: { 'products.$.productStatus': status } }, { new: true })
        console.log(updateorder);
        return res.json({ success: true })
        console.log("dooon");
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}

const salesreports = async (req, res) => {
    console.log("vannitiLLLA");
    try {

        const data = req.query.id
        const Sales=req.query.sales 
        console.log(Sales); 
        const totalorders = await orderModel.countDocuments()
        const revenue = await orderModel.aggregate([{
            $group: {
                _id: null,
                revenue: { $sum: "$subtotal" }
            }

        }])

        const discountAmount=await 
        console.log(revenue);

        if (data == 'Yearly') {
            const currentDate = new Date();
            const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
            let yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfYear,
                    $lte: endOfYear
                }
            })
            console.log('helooo2');
            console.log(yearlyorder)
            res.render('salesreport', { yearlyorder, data,Sales,revenue ,totalorders})
            console.log('helooo1');

        } else if (data == 'Monthly') {
            console.log("veruuuu");
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            let yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            });


            res.render('salesreport', { yearlyorder, data,Sales,revenue ,totalorders})
        } else if (data == 'Weekly') {
            const currentDate = new Date();
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

            const endOfWeek = new Date(currentDate);
            endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);
            console.log("Start of Week:", startOfWeek);
            console.log("End of Week:", endOfWeek);


            let yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            });
            console.log("sdihfidh", yearlyorder);

            res.render('salesreport', { yearlyorder, data,Sales,revenue,totalorders })

        }else if(data=="Total"){

            let yearlyorder= await orderModel.find({})
            res.render('salesreport',{yearlyorder,data,Sales,revenue,totalorders})

        }



    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}


const downloadpdf = async (req, res) => {
    try {
        console.log("ndhaannnn");
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const data = req.query.id
        const Sales=req.query.sales
        const totalorders = await orderModel.countDocuments()
        const revenue = await orderModel.aggregate([{
            $group: {
                _id: null,
                revenue: { $sum: "$subtotal" }
            }

        }])


        let yearlyorder;

        if (data == 'Yearly') {
            console.log("hiiii");
            const currentDate = new Date();
            const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfYear,
                    $lte: endOfYear
                }
            })


        } else if (data == 'Monthly') {
            console.log("veruuuu");
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            });



        } else if(data=="Weekly") {
            const currentDate = new Date();
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

            const endOfWeek = new Date(currentDate);
            endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);

            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            });

    //   console.log(yearlyorder,"year ");

        }else{
            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            });

         console.log(yearlyorder,"year");

        }


        const ejspagepath = path.join(__dirname, '../views/admin/salesreport.ejs')
        const ejsPage = await ejs.renderFile(ejspagepath, { data, yearlyorder,Sales,revenue,totalorders })
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(ejsPage);
        const pdfBuffer = await page.pdf();
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        res.send(pdfBuffer);
        console.log("suucess");


    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}
const DownloadExcel = async (req, res) => {
    try {

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const data = req.query.id;
        const totalorders = await orderModel.countDocuments()
        const revenue = await orderModel.aggregate([{
            $group: {
                _id: null,
                revenue: { $sum: "$subtotal" }
            }

        }])

        let yearlyorder;

        if (data == 'Yearly') {
            const currentDate = new Date();
            const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfYear,
                    $lte: endOfYear
                }
            });
        } else if (data == 'Monthly') {
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            });
        } else if (data == "Weekly") {
            const currentDate = new Date();
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(currentDate);
            endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);
            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            });
        } else {
            yearlyorder = await orderModel.find({
                orderDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            });
        }

        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

       
        worksheet.addRow(['Order ID', 'Customer Name', 'Order Date', 'Subtotal', ' Payment', 'overall order amount ','overall sales count']);

       
        yearlyorder.forEach(order => {
            worksheet.addRow([order._id, order.delivery_address?.name||'n/a', order.orderDate?.toLocaleDateString('en-US', {
                weekday: 'short' , year: 'numeric' , month: 'short' ,
                day: 'numeric'||'n/a' }), order.subtotal, order.payment],revenue[0].revenue,totalorders);
        });

       
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}
const loadlogout=async(req,res)=>{
    try{
    req.session.destroy((err)=>{
    
        if(err){
            console.log("error destroying session :",err.message);
        }else{
            console.log("session destroyed");
            res.redirect('/admin/')
        }
    })
}catch(error){
console.log(error.message);
res.status(500).render('user/500');
}
}

const loadCoupon=async(req,res)=>{
    try {
        const coupons=await CouponModel.find()
       res.render('Coupon',{coupons}) 
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}
const addcoupon=async(req,res)=>{
    console.log("hiiiiiiiiii");
    const coupons=await CouponModel.find()
    try {
  const copuncode=await CouponModel.findOne({couponCode:req.body.Couponcode})
  const name=await CouponModel.findOne({name:req.body.name})

  if(copuncode||name){
    res.render("coupon",{message:'coupon already esixt ',coupons})
  }else{
    const data=new CouponModel({
        name:req.body.name,
        couponCode:req.body.Couponcode,
        discountAmount:req.body.discountAmount,
        activationDate:req.body.activationdate,
        expiryDate:req.body.Expiredate,
        criteriaAmount:req.body.cramount

    }) 
    await data.save()
    res.redirect('/admin/Coupon')
  }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}

const removeCoupon=async(req,res)=>{
    try {
        console.log("heyyyy");
      const  couponId=req.params.id
      console.log(couponId);
        const coupon=await CouponModel.findOneAndDelete({_id:couponId})
        if(coupon){
        res.json({ok:true})
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
    }
}

module.exports = {
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
    updatestatus,
    salesreports,
    loadlogout,
    downloadpdf,
    loadCoupon,
     addcoupon,
     removeCoupon,
     DownloadExcel


}