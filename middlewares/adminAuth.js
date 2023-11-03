const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = {
    adminTokenAuth: async (req,res,next)=>{
        try {
            const token = req.cookies.adminJwt
            if(token){
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,admin)=>{
                    if(err){
                        res.redirect('/admin/login')
                    }else{
                        req.session.admin = admin
                        next()
                    }
                })
            }else{
                req.session.admin = false
                res.redirect('/admin/login')
            }
        } catch (error) {
            console.log(error);
            res.redirect('/admin/login')
        }
    },

    adminExist: (req, res, next) => {
        try {
            const token = req.cookies.adminJwt;
            if (token) {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                    if (err) {
                        next();
                    }
                    else {
                        res.redirect('/admin/dashboard')
                    }
                })
            }
            else {
                next();
            }
        } catch (error) {
        console.log(error);
            next();
        }
    },
}