const nodemailer = require('nodemailer')
const OTP = require('../models/otpSchema')
require('dotenv').config()


//generate OTP
module.exports = {
    generateOTP : () => {
        return `${Math.floor(1000 + Math.random() * 9000)}`;
    },
    sendOTP :async (req,res,email,otpToBeSent)=>{
        try{
            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: 'carcareecom@gmail.com',
                    pass: 'cwaw orvq waai jdla'
                },
                secure: true,
            });

        const duration = 1; // Set the OTP expiration duration in hours
        const newOTP = new OTP({
            email: email,
            otp: otpToBeSent,
            createdAt: Date.now(),
            expiresAt: Date.now() + duration * 300 * 1000, // Convert hours to milliseconds
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

        res.render('user/emailverification',{error:req.session.error,user:req.session.user});
    }catch (error) {
        console.error(error);
        // res.status(500).send("Error sending OTP");
        req.flash('exists','Error Sending OTP')
        res.redirect('/signup')
    }
    },
    sendMail :async (req,res,email,content)=>{
        try{
            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: 'carcareecom@gmail.com',
                    pass: 'cwaw orvq waai jdla'
                },
                secure: true,
            });

        const duration = 1; // Set the OTP expiration duration in hours
        const newOTP = new OTP({
            email: email,
            content: content,
            createdAt: Date.now(),
            // expiresAt: Date.now() + duration * 300 * 1000, // Convert hours to milliseconds
        });

        // Save the OTP record to the database
        // const createdOTPRecord = await newOTP.save();

        // Mail data
        const message = "OTP IS THIS";
        const mailData = {
            from: 'carcareecom@gmail.com',
            to: email,
            subject: 'Order Placed -CAR CARE',
            html: ` <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>Thank You For Your Purchase</b></p><p> <b><p>${content}</p></b></p>`,
        }

        // Sending mail
        transporter.sendMail(mailData, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Success');
        });

       
    }catch (error) {
        console.error("error in sending otp",error);
       
    }
    },
    resendOTP : async (req,res,email,otpToBeSent)=>{
        try{
            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: 'carcareecom@gmail.com',
                    pass: 'cwaw orvq waai jdla'
                },
                secure: true,
            });

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
    }catch (error) {
        console.error(error);
        res.status(500).send("Error sending Otp");
       
    }


    },
    forgetOtp :async (req,res,email,otpToBeSent)=>{
        try{
            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: 'carcareecom@gmail.com',
                    pass: 'cwaw orvq waai jdla'
                },
                secure: true,
            });
           
        const duration = 1; 

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

        res.render('user/forgetPassword/forgetOtp',{message:req.session.error,userEmail:email});
    }catch (error) {
        console.error(error);
        res.status(500).send("Error sending Otp");
       
    }


    }, 
}