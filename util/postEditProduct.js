if (image) {
  // Delete old image from S3
  const oldKey = product.imageUrl.split('/').pop();
  await s3Helper.deleteFile(oldKey);

  // Upload new image
  const s3Key = Date.now() + path.extname(image.originalname);
  const newImageUrl = await s3Helper.uploadFile(image.path, s3Key);
  fileHelper.deleteFile(image.path);
  product.imageUrl = newImageUrl;
}
