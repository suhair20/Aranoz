const mongoose=require('mongoose')
const express=require('express')
const app=express()
const path=require('path')
const nocache=require('nocache')
const dotenv=require('dotenv')
dotenv.config()


//define mongo db connection url //
 const dbUrl='mongodb://127.0.0.1:27017/ecommerse';
 
 //connect mongodb with specifcied option//
 mongoose.connect(dbUrl,{
    

    useNewUrlParser: true,
    useUnifiedTopology: true,

 })

 //use the nochache middleware to prevent chacing// 
 app.use(nocache());

 //listen for the 'connected' event when mongodb connecton//
 mongoose.connection.on('connected',()=>{
    console.log('connected to MongoDB');
 });
 
 //listen for the 'error 'event in case of mongoDB connection//
mongoose.connection.on('error',(err)=>{
    console.log('MongoDB connetion error',err);
})

//server static file from the public  directory//
app.use('/public',express.static(path.join(__dirname,'public')));
app.use('/asset',express.static(path.join(__dirname,'public/asset')));
app.use('/assets',express.static(path.join(__dirname,'public/assets')));
app.use('/sharpimages',express.static(path.join(__dirname,'public/sharpimages')));

//userROUTE//
const userRoute=require("./routes/userRoute")
app.use('/',userRoute)

//adminRoute//
const adminRoute=require("./routes/adminRoute")
app.use('/admin',adminRoute)

//strat server and listen port o  3001///
app.listen(3002,()=>{
    console.log("server is running at  http://localhost:3002");
})