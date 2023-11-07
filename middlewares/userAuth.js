const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')
require('dotenv').config()

module.exports = {
    userTokenAuth: async (req, res, next) => {

        const token = req.cookies.userJwt
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
                if (err) {
                    res.redirect("/")
                }
                else {

                    req.session.user = user;
                    const userData = await User.findOne({ _id: user.user })
                    console.log("inside token", user)
                    if (userData.Status === "Active") {
                        next()
                    }
                    else {
                        res.redirect("/login")
                    }
                }
            })
        } else {
            res.redirect('/login')
        }

    },

    userExist: (req, res, next) => {
        try {
            const token = req.cookies.userJwt;
            if (token) {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,async (err, user) => {
                    if (err) {
    
                        next();
                    }
                    else {
                        req.session.user = user;
                        const userData = await User.findOne({ _id: user.user })
                        console.log("inside token", user)
                        if(userData){
                        if (userData.Status === "Active") {
                            res.redirect('/home');
                        }else{
                            // res.redirect('/login')
                            next()
                        }
                    }
                    }
                })
    
            } else {
               next()
            }
            
        } catch (error) {
            next()
        }
        // userStatus :async (req,res,next)=>{


        //     const email = req.session.user
        //     const userData = await User.findOne({Email:email})
        //     if(userData.Status === 'Active')
        //     {
        //         next()
        //     }else
        //     {   
        //         req.flash('banned','You are banned by the Admin ')
        //         res.redirect('/login')
        //     }
        // }

    }


}



