const Router = require('express').Router;
const router = Router();
const {registerUser} = require('../controllers/user.controller.js');
const {loginUser} = require('../controllers/user.controller.js');
const {verifyJWT} = require('../middlewares/auth.middleware.js');
const {logoutUser} = require('../controllers/user.controller.js');
const upload = require('../middlewares/multer.middleware.js');
const {refreshToken} = require('../controllers/user.controller.js');
router.post('/register', upload.fields(
    [
        { name: 'avatar', maxCount: 1 }, 
        { name: 'coverImage', maxCount: 1 }
    ]
), registerUser); // middleware to handle file uploads for avatar and coverImage fields, then call registerUser controller function
router.post('/login', loginUser); // route for user login
router.post('/logout', verifyJWT, logoutUser); // route for user logout, protected by JWT verification middleware
router.post('/refresh-token', refreshToken); // route for refreshing JWT tokens

module.exports = router;