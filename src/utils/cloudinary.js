import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "./ApiError";

dotenv.config({
  path: "./.env"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicIdFromUrl = (url) => {
  const urlParts = url.split('/');
  const fileNameWithExtension = urlParts.pop(); // Get the last part which is the file name with extension
  const versionPart = urlParts.pop(); // Get the version part which starts with 'v'
  const publicIdWithExtension = fileNameWithExtension.split('.').slice(0, -1).join('.'); // Remove file extension
  return urlParts.slice(urlParts.indexOf('upload') + 1).concat(publicIdWithExtension).join('/');
};


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // removes the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteOnCloudinary = async (cloudinaryPath) => {
  try {
    if (!cloudinaryPath) return false;

    const publicId = await getPublicIdFromUrl(cloudinaryPath);
    const response = await cloudinary.uploader.destroy(publicId);

    if (response.result === "ok") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error deleting old asset:", error.message);
    return false;
  }
}

export { uploadOnCloudinary, deleteOnCloudinary };
