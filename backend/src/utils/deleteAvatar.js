const deleteAvatar = (avatarPath) => {
  const uploadToCloudinary = require('./cloudinary');
  return uploadToCloudinary.deleteFromCloudinary(avatarPath);
};  
module.exports = deleteAvatar;