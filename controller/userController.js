const Users = require('../models/userSchema')
const OTP = require('../models/otpSchema')
const Admin = require('../models/adminSchema')
const Products = require('../models/productSchema')
const Category = require('../models/categorySchema')
const Orders = require('../models/orderSchema')
const Cart = require('../models/cartSchema')
const CouponHistory = require('../models/couponHistorySchema')
const bcrypt = require('bcrypt')
const { log } = require('handlebars')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const moment = require('moment')
const Banner = require('../models/bannerSchema')
const mongoose = require('mongoose')
require('dotenv').config()
const otpFunctions = require('../utilty/otpFunctions')
const razorpay = require('../utilty/onlinePayment')
const { Mongoose } = require('../config/dbconnection')
const { getDefaultHighWaterMark } = require('nodemailer/lib/xoauth2')
const onlinePayment = require('../utilty/onlinePayment')
const invoice = require('../utilty/invoiceCreater')




module.exports = {
    landingPage: async(req, res) => {
        try{
            const user = req.session.user
            const banner = await Banner.findOne({Status:"Enabled"}) 
            console.log(banner.kjvjxnvjvkfkv)
            res.render('user/landingPage',{Banner:banner})
        }
        catch(err)
        {
            throw err
        }
       
    },
    home :async (req,res)=>{
        const category = await Category.find()
        const user = req.session.user
        const banner = await Banner.findOne({Status:"Enabled"}) 
        res.render('user/home',{user:user,Banner:banner})
    },
    profile :async (req,res)=>{
        const userid = req.session.user.user
        const user = await Users.findOne({_id:userid})
        res.render("user/profile",{user:user,message:req.flash()})
    },
    postProfile : async (req,res)=>{
        try{
            const { MobNo, Name } = req.body;
            // console.log(req.body)
            const userid = req.session.user.user
            const updatedUser = await Users.findByIdAndUpdate(
                userid,
                { $set: { MobNo, Name } },
                { new: true }
            );
            req.flash("profileUpdated","successfully updated ")
            res.redirect('/profile')
        }catch(err)
        {
            console.log("err in the post profile")
            throw err
        }
    },
    getproduct :async (req,res)=>{
        console.log(req.params.id);
        const _id = req.params.id
        const product = await Products.findOne({_id})
       
        const user = req.session.user
        res.render('user/productPage',{product:product,user:user})
    },
    login: (req, res) => {
        const user = req.session.user
        res.render('user/login',{message:req.flash(),user})
    },
    logout:(req,res)=>{
        req.session.user = false;
    res.clearCookie("userJwt");
    res.redirect("/login");
    },
   
    verifyEmail: async (req, res) => {
        try {
           
            const user = await Users.findOne({Email : req.query.email}) 
            if(user){
                req.flash("exists","email already taken")
                res.redirect('/signup')
            }else{

                const email = req.query.email;
                console.log(req.query.email);
                req.session.email = email;
                otpToBeSent = otpFunctions.generateOTP()
                const result = otpFunctions.sendOTP(req, res, email, otpToBeSent)
            }

           
       
        } catch (error) {
            console.log("error in the verify email")
            throw error
        }

        
    },
    otpAuth: async (req, res) => {
        try {
            let { otp } = req.body;

            // Ensure an OTP record exists for the email
            console.log(req.session.email)
            const matchedOTPrecord = await OTP.findOne({ email: req.session.email });

            if (!matchedOTPrecord) {
                throw new Error("No OTP records found for the provided email.");
            }

            const { expiresAt } = matchedOTPrecord;

            // Checking for expired codes
            if (expiresAt < Date.now()) {
                await OTP.deleteOne({ email: req.session.email });
                throw new Error("The OTP code has expired. Please request a new one.");
            }

            // Compare the hashed OTP from the database with the provided OTP

            // const hashedOTP = matchedOTPrecord.otp;
            // const validOTP = await bcrypt.compare(otp, hashedOTP);
            console.log(otp);
            const dbOTP = matchedOTPrecord.otp
            if (otp == dbOTP) {
                // Redirect to the landing page upon successful OTP validation
                req.session.OtpValid = true;
                res.redirect('/signup');
            } else {
                // Invalid OTP
                req.session.error = "The OTP is invalid.";
                console.log("INVALIIIIIIEDD");
                req.flash('error', "OTP IS INVALID")
                res.render('user/emailverification', { error: req.session.error ,user:req.session.user});
            }
        } catch (error) {
            console.error(error);

            // Handle errors here, e.g., redirect to an error page or send an error response
            res.status(500).render('error', { error: "Error during OTP validation" });
        }
    },
    resendOtp: async (req, res) => {

        try {
            const matchedOTPrecord = await OTP.findOne({ email: req.session.email });
            if (matchedOTPrecord) {
                console.log("OKAY ANO");
                email = req.session.email
                const duration = 1;
                let otpToBeSent = await otpFunctions.generateOTP()
                await OTP.updateOne({ email: req.session.email }, {
                    otp: otpToBeSent,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + duration * 360 * 1000
                });
                const sent = otpFunctions.resendOTP(req, res, email, otpToBeSent)



            }
            // Mail data
        } catch (error) {
            throw error
            res.status(500).send("Error in resendOtp");
        }
    },
    

    shop: async (req, res) => {
        const user = req.session.user;
        const category = await Category.find();
        
        let products;
    
        if (req.query.search) {
            // If there's a search query, filter products based on it
            products = await Products.find({
                Display: "Active",
                ProductName: { $regex: new RegExp(req.query.search, 'i') } // Case-insensitive search
            });
        } else {
            // If no search query, fetch all products
            products = await Products.find({ Display: "Active" });
        }
    
        res.render('user/shop', { products, user, category });
    },
    categoryBased : async (req,res)=>{
        const categoryId = req.params.id
        const categories = await Category.findOne({_id:categoryId})
        const user=req.session.user
        const category = await Category.find()
        const products = await Products.find({Display : "Active",Category:categories.Name})
        console.log(category)
        res.render('user/shop',{products:products,user:user,category:category})
    },
    postLogin: async (req, res) => {
        try {
            // const Email = req.body.email
         const userData = await Users.findOne({ Email: req.body.email })
            console.log(userData);
            if(userData.Status==='Active'){
            if (userData!==null) {
                const bcryptPass = await bcrypt.compare(req.body.password,userData.Password)
            if (bcryptPass) {
                console.log('user is fine');
                const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                req.session.user = userData.id
                console.log(req.session.user);
                // res.render('user/home', { user: true })
                res.redirect('/home')
            } else {
                
                req.flash("notMatching",' password not matching')
                res.redirect('/login')
            } 
            } else {
                console.log('userdata is null ');
                req.flash('error','invalid email')
                res.redirect('/login')
            }
        }
        else{
            console.log('userdata is banned ');
                req.flash('banned','you are Banned')
                res.redirect('/login')
        }
    
        }catch(error){
            req.flash("warning",' username or password not matching')
            res.redirect('/login')
            console.log('one error occured')
            throw error
        }
    
    },

        
    
getSignup: (req, res) => {
    const user = req.session.user
    // const error = req.session.error
    res.render('user/signup', { message: req.flash(), email: req.session.email ,user:user})
},
    postSignup: async (req, res) => {
        
        req.body.Email = req.session.email
        if (req.body.Password === req.body.confirmPassword) {

            try {
        //        
                req.body.Password = bcrypt.hashSync(req.body.Password, 10)
                const userData = await Users.create(req.body)

                console.log(userData);
                if (userData) {
                    const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                    res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                    
                  req.session.user=userData._id
                   console.log(req.session.user)
                  const couponAdd = new CouponHistory({
                    UserId: req.session.user,
                    Status : 'Not Used',
                    CouponCode : "NU-69CC"
                  });
                  await couponAdd.save()

                    res.render('user/home', { user: true })
                } else {
                    console.log("anirudh");
                }
          
            } catch (error) {
                console.log(error);
                if (error.code === 11000) {
                    req.session.error = "USer exists"
                    res.redirect('/signup')
                }
            }
        } else {

            req.flash('error', "password not matching")
            res.redirect('/signup') 
        }
    },
    forgetPass : (req,res)=>{
        res.render('user/forgetPassword/forgetPassword',{ message: req.flash(), email: req.session.email,user:req.session.user })
    },
    postForgetPass :async (req,res)=>{
       try{

        const email=await Users.findOne({Email:req.body.email})
        if(email)
        {  
            req.session.forgetPassEmail= email.Email
            res.redirect('/forgetOtp')
            
        }else{
            req.flash("Nouser","No Existing Account")
            redirect('/forgetPass')
        }
       }catch(error){

       }
        
    },
    forgetOtp : async(req,res)=>{
        try{
            const email = req.session.forgetPassEmail
            otpToBeSent =otpFunctions.generateOTP()
            console.log("fogotp")
           req.session.otp =otpToBeSent
           console.log(req.session.otp);
            otpFunctions.forgetOtp(req,res,email,otpToBeSent)
           
        }
        catch(error){
         console.log("error in forgetotp" ,error);
        }
               
    },
    postforgetOtp :async (req,res)=>{
      try{
        const email = req.params.email
            if(req.body.otp == req.session.otp)
            {
                res.redirect(`/setNewPass/${email}`)
            }
            else{
                req.flash("forgetOtp","not valid")
                res.redirect('/forgetOtp')
            }
      }catch(error)
      {
        throw error
      }
    },
    setNewPass : (req,res)=>{
        req.session.userEmail= req.params.email
        res.render('user/forgetPassword/setNewPass',{message:req.flash(),email:req.session.userEmail})
    },
    postsetNewPass : async (req,res)=>{
        try{
           const newPass = req.body.newPass
           const ConfirmPass = req.body.ConfirmPass
           console.log(req.body);
           console.log(req.session.userEmail)
            if(newPass === ConfirmPass)
            {
                const Password = bcrypt.hashSync(req.body.newPass,10)
                await Users.updateOne({Email:req.session.forgetPassEmail},{
                    Password:Password,
                })
                res.redirect('/login')
            }else
            {
                req.flash("notMatching","not matching password")
                res.redirect('/setNewPass')
            }
        }catch(error){
            throw error
            console.log("error on setting new pass");
        }
    },
    changePassword :async (req,res)=>{
            const user = req.session.user.user
            const User = await Users.findOne({_id:user})
            console.log(req.body,"jabir")
            const {oldPassword,newPassword,confirmPassword}= req.body
            console.log(User.Password ,"osos")
            if(newPassword === confirmPassword)
            {
                const bcryptPass = await bcrypt.compare(oldPassword,User.Password)
                // console.log(bcryptPass)
                if(bcryptPass)
                    {
                                // console.log("njnum varatee....")
                            const Password = bcrypt.hashSync(newPassword,10)   
                            await Users.updateOne({_id:user},{
                                Password:Password,
                            }) 
                            req.flash('success',"Password Changed Successfully")
                            res.redirect('/profile')
                    }
            //    console.log(User.Password)

            }else
            {
                req.flash("nomatch","Entered Passwords Not Matching")
                res.redirect('/profile')
            }
    },
     addAddress :async (req,res)=>{
          
          try{
              console.log("iam here in add address")
              res.render('user/addAddress')
            }catch(error){
                throw error
                console.log("error in the  addAddress Catch")
            }
            
        },
        checkout :async (req,res)=>{
         
            const userid=req.session.user.user
          const userId = new mongoose.Types.ObjectId(userid)
          try{
            
              const user =await Users.findOne({ _id: userId })
            //   console.log("from checkout",user);
              res.render('user/checkOut',{user:user})
          }catch(error){
                      throw error
                      console.log("error in the  checkout catch")
          }
         
        },
      
        postaddAddress : async (req,res)=>{
            console.log(req.body)
            const userid = req.session.user.user
            
            const userId = new mongoose.Types.ObjectId(userid)
            // const user = await Users.findOne({_id:userId})
            console.log(userId)
            
            const {Name, address, city,state, zip, mobileNumber } = req.body;
            
            const newAddress = {
                Name,
                address,
                city,
                state,
                zip,
                mobileNumber
            }
         try {
             const user = await Users.findOne({ _id: userId });
             
            if (user) {
              // Push the new address to the Address array
              user.Address.push(newAddress);
          
              // Save the user document
              await user.save();
          
              console.log('Address added successfully');
              req.flash("added","Address added successfully")
              res.redirect('/Address')
            //   res.status(200).send('Address added successfully');
            } else {
              console.log('User not found');
              res.status(404).send('User not found');
            }
          } catch (error) {
            console.error('Error adding address:', error.message);

            res.status(500).send('Internal Server Error');
          }


      },
      postCheckAddAddress : async (req,res)=>{
        console.log(req.body)
        const userid = req.session.user.user
        
        const userId = new mongoose.Types.ObjectId(userid)
        // const user = await Users.findOne({_id:userId})
        console.log(userId)
        
        const {Name, address, city,state, zip, mobileNumber } = req.body;
        
        const newAddress = {
            Name,
            address,
            city,
            state,
            zip,
            mobileNumber
        }
     try {
         const user = await Users.findOne({ _id: userId });
         
        if (user) {
          // Push the new address to the Address array
          user.Address.push(newAddress);
      
          // Save the user document
          await user.save();
      
          console.log('Address added successfully');
          req.flash("added","Address added successfully")
          res.redirect('/checkOut')
        //   res.status(200).send('Address added successfully');
        } else {
          console.log('User not found');
          res.status(404).send('User not found');
        }
      } catch (error) {
        console.error('Error adding address:', error.message);

        res.status(500).send('Internal Server Error');
      }


     },
      editAddress :async(req,res)=>{
          const userid = req.session.user.user
          const User = await Users.findOne({_id:userid})
        //   console.log(User.Address,"user is availabe in the editaddress")
            res.render('user/editAddress',{user:User,message:req.flash()})
      },
      postEditAddress: async (req, res) => {
        const addressId = req.params.addressId; // Use req.params.addressId to get the addressId from URL parameters
        const userId = req.session.user.user;
      
        try {
          const user = await Users.findOne({ _id: userId });
      
          if (user) {
            const { Name, address, city, state, zip, mobileNumber } = req.body;
      
            // Find the index of the address in the Address array
            const addressIndex = user.Address.findIndex((a) => a._id.toString() === addressId);
      
            if (addressIndex !== -1) {
              // Update the fields of the existing address
              user.Address[addressIndex].Name = Name;
              user.Address[addressIndex].address = address;
              user.Address[addressIndex].city = city;
              user.Address[addressIndex].state = state;
              user.Address[addressIndex].zip = zip;
              user.Address[addressIndex].mobileNumber = mobileNumber;
      
              // Save the updated user document
              await user.save();
      
              console.log('Address updated successfully');
              req.flash("updated","Address updated successfully")
              res.redirect('/Address')
            //   res.status(200).send('Address updated successfully');
            } else {
              console.log('Address not found');
              req.flash("notFound","Address not found")
              res.redirect('/Address')
            //   res.status(404).send('Address not found');
            }
          } else {
            console.log('User not found');
            // res.status(404).send('User not found');
          }
        } catch (error) {
          console.error('Error updating address:', error.message);
          res.status(500).send('Internal Server Error');
        }
      },
      deleteAddress: async (req, res) => {
        const addressID = req.params.id;
        const userId = req.session.user.user;
      
        try {
          const user = await Users.findOne({ _id: userId });
      
          if (user) {
            // Use $pull to remove the address with the given addressID
            user.Address.pull({ _id: addressID });
      
            // Save the updated user document
            await user.save();
      
            console.log('Address deleted successfully');
            // res.status(200).send('Address deleted successfully');
            req.flash("deleted","Address deleted Successfully")
            res.redirect('/Address')
          } else {
            console.log('User not found');
        //     res.status(404).send('User not found');
          }
        } catch (error) {
          console.error('Error deleting address:', error.message);
          res.status(500).send('Internal Server Error');
        }
      },
      

    //   orderPlaced : (req,res)=>{
    //     console.log("orderPlaced")
    //   },
      
      cancelOrder : async (req,res)=>{
        const orderId = req.params.id; // Assuming orderId is passed in the request parameters

        try {
          // Find the order by ID
          console.log("Cancellll")
          const order = await Orders.findById(orderId);
      
        //   if (!order) {
        //     return res.status(404).json({ message: 'Order not found' });
        //   }
      
          // Update order properties
          order.Status = 'Cancelled';
          order.PaymentStatus = 'Order Cancelled';
      
          // Save the updated order
          const updatedOrder = await order.save();
      
          // Respond with the updated order
        //   res.status(200).json(updatedOrder);
            const orderItems = updatedOrder.Products.map(item => ({
            productId: item.ProductId,
            quantity: item.Quantity
            }));

              // Retrieve products based on the product IDs
              const products = await Products.find({ _id: { $in: orderItems.map(item => item.productId) } });
              //
              for (const orderItem of orderItems) {
                const product =  products.find(product => orderItem.productId.equals(product._id));
                 if (product) {
                     // Convert AvailableQuantity to a number if it's stored as a string
                      const currentQuantity = parseFloat(product.AvailableQuantity);
                    // Convert orderItem.quantity to a number if it's stored as a string
                      const orderQuantity = parseFloat(orderItem.quantity);   
                      product.AvailableQuantity = currentQuantity + orderQuantity;

         // Update stock quantity in the database for this product
                 await Products.updateOne({ _id: product._id }, { $set: { AvailableQuantity: product.AvailableQuantity } });
                 console.log("quantity added")
              }
          }
        //   console.log(orderItems,"blank")
        
        res.redirect('/orderHistory')
        } catch (error) {
          console.error('Error cancelling order:in cancel order', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      
      },
      postCheckOut: async (req,res)=>{
        
        console.log("orderPlaced",req.body)
        const { selectedAddress, paymentMethod } = req.body;
        // console.log(paymentMethod,"karthik pp  here ")
        const userId = new mongoose.Types.ObjectId(req.session.user.user)
        const ProductsInCart = await Cart.findOne({UserId:userId})
        
        try{
            const selectedAddress = JSON.parse(req.body.selectedAddress);
            const newOrder = {
                UserId: userId,
                Products: ProductsInCart.Products, // Assign the products directly
                OrderedDate: moment(new Date()).format('llll'), // Set the order date to the current date
                ExpectedDeliveryDate : moment().add(4, 'days').format('llll'),
                ShippedAddress :{
                    Name: selectedAddress.name,
                    Address: selectedAddress.address,
                    Pincode: selectedAddress.pincode,
                    City : selectedAddress.city,
                    State: selectedAddress.state,
                    Mobile: selectedAddress.mobile,
                },
            //   ShippedAddress :selectedAddress,
              PaymentMethord:paymentMethod,
              TotalAmount : parseFloat(req.session.totalAmount.replace(/[^\d.]/g, ''))
                // Add other properties as needed
            }
            const createdOrder = await Orders.create(newOrder);
            console.log(createdOrder)
            //we are making empty the cart 
            await Cart.updateOne({ UserId: userId }, { $set: { Products: [] } });

            // const order = await Orders.findOne({UserId:userId})
            // console.log(createdOrder.Products,"huehfuefuilwe")
            
            const orderItems = createdOrder.Products.map(item => ({
                productId: item.ProductId,
                quantity: item.Quantity
              }));
              console.log(orderItems,"blank")
              
              // Retrieve products based on the product IDs
            const products = await Products.find({ _id: { $in: orderItems.map(item => item.productId) } });
              // Update stock quantities in the database
            for (const orderItem of orderItems) {
             const product =  products.find(product => orderItem.productId.equals(product._id));
              if (product) {
            product.AvailableQuantity -= orderItem.quantity;
           // Update stock quantity in the database for this product
              await Products.updateOne({ _id: product._id }, { $set: { AvailableQuantity: product.AvailableQuantity } });
              const user = await Users.findOne({_id:req.session.user.user})
              
            }
            if (req.body.paymentMethod === 'COD') { 
                const user = await Users.findOne({_id:req.session.user.user});
                const content = "Successfully placed your Order. It will be shipped within 1 working day. For more queries, connect with our team at 9007972782.";
                const result = otpFunctions.sendMail(req, res, user.Email, content);
                return res.json({ cod: true }); // Use return here
            } else if (req.body.paymentMethod === 'online') {
                const amount = parseFloat(req.session.totalAmount.replace(/[^\d.]/g, ''));
                const response = await razorpay.onlinePayment(amount, createdOrder._id);
                let paymentDetials = {
                    response: response,
                    order: createdOrder,
                    user: userId
                };
                 res.json({ paymentDetials }); // Use return here
            }
            
        }
            //   res.redirect('/orderPlaced')
          }
        
         catch(error)
        {
            console.log("error in the catch of post checkOut")
            throw error
        }
    }

}
    


