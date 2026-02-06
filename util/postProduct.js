const s3Helper = require("./s3");
const path = require("path");

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: true,
        product: { title, price, description },
        errorMessage: "Attached file is not an image.",
        validationErrors: []
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: { title, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  try {
    const s3Key = Date.now() + path.extname(image.originalname);
    const imageUrl = await s3Helper.uploadFile(image.path, s3Key);

    // Optionally, delete local temp file
    fileHelper.deleteFile(image.path);

    const product = new Product({ title, price, description, imageUrl, userId: req.user });
    await product.save();
    console.log('Created Product');
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};
