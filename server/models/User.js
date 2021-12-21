const mongoose = require('mongoose');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// Using the built in crypto module
const {scryptSync, randomBytes} = require('crypto');
// Random String here (ideally at least 16bytes)

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1
    },
    password:{
        type: String,
        minlength: 5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type: Number,
        default: 0
    },
    image: String,
    token:{
        type:String
    },
    tokenExp:{
        type: Number
    }
})
 
// encryption
userSchema.pre('save', function( next ){
     var user = this;
     if(user.isModified('password')){
        const salt = randomBytes(16).toString("hex");
        const getHash =  scryptSync(user.password, salt, 32).toString("hex");
        user.password = getHash;
        next();
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    // bcrypt.compare(plainPassword, this.password, function(err, isMatch){
    //     if(err) return cb(err);
    //     cb(null, isMatch);
    // })
    console.log("Password compare here")
}

userSchema.methods.generateToken = function(cb){
    
    var user = this

    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb){
    var user = this;

    // decode token
    jwt.verify(token, 'secretToken', function(err, decoded){
        // find user with duser id
        // check if client token and db token is equal
        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user)
        
        })
    })
}
const User = mongoose.model('User', userSchema)

module.exports = {User}