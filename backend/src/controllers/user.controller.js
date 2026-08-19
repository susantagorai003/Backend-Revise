const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/user.model');
const uploadToCloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');
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

     
    
    const refreshToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
 
        if (!incomingRefreshToken) {
            return res.status(401).json({
                message: "Refresh token is required"
            });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({
                message: "Refresh token is expired or does not match"
            });
        }

        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;

        await user.save({
            validateBeforeSave: false
        });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        };

        res.cookie("accessToken", newAccessToken, {
            ...options,
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", newRefreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Access token refreshed successfully"
        });

    } catch (error) {
        console.error("Refresh token error:", error);

        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
});

module.exports = {registerUser, loginUser, logoutUser, refreshToken};