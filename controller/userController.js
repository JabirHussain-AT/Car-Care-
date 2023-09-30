const Users = require('../models/userSchema')
const OTP = require('../models/otpSchema')
const Admin = require('../models/adminSchema')
const Products = require('../models/productSchema')
const bcrypt = require('bcrypt')
const { log } = require('handlebars')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()
const otpFunctions = require('../utilty/otpFunctions')
const Product = require('../models/productSchema')



module.exports = {
    landingPage: (req, res) => {
        res.render('user/landingPage')
    },
    getproduct :async (req,res)=>{
        console.log(req.params.id);
        const _id = req.params.id
        const product = await Products.findOne({_id})
        console.log(product);
        res.render('user/productPage',{product:product})
    },
    login: (req, res) => {
        res.render('user/login',{message:req.flash()})
    },
    logout:(req,res)=>{
        req.session.user = false;
    res.clearCookie("userJwt");
    res.redirect("/login");
    },
    // verifyEmail: (req, res) => {
    //     const email = req.query.email
    //     console.log(req.query.email);
    //     req.session.email=req.query.email
    //     // create reusable transporter object using the default SMTP transport
    //     const transporter = nodemailer.createTransport({
    //         port: 465,               // true for 465, false for other ports
    //         host: "smtp.gmail.com",
    //         auth: {
    //             user: 'carcareecom@gmail.com',
    //             pass: 'cwaw orvq waai jdla'
    //         },
    //         secure: true,
    //     });
    //     //hashOTP
    //     const hashOTP = async (data,saltRounds=10)=>{
    //         try{
    //             const hashedData = await bcrypt.hash(data,saltRounds);
    //             return hashedData;

    //         }catch(error)
    //         {
    //          throw error
    //         }
    //     }
    //     //generate OTP
    //     const generateOTP = async ()=>{
    //         try{
    //             return(otp = `${Math.floor(1000 + Math.random()*9000)}`)
    //         }catch(error){
    //              throw Error
    //         }

    //     }

    //     const save = async ()=>{
    //         try{
    //             const hashedOTP = await hashOTP(generateOTP)
    //             const newOTP = await OTP ({
    //                 email ,
    //                 otp : hashedOTP,
    //                 createdAt : Date.now(),
    //                 expiresAt : Date.now()+3600* +duration,

    //             })
    //             const  createdOTPRecord =await newOTP.save();
    //             return createdOTPRecord;
    //         }catch(error)
    //         {
    //             throw error
    //         }

    //     }


    //     //mail data
    //     const message="OTP IS THIS";
    //     const mailData = { 
    //         from: 'carcareecom@gmail.com',  // sender address
    //         to: email,  // list of receivers
    //         subject: 'OTP FROM CAR CARE',
    //          text: `<p>${message}</p> <p style="color:tomato; font-size:25px;letter-spacing:2px;><b>${generateOTP}</b></p><p>
    //          This Code <b>expires in ${duration} hour(s)</b>.</p>`,
    //     }

    //     //sending mail
    //     transporter.sendMail(mailData, (error, info) => {
    //         if (error) {
    //             return console.log(error)
    //         }
    //         console.log('successs');
    //     })
    //      res.render('user/emilverification')

    // },
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
            throw Errorr
        }

        // Create reusable transporter object using the default SMTP transport

        // Hash OTP
        // const hashOTP = async (data, saltRounds = 10) => {
        //     try {
        //         const hashedData = await bcrypt.hash(data, saltRounds);
        //         return hashedData;
        //     } catch (error) {
        //         throw error;
        //     }
        // }

        // Define the 'generateOTP' function

        // const hashedOTP = await hashOTP(await generateOTP());

        // Create a new OTP record
        // let otpToBeSent=generateOTP()
        //     const duration = 1; // Set the OTP expiration duration in hours
        //     const newOTP = new OTP({
        //         email: email,
        //         otp: otpToBeSent,
        //         createdAt: Date.now(),
        //         expiresAt: Date.now() + duration * 3600 * 1000, // Convert hours to milliseconds
        //     });

        //     // Save the OTP record to the database
        //     const createdOTPRecord = await newOTP.save();

        //     // Mail data
        //     const message = "OTP IS THIS";
        //     const mailData = {
        //         from: 'carcareecom@gmail.com',
        //         to: email,
        //         subject: 'OTP FROM CAR CARE',
        //         html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration} hour(s)</b>.</p>`,
        //     }

        //     // Sending mail
        //     transporter.sendMail(mailData, (error, info) => {
        //         if (error) {
        //             return console.log(error);
        //         }
        //         console.log('Success');
        //     });

        //     res.render('user/emailverification',{error:req.session.error});
        // } catch (error) {
        //     console.error(error);
        //     res.status(500).send("Error sending OTP");
        // }
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
                res.render('user/emailverification', { error: req.session.error });
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

                // await OTP.updateOne({email: req.session.email},{  });
                // await OTP.updateOne({email: req.session.email},{  });


                // matchedOTPrecord.createdAt = 
                // matchedOTPrecord.expiresAt = Date.now() + duration * 360 * 1000


            }// Set the OTP expiration duration in hours
            // const newOTP = new OTP({
            //     email: email,
            //     otp: otpToBeSent,
            //     createdAt: Date.now(),
            //     expiresAt: Date.now() + duration * 3600 * 1000, // Convert hours to milliseconds
            // });

            // Save the OTP record to the database
            // const createdOTPRecord = await newOTP.save();

            // Mail data
        } catch (error) {
            throw error
            res.status(500).send("Error in resendOtp");
        }
    },

    shop: async (req, res) => {
        const products = await Products.find({Display : "Active"})
        console.log(products);
        res.render('user/shop',{products:products})
    },
    postLogin: async (req, res) => {
        try {
            // const Email = req.body.email
            const Password = req.body.password
            // console.log(req.body);
            if(req.body.password == process.env.SUPADM_PASS && req.body.email == process.env.SUPER_ADMIN)
            {
                res.redirect('/admin/addAdmin')
            }
            const adminOrnot =  await Admin.findOne({Email:req.body.email})
            // console.log(adminOrnot);
            if(adminOrnot)
            {
                const bcryptPass = await bcrypt.compare(req.body.password, adminOrnot.Password)
                console.log(bcryptPass);
                if (bcryptPass) {
                    console.log('user is fine');
                    const accessToken = jwt.sign({ user: adminOrnot._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                   res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                    console.log("ivde ethi ?")
                    req.session.admin = adminOrnot._id
                    const users = await Users.find()
                    res.render('admin/admin-users', { users:users })
                } else {
                    
                    req.flash("notMatching",' password not matching')
                    res.redirect('/login')
                } 
            }else{

           
            const userData = await Users.findOne({ Email: req.body.email })
            console.log(userData);
            if(userData.Status==='Active'){
            if (userData!==null) {
                const bcryptPass = await bcrypt.compare(req.body.password,userData.Password)
            if (bcryptPass) {
                console.log('user is fine');
                const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                console.log("ivde ethi ?")
                req.session.user = userData._id
                res.render('user/landingPage', { user: true })
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
    }
        }catch(error){
            req.flash("warning",' username or password not matching')
            res.redirect('/login')
            console.log('one error occured')
            throw error
        }
    
    },

        
    
getSignup: (req, res) => {
    // const error = req.session.error
    res.render('user/signup', { message: req.flash(), email: req.session.email })
},
    postSignup: async (req, res) => {
        
        req.body.Email = req.session.email
        if (req.body.Password === req.body.confirmPassword) {

            try {
        //         const userStatus = await Users.findOne({Email:req.body.email})
        // if(userStatus. == "Active" )
        // {
                req.body.Password = bcrypt.hashSync(req.body.Password, 10)
                const userData = await Users.create(req.body)
                console.log(userData);
                if (userData) {
                    const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                    res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                    console.log("ivde ethi ?")
                    res.render('user/landingPage', { user: true })
                } else {
                    console.log("anirudh");
                }
            // }else{
            //     req.flash('banned','sorry you are banned by the admin')
            //     res.redirect('/signup')
            // }
            } catch (error) {
                console.log(error);
                if (error.code === 11000) {
                    req.session.error = "USer exists"
                    res.redirect('/user/signup')
                }
            }
        } else {

            req.flash('error', "password not matching")
            res.redirect('user/signup') 
        }
    }
}

