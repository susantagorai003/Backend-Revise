const deleteCoverImage = (coverImagePath) => {
  const uploadToCloudinary = require('./cloudinary');
  return uploadToCloudinary.deleteFromCloudinary(coverImagePath);
}
module.exports = deleteCoverImage;