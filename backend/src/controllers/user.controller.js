const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/user.model');
const uploadToCloudinary = require('../utils/cloudinary');
const registerUser=asyncHandler(async (req, res) =>{
   // get user data from request body
   // validation of user data
   // check if user already exists : username ,email
   // check for images , check for avatar
   // upload image to cloudinary
   // create user object and save to database
   // remove password and refresh token field from response
   // check for user creation
   // return response 

   // extract user data from request body as per user model
   const {fullname, email, password, username} = req.body;
   // validate user data
    if(!fullname || !email || !password || !username) {
        return res.status(400).json({message: 'All fields are required'});
    }
    // check if user already exists
    const existingUser = await User.findOne({$or: [{email}, {username}]});
    if(existingUser) {
        return res.status(400).json({message: 'User already exists'});
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // upload images to cloudinary
    if(!avatarLocalPath) {
        return res.status(400).json({message: 'Avatar is required'});
    }
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);
    if(!avatar) {
        return res.status(500).json({message: 'Error uploading avatar'});
    }
    // create user object and save to database
    const user = await User.create(
        {fullname, email, password, username:username.toLowerCase(), avatar: avatar.url, coverImage: coverImage?.url || ""}
    );
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser) {
        return res.status(500).json({message: 'Error creating user'});
    }
    return res.status(201).json({message: 'User created successfully', user: createdUser});

});

    const loginUser = asyncHandler(async (req, res) => {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message: 'Email and password are required'});
        }
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if(!isPasswordCorrect) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        return res.status(200).json({message: 'Login successful'});

    })

    const logoutUser = asyncHandler(async (req, res) => {
        await User.findByIdAndUpdate(req.user.id, {refreshToken: null}, {new: true});
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.status(200).json({message: 'Logout successful'});
    })

    module.exports = {registerUser, loginUser, logoutUser};