const express = require('express')
const app = express()
const port = 4000

const bodyParser = require('body-parser')
// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// application/json
app.use(bodyParser.json())

const {User} = require('./models/User')

const config = require('./config/key')

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log("MongoDB connected!"))
.catch(err => console.log(err))

app.get('/', (req, res)=>res.send('Hello World! Good Luck!'))

app.post('/register', (req, res) => {
    // Registration info
    const user = new User(req.body)

    user.save((err, doc)=>{
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

