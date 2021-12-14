const express = require('express')
const app = express()
const port = 4000

// const bodyParser = require('body-parser');
// application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({extended: true}));
// application/json
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const {User} = require('./models/User')

const config = require('./config/key')

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log("MongoDB connected!"))
.catch(err => console.log(err))

app.get('/', (req, res)=>res.send('Hello World! Good Luck!'))

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

