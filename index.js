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

const { auth } = require('./middleware/auth');

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
app.post('/api/users/register', (req, res) => {
    
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
app.post('/api/users/login', (req, res)=>{
    
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

// auth는 middleware
app.get('/api/users/auth', auth, (req, res) => {

    // if something reached here, it passed authenication of
    // auth middleware
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.lastname,
        image: req.user.image
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

