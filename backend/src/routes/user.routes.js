const Router = require('express').Router;
const router = Router();
const {registerUser} = require('../controllers/user.controller.js');
const {loginUser} = require('../controllers/user.controller.js');
const {verifyJWT} = require('../middlewares/auth.middleware.js');
const {logoutUser} = require('../controllers/user.controller.js');
const upload = require('../middlewares/multer.middleware.js');
const {refreshToken} = require('../controllers/user.controller.js');
const{changePassword, getCurrentUser,updateAccountDetails, updateAvatar, updateCoverImage} = require('../controllers/user.controller.js');
router.post('/register', upload.fields(
    [
        { name: 'avatar', maxCount: 1 }, 
        { name: 'coverImage', maxCount: 1 }
    ]
), registerUser); // middleware to handle file uploads for avatar and coverImage fields, then call registerUser controller function
router.post('/login', loginUser); // route for user login
router.post('/logout', verifyJWT, logoutUser); // route for user logout, protected by JWT verification middleware
router.post('/refresh-token', refreshToken); // route for refreshing JWT tokens
router.post('/update-password', verifyJWT, changePassword); // route for updating user password, protected by JWT verification middleware
router.get('/current-user', verifyJWT, getCurrentUser); // route for getting current user profile, protected by JWT verification middleware
router.put('/update-account', verifyJWT, updateAccountDetails); // route for updating user account details, protected by JWT verification middleware
router.put('/update-avatar', verifyJWT, upload.single('avatar'), updateAvatar);
router.put('/update-cover-image', verifyJWT, upload.single('coverImage'), updateCoverImage);

module.exports = router;