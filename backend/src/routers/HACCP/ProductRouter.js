const express = require('express');
const router = express.Router();
const Product = require('../../models/HACCP/ProductModel');
// const authMiddleWare = require('../../middleware/auth');
// router.use(authMiddleWare); // Perform authentication checks using the attached user information

// * Create a new Product document
router.post('/create-product', async (req, res) => {
  try {

    console.log(req.body);

    const productData = req.body;
    const createdBy = req.user.Name
    const createdProduct = new Product({
      ...productData,
      CreatedBy: createdBy,
      CreationDate: new Date(),
      ProductDetails: req.body.ProductDetails,
      User: req.user._id
    });
    console.log(createdProduct);

    await createdProduct.save();
    console.log(new Date().toLocaleString() + ' ' + 'Creating Product document...');

    res.status(201).json({ status: true, message: "Product document created successfully", data: createdProduct });
    console.log(new Date().toLocaleString() + ' ' + 'CREATE Product document Successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Product document', error: error.message });
  }
});

// * Get all Product documents
router.get('/get-all-products', async (req, res) => {
  try {

    const products = await Product.find().populate('Department').populate({
      path: 'User',
      model: 'User'
    });

    if (!products) {
      console.log('Product documents not found');
      return res.status(404).json({ message: 'Product documents not found' });
    }

    const productsToSend = products.filter((productObj) => productObj.User.Department.equals(req.user.Department));
    console.log(productsToSend);

    console.log('Product documents retrieved successfully');
    res.status(200).json({ status: true, data: productsToSend });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Product documents', error: error.message });
  }
});

// * Get a Product document by ID
router.get('/get-product/:productId', async (req, res) => {
  try {

    const productId = req.params.productId;
    console.log(req.params);
    const product = await Product.findById(productId).populate('Department').populate({
      path: 'User',
      model: 'User'
    });;
    if (!product) {
      console.log(`Product document with ID: ${productId} not found`);
      return res.status(404).json({ message: `Product document with ID: ${productId} not found` });
    }

    console.log(`Product document with ID: ${productId} retrieved successfully`);
    res.status(200).json({ status: true, data: product });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Product document', error: error.message });
  }
});

// * Delete a Product document by ID
router.delete('/delete-product', async (req, res) => {
  try {

    const productId = req.body.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      console.log(`Product document with ID: ${productId} not found`);
      return res.status(404).json({ message: `Product document with ID: ${productId} not found` });
    }

    console.log(`Product document with ID: ${productId} deleted successfully`);
    res.status(200).json({ status: true, message: 'Product document deleted successfully', data: deletedProduct });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting Product document', error: error.message });
  }
});

// * Delete all Product documents
router.delete('/delete-all-products', async (req, res) => {
  try {

    const result = await Product.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No Product documents found to delete!" });
    }

    res.status(200).send({ status: true, message: "All Product documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All Product documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Update a Product document by ID
router.patch('/update-product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid Product ID' });
    }

    // Retrieve existing product document
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      console.log(`Product document with ID: ${productId} not found`);
      return res.status(404).json({ message: `Product document with ID: ${productId} not found` });
    }

    // Check the status and handle revisions accordingly
    if (existingProduct.Status === 'Approved') {
      // If status is 'Approved', deny the update
      console.log(`Product document with ID: ${productId} is already approved, cannot be updated.`);
      return res.status(400).json({ message: `Product document with ID: ${productId} is already approved, cannot be updated.` });
    }

    // If status is 'Pending', do not increment revision number
    if (existingProduct.Status === 'Pending') {
      req.body.RevisionNo = existingProduct.RevisionNo;
    } else if (existingProduct.Status === 'Disapproved') {
      // If status is 'Disapproved', increment revision number
      req.body.RevisionNo = existingProduct.RevisionNo + 1;
    }

    const updates = {
      ...req.body,
      UpdatedBy: req.user.Name,
      UpdationDate: new Date(),
      Status: 'Pending'
    };

    // Perform the update
    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

    console.log(`Product document with ID: ${productId} updated successfully`);
    res.status(200).json({ status: true, message: 'Product document updated successfully', data: updatedProduct });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Product document', error: error.message });
  }
});

// * Approve Product From MongoDB Database
router.patch('/approve-product', async (req, res) => {
  try {

    const approvedBy = req.user.Name
    const productId = req.body.id;

    // Find the product by ID
    const product = await Product.findById(productId);

    // If product not found
    if (!product) {
      console.error(`Product with ID: ${productId} not found.`);
      return res.status(404).json({ error: 'Product not found.' });
    }

    // If the product is already accepted
    if (product.Status === 'Approved') {
      console.warn(`Product with ID: ${productId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'Product is already approved.' });
    }

    // Update the Product's fields
    product.ApprovalDate = new Date();
    product.Status = 'Approved';
    product.DisapprovalDate = null; // Set disapproval date to null
    product.DisapproveBy = null;
    product.ApprovedBy = approvedBy

    // Save the updated Product
    await product.save();

    // Log successful update
    console.log(`Product with ID: ${productId} has been approved.`);
    res.status(200).send({ status: true, message: 'The Product has been marked as approved.', data: product });

  } catch (error) {
    console.error('Error while approving Product:', error);
    res.status(500).json({ error: 'Failed to approve Product', message: error.message });
  }
});

// * Disapprove Product From MongoDB Database
router.patch('/disapprove-product', async (req, res) => {
  try {

    const productId = req.body.id;
    const Reason = req.body.Reason;
    const disapprovedBy = req.user.Name;
    // Find the product by ID
    const product = await Product.findById(productId);

    // If product not found
    if (!product) {
      console.error(`Product with ID: ${productId} not found.`);
      return res.status(404).json({ error: 'Product not found.' });
    }

    // If the product is already approved
    if (product.Status === 'Approved') {
      console.warn(`Product with ID: ${productId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'Product is already approved.' });
    }

    // Update the Product's fields
    product.DisapprovalDate = new Date();
    product.Status = 'Disapproved';
    product.Reason = Reason;
    product.ApprovalDate = null; // Set approval date to null
    product.DisapproveBy = disapprovedBy;
    product.ApprovedBy = 'Pending'

    // Save the updated Product
    await product.save();

    // Log successful update
    console.log(`Product with ID: ${productId} has been disapproved.`);
    res.status(200).send({ status: true, message: 'The Product has been marked as disapproved.', data: product });

  } catch (error) {
    console.error('Error while disapproving Product:', error);
    res.status(500).json({ error: 'Failed to disapprove Product', message: error.message });
  }
});

module.exports = router;