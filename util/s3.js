const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Upload file to S3
exports.uploadFile = async (filePath, keyName) => {
  const fileStream = fs.createReadStream(filePath);
  const params = {
    Bucket: BUCKET_NAME,
    Key: keyName,
    Body: fileStream,
    ContentType: "image/jpeg" // adjust if you allow other formats
  };

  try {
    await s3.send(new PutObjectCommand(params));
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${keyName}`;
  } catch (err) {
    throw new Error(err);
  }
};

// Delete file from S3
exports.deleteFile = async (keyName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: keyName
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
  } catch (err) {
    console.error("S3 Delete Error:", err);
  }
};
