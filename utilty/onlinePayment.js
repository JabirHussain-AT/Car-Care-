const Razorpay = require('razorpay');
require('dotenv').config

    module.exports = {
      onlinePayment: (amount, orderId) => {
        return new Promise((resolve, reject) => {
          const instance = new Razorpay({
            key_id:process.env.KEY_ID ,
            key_secret:process.env.KEY_SECRET,
          });
    
          const options = {
            amount: amount * 100,  // amount in the smallest currency unit
            currency: 'INR',
            receipt: '' + orderId,
          };
    
          instance.orders.create(options, (err, order) => {
            if (err) {
              console.error('Error creating Razorpay order:', err);
              reject({
                success: false,
                message: 'Failed to create Razorpay order',
                error: err,
              });
            } else {
              console.log('Razorpay Order:', order);
              resolve({
                success: true,
                order,
                amount,
                razorpayReady: true, // flag
              });
            }
          });
        });
      },
      verifyPayment : (detials)=>{
        return new Promise ((resolve,reject)=>{
             
        })
      }
    }
    
