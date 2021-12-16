const express = require('express')
const app = express()
const port = 4000

// application/json
app.use(express.json());
// application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// Token storage
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// User model
const {User} = require('./models/User')

// DB connection key
const config = require('./config/key')

// DB connection
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log("MongoDB connected!"))
.catch(err => console.log(err))

// Main Page
app.get('/', (req, res)=>res.send('Hello World! Good Luck!'))

// Register Process
app.post('/register', (req, res) => {
    
    // Registration info
    const user = new User(req.body)
    user.save((err, userInfo)=>{
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        });
    })
})

// Login Process
app.post('/login', (req, res)=>{
    
    // check requested email from db
    User.findOne( {email: req.body.email}, (err, user)=>{
        if(!user) {
            return res.json({
                loginSuccess: false, 
                message: "No matching user for this email!"
            });
        }
        // check password for requested email
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({ loginsuccess: false, message: "Wrong password!"});
            
                // if all is correct create token
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user_id });
            })
        })    
    })
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

