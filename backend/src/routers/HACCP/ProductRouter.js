const express = require('express');
const router = express.Router();
const Product = require('../../models/HACCP/ProductModel');
const user = require('../../models/AccountCreation/UserModel');
// const authMiddleWare = require('../../middleware/auth');
// router.use(authMiddleWare); // Perform authentication checks using the attached user information

// * Create a new Product document
router.post('/create-product', async (req, res) => {
  try {
    const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')
    const productData = req.body;
    const createdBy = req.body.createdBy
    const createdProduct = new Product({
      ...productData,
      CreatedBy: createdBy,
      CreationDate: new Date(),
      ProductDetails: req.body.ProductDetails,
      UserDepartment: requestUser.Department._id,
      User: requestUser
    });
    await createdProduct.save();
    res.status(200).json({ status: true, message: "Product document created successfully", data: createdProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Product document', error: error.message });
  }
});

// * Get all Product documents
router.get('/get-all-products', async (req, res) => {
  try {
    const products = await Product.find({ UserDepartment: req.header('Authorization') }).populate('Department').populate({
      path: 'UserDepartment',
      model: 'Department'
    });
    if (!products) {
      console.log('Product documents not found');
      return res.status(404).json({ message: 'Product documents not found' });
    }
    console.log('Product documents retrieved successfully');
    res.status(200).json({ status: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Product documents', error: error.message });
  }
});

// * Get a Product document by ID
router.get('/get-product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('Department').populate({
      path: 'UserDepartment',
      model: 'Department'
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
router.delete('/delete-product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
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
    // Retrieve existing product document
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      console.log(`Product document with ID: ${productId} not found`);
      return res.status(404).json({ message: `Product document with ID: ${productId} not found` });
    }


    req.body.RevisionNo = existingProduct.RevisionNo + 1;


    const updates = {
      ...req.body,
      UpdatedBy: req.body.updatedBy,
      UpdationDate: new Date(),
      Status: 'Pending',
      ApprovedBy: null,
      ApprovalDate: null,
      DisapprovalDate: null,
      DisapprovedBy: null,
      Reason: null
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
    const approvedBy = req.body.approvedBy
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
    product.DisapprovedBy = null;
    product.ApprovedBy = approvedBy;
    product.Reason = null;
    // Save the updated Product

    await Product.findByIdAndUpdate(
      product._id,
      product,
      { new: true }
    );
    // await product.save();
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
    const disapprovedBy = req.body.disapprovedBy;
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
    product.DisapprovedBy = disapprovedBy;
    product.ApprovedBy = null
    // Save the updated Product

    await Product.findByIdAndUpdate(
      product._id,
      product,
      { new: true }
    );
    // await product.save();
    // Log successful update
    console.log(`Product with ID: ${productId} has been disapproved.`);
    res.status(200).send({ status: true, message: 'The Product has been marked as disapproved.', data: product });
  } catch (error) {
    console.error('Error while disapproving Product:', error);
    res.status(500).json({ error: 'Failed to disapprove Product', message: error.message });
  }
});

module.exports = router;