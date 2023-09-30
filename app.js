const express = require("express");
const path = require("path");
const session = require("express-session");
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const app = express();
const nodemailer =require('nodemailer')
const flash = require('express-flash')
require('./config/dbconnection')
require("dotenv").config();


app.set('view engine', 'ejs')

app.set('views', path.join(__dirname,'views'))

console.log(__dirname);
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser());
app.use(flash())

const maxAge = 3 * 24 * 60 * 1000
const SECRET = process.env.SECRET || "HIII"


app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: maxAge}
}))

const adminRouter = require('./router/adminRouter')
const userRouter = require('./router/userRouter');

app.use('/', userRouter)
app.use('/admin', adminRouter)


const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`server started at PORT ${PORT}`);
});
