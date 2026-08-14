const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, "Please provide a username"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email:{
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        type: String,
        required: [true, "Please provide a fullname"],
        trim: true,
    },
    avatar:{
        type: String,
        required: true,
    },
    coverImage:{
        type: String,
        required: true,
    },
    watchHistory:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Video",
    },
    password:{
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    refreshToken:{
        type: String,
    },
},{timestamps: true});
userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: "15m"});
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_REFRESH_SECRET, {expiresIn: "7d"});
}

module.exports = mongoose.model('User', userSchema);