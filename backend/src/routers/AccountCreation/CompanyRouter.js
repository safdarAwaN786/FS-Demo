const express = require('express');
const router = express.Router();
const Company = require('../../models/AccountCreation/CompanyModel'); // Replace with the actual path to your Company model
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require("fs");
const authMiddleware = require('../../middleware/auth')

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const upload = multer();

router.use(authMiddleware);

// * Upload Documents To Cloudinary
const uploadToCloudinary = (buffer) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.log(error);
            reject(new Error('Failed to upload file to Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.log('error inside uploadation' + error);
  }
};

// * Create a new Company document
router.post('/create-company',upload.single('CompanyLogo'), async (req, res) => {
  try {

    const result = await uploadToCloudinary(req.file.buffer);
    const companyData = req.body; // The Company data sent in the request body
    const createdCompany = new Company({
      ...companyData,
      CompanyLogo : result.secure_url
    });

    await createdCompany.save();
    console.log(new Date().toLocaleString() + ' ' + 'Creating Company document...');

    res.status(201).json({ status: true, message: "Company document created successfully", data: createdCompany });
    console.log(new Date().toLocaleString() + ' ' + 'CREATE Company document Successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Company document', error: error.message });
  }
});

// * Get all Company documents
router.get('/get-all-companies',  async (req, res) => {
    try {
      const companies = await Company.find();
      
      if (!companies) {
        console.log('Company documents not found');
        return res.status(404).json({ message: 'Company documents not found' });
      }
  
      console.log('Company documents retrieved successfully');
      res.status(200).json({ status: true, data: companies });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error getting Company documents', error: error.message });
    }
});

// * Get a Company document by ID
router.get('/get-company',  async (req, res) => {
    try {
      const companyId = req.body.id;
      const company = await Company.findById(companyId);
      
      if (!company) {
        console.log(`Company document with ID: ${companyId} not found`);
        return res.status(404).json({ message: `Company document with ID: ${companyId} not found` });
      }
  
      console.log(`Company document with ID: ${companyId} retrieved successfully`);
      res.status(200).json({ status: true, data: company });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error getting Company document', error: error.message });
    }
});

// * Delete a Company document by ID
router.delete('/delete-company',  async (req, res) => {
    try {
      const companyId = req.body.id;
      const deletedCompany = await Company.findByIdAndDelete(companyId);
  
      if (!deletedCompany) {
        console.log(`Company document with ID: ${companyId} not found`);
        return res.status(404).json({ message: `Company document with ID: ${companyId} not found` });
      }
  
      console.log(`Company document with ID: ${companyId} deleted successfully`);
      res.status(200).json({ status: true, message: 'Company document deleted successfully', data: deletedCompany });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting Company document', error: error.message });
    }
});

// * Delete all Company documents
router.delete('/delete-all-companies',  async (req, res) => {
    try {
        const result = await Company.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: false, message: "No Company documents found to delete!" });
        }
        res.status(200).send({ status: true, message: "All Company documents have been deleted!", data: result });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE All Company documents Successfully!');
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * Update a Company document by ID
router.patch('/update-company',  async (req, res) => {
    try {
      const companyId = req.body.id;
      const updates = req.body;
  
      const updatedCompany = await Company.findByIdAndUpdate(companyId, updates, { new: true });
  
      if (!updatedCompany) {
        console.log(`Company document with ID: ${companyId} not found`);
        return res.status(404).json({ message: `Company document with ID: ${companyId} not found` });
      }
  
      console.log(`Company document with ID: ${companyId} updated successfully`);
      res.status(200).json({ status: true, message: 'Company document updated successfully', data: updatedCompany });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating Company document', error: error.message });
    }
});

module.exports = router;