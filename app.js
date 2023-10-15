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



const maxAge = 30 * 240 * 600 * 1000
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

app.use((err, req, res, next) => {
  // Log the error for debugging purposes
  console.error("error in the error handling middleware");
throw err
  // Send an appropriate response to the client
  res.status(500).send('Something went wrong!');
});
app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

})
app.use("*", (req,res) => {
  res.render('errorpage')
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`server started at PORT ${PORT}`);
});
