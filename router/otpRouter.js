// const express = require("express")
// const router = express.Router()
// const OTP = require('../models/otpSchema')

// //requesting new OTP
// router.get('/',)

// try{
//     const {email,subject , message ,duration }=req.body
// }catch{

// }


// const sendOTP = async({email,subject,message,duration =1})=>{
//     try{
//         if(!email && subject && message){
//             throw Error("Provaid values for email ,subject, message")
//         }

//     await OTP.deleteOne({email});

//     const generateOTP = await generateOTP

//     //send email


// }

// const generateOTP = async ()=>{
//     try{
//         return(otp = `${Math.floor(1000 + Math.random()*9000)}`)
//     }catch(error){

//     }

<div class="card card-cart">
    <div class="card-body">
        <div class="d-flex flex-column align-items-center justify-content-center">
            <h4 style="font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;" class="card-title">Cart Totals</h4>
        </div>

        <!-- First Table -->
        <table class="table table-borderless">
            <tbody>
                <tr> <td>Sub Total</td>
                    <td>Rs 29000</td>
                </tr>
                <!-- Table Rows Here -->
            </tbody>
        </table>

        <!-- Input Box -->
        <input type="text" class="form-control" placeholder="Apply promo code">

            <!-- Second Table -->
            <table class="table table-borderless">
                <tbody>
                    <tr>
                        <!-- Table Row Content Here -->
                        <td><h5>Total</h6></td>
                        <td>Rs 29000</td>
                    </tr>
                </tbody>
            </table>

            <!-- Button -->

            <div class="d-flex justify-content-center align-items-center"><button type="button" class="btn btn-outline-dark btn-rounded">Click me</button></div>
    </div>
</div>
        </div >
    </div >