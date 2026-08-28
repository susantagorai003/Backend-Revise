const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);

        // Delete local file if it exists
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

const deleteFromCloudinary = async (fileUrl) => {
    if (!fileUrl) return null;

    const uploadPath = new URL(fileUrl).pathname.split('/upload/')[1];
    if (!uploadPath) return null;

    const publicId = uploadPath
        .replace(/^v\d+\//, '')
        .replace(/\.[^/.]+$/, '');

    return cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
    });
};

uploadOnCloudinary.deleteFromCloudinary = deleteFromCloudinary;

module.exports = uploadOnCloudinary;