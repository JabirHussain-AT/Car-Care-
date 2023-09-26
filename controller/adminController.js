const Users = require('../models/userSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()



module.exports = {
    users :(req,res)=>{
        res.render('admin/admin-users')
    }

}

