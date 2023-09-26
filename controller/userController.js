const Users = require('../models/userSchema')
const OTP = require('../models/otpSchema')
const bcrypt = require('bcrypt')
const { log } = require('handlebars')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()



module.exports = {
    landingPage: (req, res) => {
        res.render('user/landingPage')
    },
    login: (req, res) => {
        res.render('user/login')
    },
    shop: (req, res) => {
        res.render('user/shop')
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
            const email = req.query.email;
            console.log(req.query.email);
            req.session.email = email;

            // Create reusable transporter object using the default SMTP transport
            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: 'carcareecom@gmail.com',
                    pass: 'cwaw orvq waai jdla'
                },
                secure: true,
            });

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
            const generateOTP = () => {
                return `${Math.floor(1000 + Math.random() * 9000)}`;
            }

            // const hashedOTP = await hashOTP(await generateOTP());

            // Create a new OTP record
            let otpToBeSent=generateOTP()
            const duration = 1; // Set the OTP expiration duration in hours
            const newOTP = new OTP({
                email: email,
                otp: otpToBeSent,
                createdAt: Date.now(),
                expiresAt: Date.now() + duration * 3600 * 1000, // Convert hours to milliseconds
            });

            // Save the OTP record to the database
            const createdOTPRecord = await newOTP.save();

            // Mail data
            const message = "OTP IS THIS";
            const mailData = {
                from: 'carcareecom@gmail.com',
                to: email,
                subject: 'OTP FROM CAR CARE',
                html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration} hour(s)</b>.</p>`,
            }

            // Sending mail
            transporter.sendMail(mailData, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Success');
            });

            res.render('user/emailverification',{error:req.session.error});
        } catch (error) {
            console.error(error);
            res.status(500).send("Error sending OTP");
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
                res.redirect('/user/signup');
            } else {
                // Invalid OTP
                req.session.error = "The OTP is invalid.";
                console.log("INVALIIIIIIEDD");
                req.flash('error',"OTP IS INVALID")
                res.render('user/emailverification',{error:req.session.error});
            }
        } catch (error) {
            console.error(error);
    
            // Handle errors here, e.g., redirect to an error page or send an error response
            res.status(500).render('error', { error: "Error during OTP validation" });
        }
    },
    resendOtp:async (req,res)=>{
           
            try {
                const generateOTP = () => {
                    return `${Math.floor(1000 + Math.random() * 9000)}`;
                }
                const matchedOTPrecord = await OTP.findOne({ email: req.session.email });
                if(matchedOTPrecord){
                    email = req.session.email
                    let otpToBeSent= await generateOTP()
                    matchedOTPrecord.otp = otpToBeSent
                const duration = 1; // Set the OTP expiration duration in hours
                // const newOTP = new OTP({
                //     email: email,
                //     otp: otpToBeSent,
                //     createdAt: Date.now(),
                //     expiresAt: Date.now() + duration * 3600 * 1000, // Convert hours to milliseconds
                // });
    
                // Save the OTP record to the database
                // const createdOTPRecord = await newOTP.save();
    
                // Mail data
                const message = "OTP IS THIS";
                const mailData = {
                    from: 'carcareecom@gmail.com',
                    to: email,
                    subject: 'OTP FROM CAR CARE',
                    html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration} hour(s)</b>.</p>`,
                }
    
                // Sending mail
                transporter.sendMail(mailData, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Success');
                });
    
                res.render('user/emailverification',{error:req.session.error});
                }
                
            } catch (error) {
                console.error(error);
                res.status(500).send("Error sending OTP");
            }
            
    },
    
    productPage: (req, res) => {
        res.render('user/productPage')
    },
    homeByLogin: (req, res) => {
        res.render('user/home')
    },
    getSignup: (req, res) => {
        // const error = req.session.error
        res.render('user/signup', { message: req.flash(),email:req.session.email })
    },
    postSignup: async (req, res) => {
        req.body.Email = req.session.email
        if (req.body.Password === req.body.confirmPassword) {

            try {
                req.body.Password = bcrypt.hashSync(req.body.Password, 10)
                const userData = await Users.create(req.body)
                console.log(userData);
                if (userData) {
                    const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                    res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                    res.render('user/landingPage', { user: true })
                }else{
                    console.log("anirudh");
                }
            } catch (error) {
                console.log(error);
                if (error.code === 11000) {
                    req.session.error = "USer exists"
                    res.redirect('/user/signup')
                }
            }
        } else {

            req.flash('error', "password not matching")
            res.redirect('/user/signup')
        }
    },
    postLogin: (req, res) => {

    }
}

